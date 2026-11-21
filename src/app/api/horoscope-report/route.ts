import { NextRequest, NextResponse } from "next/server";
import { buildFullReport, type ReportLang } from "@/lib/fullReport";
import { CITIES } from "@/lib/hinduCalendarMcp";

export const runtime = "nodejs";

const COUPONS: Record<string, number> = {
  FREE100: 100,
  NAMEFREE: 100,
  OFF10: 10,
  OFF20: 20,
  OFF30: 30,
};

const BASE_PRICE = 299;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const fullName = String(body.fullName || "").trim();
    const day = Number(body.day);
    const month = Number(body.month);
    const year = Number(body.year);
    const hour = Number(body.hour ?? 12);
    const minute = Number(body.minute ?? 0);
    const city = String(body.city || "Bengaluru");
    const gender = String(body.gender || "Other");
    const lang = (body.lang || "en") as ReportLang;
    const coupon = String(body.coupon || "").trim().toUpperCase();
    const unlock = Boolean(body.unlock);

    if (!fullName || !day || !month || !year) {
      return NextResponse.json({ ok: false, error: "Name, DOB required" }, { status: 400 });
    }

    const discount = COUPONS[coupon] ?? 0;
    const price = Math.max(0, Math.round(BASE_PRICE * (1 - discount / 100)));
    const isFree = price === 0 || discount >= 100;

    const report = await buildFullReport({
      fullName,
      day,
      month,
      year,
      hour,
      minute,
      city,
      gender,
      lang,
    });

    const waNumber = process.env.WHATSAPP_NUMBER || "919008831075";

    const requestMsg = [
      `Hi, I want the full Name + Horoscope report.`,
      ``,
      `Name: ${fullName}`,
      `DOB: ${day}/${month}/${year}`,
      `TOB: ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
      `Birth city: ${city}`,
      `Gender: ${gender}`,
      `Language: ${lang === "hi" ? "Hindi" : lang === "kn" ? "Kannada" : "English"}`,
      `Name Number: ${report.preview.nameNumber}`,
      `Life Path: ${report.preview.lifePath}`,
      coupon ? `Coupon: ${coupon}` : null,
      `Total: ₹${price}${isFree ? " (FREE)" : ""}`,
      ``,
      isFree
        ? `Please deliver the full report.`
        : `Please send payment QR and deliver report after payment.`,
    ]
      .filter(Boolean)
      .join("\n");

    const customerWaUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(requestMsg)}`;
    const deliverFull = isFree || unlock === true;

    return NextResponse.json({
      ok: true,
      price,
      isFree,
      coupon: coupon || null,
      preview: report.preview,
      cities: Object.keys(CITIES),
      customerWaUrl,
      requestMsg,
      whatsappText: deliverFull ? report.whatsappText : null,
      deliverFull,
      note: deliverFull
        ? "Full report ready — send on WhatsApp"
        : "Collect payment, then call API with unlock:true or use FREE coupon",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
