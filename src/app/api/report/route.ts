import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { buildFullReport } from "@/lib/fullReport";
import {
  buildNumerologyReport,
  buildPanchangWhatsApp,
  languageName,
} from "@/lib/premium";
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
  supabaseConfigured,
} from "@/lib/supabaseRest";

export const runtime = "nodejs";
export const maxDuration = 60;

const WA_NUMBER = process.env.WHATSAPP_NUMBER || "919008831075";
const UPI_ID = process.env.UPI_ID || "";

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

async function composeReport(input: BirthDetailsInput) {
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

/**
 * POST /api/report
 * Body: { action?: "quote" | "generate", ...birth details, coupon?, orderId?, paid? }
 *
 * - orderId only          → fetch the status (and, once paid, the full report) of that order
 * - action "quote"        → price for a coupon + the UPI / WhatsApp hand-off links
 * - action "generate"     → return the full report when the order is free (100% coupon) or `paid: true`
 */
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const action = String(body.action ?? "quote");

  // ---- Existing order lookup ------------------------------------------------
  const orderId = clean(body.orderId, 64);
  if (orderId) {
    if (!/^[0-9a-fA-F-]{36}$/.test(orderId)) {
      return NextResponse.json({ ok: false, error: "Invalid order id" }, { status: 400 });
    }
    if (!supabaseConfigured()) {
      return NextResponse.json(
        { ok: false, error: "Order lookup is not configured yet." },
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

    const orderInput: BirthDetailsInput = {
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

    const paid = order.payment_status === "paid";
    const report = paid ? await composeReport(orderInput) : null;

    return NextResponse.json({
      ok: true,
      order: {
        id: order.id,
        paymentStatus: order.payment_status,
        language: order.language,
        languageLabel: languageName(order.language),
        reportType: order.report_type,
        fullName: order.full_name,
        birthDate: order.birth_date,
        birthPlace: order.birth_place,
        couponCode: order.coupon_code,
      },
      report: report
        ? {
            ...report,
            whatsappUrl: whatsappUrl(report.whatsappText),
          }
        : null,
    });
  }

  // ---- Fresh quote / generation --------------------------------------------
  const input = readBirth(body);
  if (!input) {
    return NextResponse.json(
      {
        ok: false,
        error: "Name, a valid date of birth and birth place are required.",
      },
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

  const price = Math.max(
    0,
    Math.round(BASE_REPORT_PRICE * (1 - discountPercent / 100))
  );
  const isFree = price === 0;
  const reference = randomUUID();
  const payLink = upiUrl(
    price,
    `Jyotish One ${input.reportType} report`,
    reference
  );

  const quote = {
    basePrice: BASE_REPORT_PRICE,
    discountPercent,
    coupon: couponCode || null,
    couponLabel,
    price,
    isFree,
    currency: "INR",
    upiIdConfigured: Boolean(UPI_ID),
    upiLink: payLink,
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
        `Amount: ₹${price}${isFree ? " (FREE)" : ""}`,
        ``,
        `Please confirm the payment details.`,
      ]
        .filter(Boolean)
        .join("\n")
    ),
  };

  if (action !== "generate") {
    return NextResponse.json({ ok: true, quote });
  }

  const paid = isFree || body.paid === true;
  if (!paid) {
    return NextResponse.json(
      { ok: false, error: "Payment is required before the full report can be generated.", quote },
      { status: 402 }
    );
  }

  const report = await composeReport(input);
  return NextResponse.json({
    ok: true,
    quote,
    report: {
      ...report,
      whatsappUrl: whatsappUrl(report.whatsappText),
    },
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    help: "POST { action: quote|generate, reportType, fullName, birthDate, birthTime, birthPlace, language, gender, coupon? } or { orderId }",
    currency: "INR",
    basePrice: BASE_REPORT_PRICE,
  });
}
