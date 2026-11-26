import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildFullReport } from "@/lib/fullReport";
import {
  buildNumerologyReport,
  buildPanchangWhatsApp,
  languageName,
} from "@/lib/premium";
import { buildStructuredReport, type StructuredReport } from "@/lib/reportSections";
import {
  BASE_REPORT_PRICE,
  isReportType,
  parseBirthDate,
  parseBirthTime,
  REPORT_LANGUAGES,
  type BirthDetailsInput,
} from "@/lib/report";
import {
  findActiveCoupon,
  getOrder,
  insertOrder,
  listOrders,
  supabaseConfigured,
  updateOrder,
  type ReportOrderRow,
} from "@/lib/supabaseRest";

export const runtime = "nodejs";
export const maxDuration = 60;

const WA_NUMBER = process.env.WHATSAPP_NUMBER || "919008831075";
const UPI_ID = process.env.UPI_ID || "";

/** Owner-only actions need this; unset means the admin routes stay closed. */
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

function adminAuthorized(req: NextRequest, body?: Record<string, unknown>) {
  if (!ADMIN_TOKEN) return false;
  const header = req.headers.get("x-admin-token") || "";
  const fromBody = body ? String(body.adminToken ?? "") : "";
  return header === ADMIN_TOKEN || fromBody === ADMIN_TOKEN;
}

/* ------------------------------------------------------------------ helpers */

function clean(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

function whatsappUrl(text: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
}

function upiUrl(amount: number, note: string, ref: string) {
  if (!UPI_ID) return null;
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: "Jyotish One",
    am: String(amount),
    cu: "INR",
    tn: note.slice(0, 48),
    tr: ref.slice(0, 35),
  });
  return `upi://pay?${params.toString()}`;
}

function readBirth(body: Record<string, unknown>): BirthDetailsInput | null {
  const reportType = isReportType(String(body.reportType ?? ""))
    ? (String(body.reportType) as BirthDetailsInput["reportType"])
    : "horoscope";
  const input: BirthDetailsInput = {
    reportType,
    fullName: clean(body.fullName, 120),
    birthDate: clean(body.birthDate, 10),
    birthTime: clean(body.birthTime, 5),
    birthPlace: clean(body.birthPlace, 160) || "Bengaluru, India",
    language: (REPORT_LANGUAGES.some((l) => l.code === body.language)
      ? String(body.language)
      : "en") as BirthDetailsInput["language"],
    gender: clean(body.gender, 20),
  };
  if (!input.fullName) return null;
  if (reportType !== "panchang" && !parseBirthDate(input.birthDate)) return null;
  if (input.birthTime && !parseBirthTime(input.birthTime)) return null;
  return input;
}

function inputFromOrder(order: ReportOrderRow): BirthDetailsInput {
  return {
    reportType: order.report_type,
    fullName: order.full_name,
    birthDate: order.birth_date ?? "",
    birthTime: order.birth_time ? order.birth_time.slice(0, 5) : "",
    birthPlace: order.birth_place ?? "Bengaluru, India",
    language: (REPORT_LANGUAGES.some((l) => l.code === order.language)
      ? order.language
      : "en") as BirthDetailsInput["language"],
    gender: order.gender ?? "",
  };
}

/** The flat WhatsApp text that the WhatsApp button opens. */
async function composeWhatsAppText(input: BirthDetailsInput) {
  if (input.reportType === "numerology") {
    return { whatsappText: buildNumerologyReport(input), source: "chaldean" };
  }
  if (input.reportType === "panchang") {
    const result = await buildPanchangWhatsApp(input);
    return { whatsappText: result.whatsappText, source: result.source };
  }
  const date = parseBirthDate(input.birthDate)!;
  const time = parseBirthTime(input.birthTime) ?? { hour: 12, minute: 0 };
  const report = await buildFullReport({
    fullName: input.fullName,
    day: date.day,
    month: date.month,
    year: date.year,
    hour: time.hour,
    minute: time.minute,
    city: input.birthPlace.split(",")[0].trim() || "Bengaluru",
    gender: input.gender || "Other",
    lang:
      input.language === "hi" || input.language === "kn" ? input.language : "en",
  });
  return { whatsappText: report.whatsappText, source: "mcp" };
}

async function fullReportPayload(input: BirthDetailsInput) {
  const structured: StructuredReport = buildStructuredReport(input);
  const flat = await composeWhatsAppText(input);
  return {
    structured,
    whatsappText: flat.whatsappText,
    whatsappUrl: whatsappUrl(flat.whatsappText),
    source: flat.source,
  };
}

function priceFor(discountPercent: number) {
  return Math.max(0, Math.round(BASE_REPORT_PRICE * (1 - discountPercent / 100)));
}

/** Base price for a stored order (panchang is the cheaper product). */
function baseAmountFor(order: ReportOrderRow) {
  return order.report_type === "panchang" ? 149 : BASE_REPORT_PRICE;
}

/**
 * What this order actually costs, coupon included.
 *
 * The coupon was validated when the order was created, but that discount used
 * to be forgotten afterwards: the report page then asked for the full price
 * and the customer paid more than the checkout had quoted. Re-read the coupon
 * here so the amount is always derived from the order, not from the request.
 */
async function amountFor(order: ReportOrderRow): Promise<number> {
  const base = baseAmountFor(order);
  if (!order.coupon_code) return base;
  const coupon = await findActiveCoupon(order.coupon_code);
  if (!coupon) return base;
  return priceFor(coupon.discount_percent);
}

/* ---------------------------------------------------------------------- POST */

/**
 * POST /api/report
 *
 * Body is one of:
 *   { action: "create", ...birth details, coupon?, email?, whatsapp?, leadId? }
 *   { action: "quote",  ...birth details, coupon? }
 *   { action: "generate", ...birth details, coupon?, paid? }
 *   { action: "pay-intent", orderId, email?, whatsapp? }
 *   { action: "claim-paid", orderId, paymentReference, note? }
 *   { action: "generate-for-order", orderId }
 *   { action: "status", orderId }            (alias of GET below)
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const action = String(body.action ?? "quote");
  const orderId = clean(body.orderId, 64);

  /* --------------------------------------------------------- owner actions */
  if (action === "admin-list") {
    if (!adminAuthorized(req, body)) {
      return NextResponse.json({ ok: false, error: "Not authorised" }, { status: 401 });
    }
    const listed = await listOrders(80);
    if (!listed.ok) {
      return NextResponse.json({ ok: false, error: listed.error }, { status: 500 });
    }
    const rows = await Promise.all(
      (listed.data ?? []).map(async (row) => ({
        ...serializeOrder(row),
        paymentReference: row.payment_reference,
        amount: await amountFor(row),
      }))
    );
    return NextResponse.json({ ok: true, orders: rows });
  }

  if (action === "unlock") {
    if (!adminAuthorized(req, body)) {
      return NextResponse.json({ ok: false, error: "Not authorised" }, { status: 401 });
    }
    const target = clean(body.orderId, 64);
    if (!/^[0-9a-fA-F-]{36}$/.test(target)) {
      return NextResponse.json({ ok: false, error: "Invalid order id" }, { status: 400 });
    }
    const updated = await updateOrder(target, { payment_status: "paid" });
    if (!updated.ok) {
      return NextResponse.json({ ok: false, error: updated.error }, { status: 500 });
    }
    return NextResponse.json({ ok: true, orderId: target, reportUrl: `/report/${target}` });
  }

  if (action === "admin-enabled") {
    return NextResponse.json({ ok: true, enabled: Boolean(ADMIN_TOKEN) });
  }

  /* One-shot write self-check. Requires ADMIN_TOKEN, creates a clearly marked
     row through the same insertOrder path the checkout uses, and returns only
     booleans plus the new id so it can be deleted afterwards. */
  if (action === "admin-write-check") {
    if (!adminAuthorized(req, body)) {
      return NextResponse.json({ ok: false, error: "Not authorised" }, { status: 401 });
    }
    const inserted = await insertOrder({
      report_type: "numerology",
      full_name: "STORAGE SELF-CHECK (safe to delete)",
      birth_date: null,
      birth_time: null,
      birth_place: null,
      language: "en",
      gender: null,
      contact_email: null,
      whatsapp_number: null,
      payment_status: "preview",
      coupon_code: null,
      source: "self-check",
      consented_at: new Date().toISOString(),
    });
    if (!inserted.ok) {
      return NextResponse.json({ ok: false, wrote: false }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      wrote: true,
      id: inserted.data?.[0]?.id ?? null,
    });
  }

  /* ---------------------------------------------------------- order actions */
  if (orderId) {
    if (!/^[0-9a-fA-F-]{36}$/.test(orderId)) {
      return NextResponse.json({ ok: false, error: "Invalid order id" }, { status: 400 });
    }
    if (!supabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Orders are not configured yet." },
        { status: 503 }
      );
    }
    const found = await getOrder(orderId);
    if (!found.ok) {
      return NextResponse.json({ ok: false, error: found.error }, { status: 500 });
    }
    const order = found.data?.[0];
    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
    }
    const input = inputFromOrder(order);
    const reportUrl = `/report/${order.id}`;

    if (action === "status") {
      return NextResponse.json({
        ok: true,
        order: serializeOrder(order),
        reportUrl,
      });
    }

    if (action === "pay-intent") {
      const email = clean(body.email, 160);
      const whatsapp = clean(body.whatsapp, 20);
      const patch: Partial<ReportOrderRow> = { payment_status: "pending" };
      if (email) patch.contact_email = email;
      if (whatsapp) patch.whatsapp_number = whatsapp;
      await updateOrder(order.id, patch);

      const amount = await amountFor(order);
      const reference = order.id.slice(0, 8).toUpperCase();
      const payMessage = [
        `Hi, I want to pay for my ${order.report_type} report.`,
        `Name: ${order.full_name}`,
        `Amount: ₹${amount}`,
        `Reference: ${reference}`,
        "",
        "Please share your UPI / QR so I can pay.",
      ].join("\n");

      return NextResponse.json({
        ok: true,
        order: { ...serializeOrder(order), paymentStatus: "pending" },
        payment: {
          amount,
          currency: "INR",
          reference,
          upiLink: upiUrl(amount, `Jyotish One ${order.report_type} report`, order.id),
          upiIdConfigured: Boolean(UPI_ID),
          whatsappUrl: whatsappUrl(payMessage),
        },
        reportUrl,
      });
    }

    /* Customer says they have paid. We record the UPI/UTR reference and leave the
       order pending: the owner verifies the money in their own bank app, then
       unlocks from the admin queue. Never auto-unlock on a self-reported amount. */
    if (action === "claim-paid") {
      const reference = clean(body.paymentReference, 40);
      const note = clean(body.note, 300);
      if (reference.length < 4) {
        return NextResponse.json(
          {
            ok: false,
            error:
              "Enter the UPI / transaction reference from your payment app so we can match it.",
          },
          { status: 400 }
        );
      }
      const updated = await updateOrder(order.id, {
        payment_status: "pending",
        payment_reference: note ? `${reference} | ${note}` : reference,
      });
      if (!updated.ok) {
        return NextResponse.json({ ok: false, error: updated.error }, { status: 500 });
      }
      const adminMessage = [
        `I have paid for my ${order.report_type} report.`,
        `Name: ${order.full_name}`,
        `Amount: ₹${await amountFor(order)}`,
        `Reference: ${order.id.slice(0, 8).toUpperCase()}`,
        `Payment ref: ${reference}`,
        "",
        "I have attached the payment screenshot.",
      ].join("\n");
      return NextResponse.json({
        ok: true,
        paymentStatus: "pending",
        message:
          "Thanks — we are verifying your payment. This page unlocks within a few minutes once it is confirmed.",
        whatsappUrl: whatsappUrl(adminMessage),
        reportUrl,
      });
    }

    if (action === "generate-for-order") {
      if (order.payment_status !== "paid") {
        return NextResponse.json(
          { ok: false, error: "This report has not been paid for yet.", paymentStatus: order.payment_status },
          { status: 402 }
        );
      }
      const report = await fullReportPayload(input);
      return NextResponse.json({ ok: true, order: serializeOrder(order), report });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown order action "${action}"` },
      { status: 400 }
    );
  }

  /* ------------------------------------------------------- create an order */
  if (action === "create") {
    const input = readBirth(body);
    if (!input) {
      return NextResponse.json(
        { ok: false, error: "Name, a valid date of birth and birth place are required." },
        { status: 400 }
      );
    }
    if (!supabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Order storage is not configured yet." },
        { status: 503 }
      );
    }

    const couponCode = clean(body.coupon, 32).toUpperCase();
    let discountPercent = 0;
    if (couponCode) {
      const coupon = await findActiveCoupon(couponCode);
      if (!coupon) {
        return NextResponse.json(
          { ok: false, error: "That coupon is not valid or has expired." },
          { status: 400 }
        );
      }
      discountPercent = coupon.discount_percent;
    }
    const price = priceFor(discountPercent);
    const isFree = price === 0;

    const created = await insertOrder({
      report_type: input.reportType,
      full_name: input.fullName,
      birth_date: input.birthDate || null,
      birth_time: input.birthTime || null,
      birth_place: input.birthPlace,
      language: input.language,
      gender: input.gender || null,
      contact_email: clean(body.email, 160) || null,
      whatsapp_number: clean(body.whatsapp, 20) || null,
      consented_at: new Date().toISOString(),
      payment_status: isFree ? "paid" : "preview",
      coupon_code: couponCode || null,
      source: clean(body.source, 40) || "checkout",
    });

    if (!created.ok) {
      return NextResponse.json({ ok: false, error: created.error }, { status: 500 });
    }
    const order = Array.isArray(created.data) ? created.data[0] : created.data;
    if (!order?.id) {
      return NextResponse.json(
        { ok: false, error: "Order was created but no id came back." },
        { status: 500 }
      );
    }

    // A 100% coupon means there is nothing to pay: hand the report over now.
    if (isFree) {
      const report = await fullReportPayload(input);
      return NextResponse.json({
        ok: true,
        free: true,
        order: serializeOrder(order),
        price,
        reportUrl: `/report/${order.id}`,
        report,
      });
    }

    return NextResponse.json({
      ok: true,
      free: false,
      order: serializeOrder(order),
      price,
      discountPercent,
      reportUrl: `/report/${order.id}`,
    });
  }

  /* ------------------------------------------------------------ quote only */
  if (action === "quote") {
    const input = readBirth(body);
    if (!input) {
      return NextResponse.json(
        { ok: false, error: "Name, a valid date of birth and birth place are required." },
        { status: 400 }
      );
    }
    const couponCode = clean(body.coupon, 32).toUpperCase();
    let discountPercent = 0;
    let couponLabel: string | null = null;
    if (couponCode) {
      const coupon = await findActiveCoupon(couponCode);
      if (!coupon) {
        return NextResponse.json(
          { ok: false, error: "That coupon is not valid or has expired." },
          { status: 400 }
        );
      }
      discountPercent = coupon.discount_percent;
      couponLabel = coupon.label;
    }
    const price = priceFor(discountPercent);
    const reference = randomUUID();
    return NextResponse.json({
      ok: true,
      quote: {
        basePrice: BASE_REPORT_PRICE,
        discountPercent,
        coupon: couponCode || null,
        couponLabel,
        price,
        isFree: price === 0,
        currency: "INR",
        upiIdConfigured: Boolean(UPI_ID),
        upiLink: upiUrl(price, `Jyotish One ${input.reportType} report`, reference),
        reference,
        whatsappUrl: whatsappUrl(
          [
            `Hi, I'd like the full ${input.reportType} report.`,
            ``,
            `Name: ${input.fullName}`,
            input.birthDate ? `DOB: ${input.birthDate}` : null,
            input.birthTime ? `TOB: ${input.birthTime}` : null,
            `Place: ${input.birthPlace}`,
            `Language: ${languageName(input.language)}`,
            couponCode ? `Coupon: ${couponCode}` : null,
            `Amount: ₹${price}${price === 0 ? " (FREE)" : ""}`,
            ``,
            `Please confirm the payment details.`,
          ]
            .filter(Boolean)
            .join("\n")
        ),
      },
    });
  }

  /* ------------------------------------------------ legacy direct generate */
  if (action === "generate") {
    const input = readBirth(body);
    if (!input) {
      return NextResponse.json(
        { ok: false, error: "Name, a valid date of birth and birth place are required." },
        { status: 400 }
      );
    }
    const couponCode = clean(body.coupon, 32).toUpperCase();
    let discountPercent = 0;
    if (couponCode) {
      const coupon = await findActiveCoupon(couponCode);
      if (!coupon) {
        return NextResponse.json(
          { ok: false, error: "That coupon is not valid or has expired." },
          { status: 400 }
        );
      }
      discountPercent = coupon.discount_percent;
    }
    const price = priceFor(discountPercent);
    if (price > 0 && body.paid !== true) {
      return NextResponse.json(
        { ok: false, error: "Payment is required before the full report can be generated." },
        { status: 402 }
      );
    }
    const report = await fullReportPayload(input);
    return NextResponse.json({ ok: true, price, report });
  }

  return NextResponse.json(
    { ok: false, error: `Unknown action "${action}".` },
    { status: 400 }
  );
}

/* ----------------------------------------------------------------------- GET */

function serializeOrder(order: ReportOrderRow) {
  return {
    id: order.id,
    reportType: order.report_type,
    fullName: order.full_name,
    birthDate: order.birth_date,
    birthTime: order.birth_time,
    birthPlace: order.birth_place,
    language: order.language,
    languageLabel: languageName(order.language),
    gender: order.gender,
    paymentStatus: order.payment_status,
    couponCode: order.coupon_code,
    createdAt: order.created_at,
  };
}

/** GET /api/report?orderId=…  → order status (used by the report page). */
export async function GET(req: NextRequest) {
  const orderId = clean(req.nextUrl.searchParams.get("orderId"), 64);
  if (!orderId) {
    const help = {
      ok: true,
      help: "POST { action: create|quote|generate|pay-intent|claim-paid|generate-for-order, ... } or GET ?orderId=…",
      currency: "INR",
      basePrice: BASE_REPORT_PRICE,
    } as Record<string, unknown>;

    /* ?probe=1 — a read-only "can this deployment actually talk to the
       database?" check. Booleans only; no keys, rows or error strings. */
    if (req.nextUrl.searchParams.get("probe") === "1") {
      help.storage = {
        configured: supabaseConfigured(),
        readable: false,
        adminUnlock: Boolean(ADMIN_TOKEN),
      };
      const probe = await listOrders(1);
      (help.storage as Record<string, unknown>).readable = probe.ok;

      /* ?probe=1&coupon=CODE — proves whether the live deployment can resolve
         a coupon at all. Reports only booleans and the discount, never the
         table contents. */
      const probeCoupon = clean(req.nextUrl.searchParams.get("coupon"), 32);
      if (probeCoupon) {
        const found = await findActiveCoupon(probeCoupon);
        (help.storage as Record<string, unknown>).couponLookup = {
          tried: probeCoupon.toUpperCase(),
          resolved: Boolean(found),
          discountPercent: found?.discount_percent ?? null,
          expiresAt: found?.expires_at ?? null,
          serverTime: new Date().toISOString(),
        };
      }
      if (!probe.ok) {
        const reason = probe.error.toLowerCase();
        (help.storage as Record<string, unknown>).reason = reason.includes("fetch failed")
          ? "network"
          : reason.includes("permission") || reason.includes("row-level")
            ? "permission"
            : "unknown";
      }
    }
    return NextResponse.json(help);
  }
  if (!/^[0-9a-fA-F-]{36}$/.test(orderId) || !supabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "Order lookup unavailable" }, { status: 400 });
  }
  const found = await getOrder(orderId);
  if (!found.ok) {
    return NextResponse.json({ ok: false, error: found.error }, { status: 500 });
  }
  const order = found.data?.[0];
  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    order: serializeOrder(order),
    reportUrl: `/report/${order.id}`,
  });
}
