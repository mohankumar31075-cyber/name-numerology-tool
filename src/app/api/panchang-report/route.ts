import { NextRequest, NextResponse } from "next/server";
import {
  getPanchangReport,
  getMuhurtaReport,
  getBirthDetailsReport,
  getFestivalReport,
  CITIES,
} from "@/lib/hinduCalendarMcp";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = (body.type || "panchang") as string;
    const city = body.city || "Bengaluru";
    const lang = body.lang || "en";

    let result: { whatsappText: string; raw?: unknown };

    if (type === "panchang") {
      const date = body.date || new Date().toISOString().slice(0, 10);
      result = await getPanchangReport({ date, city, lang });
    } else if (type === "muhurta") {
      const time = body.time || new Date().toISOString().replace(/\.\d{3}Z$/, "+05:30");
      result = await getMuhurtaReport({ timeIso: time, city, fullDay: true, lang });
    } else if (type === "birth") {
      if (!body.time) {
        return NextResponse.json({ error: "time (ISO birth datetime) required" }, { status: 400 });
      }
      result = await getBirthDetailsReport({ timeIso: body.time, city });
    } else if (type === "festival") {
      const year = Number(body.year) || new Date().getFullYear();
      result = await getFestivalReport({ year, festival: body.festival, city });
    } else {
      return NextResponse.json({ error: "type must be panchang|muhurta|birth|festival" }, { status: 400 });
    }

    const waNumber = process.env.WHATSAPP_NUMBER || "919008831075";
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(result.whatsappText)}`;

    return NextResponse.json({
      ok: true,
      type,
      city,
      cities: Object.keys(CITIES),
      whatsappText: result.whatsappText,
      whatsappUrl: waUrl,
      credit: "hinducalendar.app",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = sp.get("type") || "panchang";
  const date = sp.get("date") || new Date().toISOString().slice(0, 10);
  const city = sp.get("city") || "Bengaluru";
  const lang = sp.get("lang") || "en";

  try {
    if (type === "panchang") {
      const result = await getPanchangReport({ date, city, lang });
      return NextResponse.json({ ok: true, whatsappText: result.whatsappText, raw: result.raw });
    }
    return NextResponse.json({
      ok: true,
      help: "POST { type: panchang|muhurta|birth|festival, date, city, time, year, festival, lang }",
      cities: Object.keys(CITIES),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
