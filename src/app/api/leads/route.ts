import { NextRequest, NextResponse } from "next/server";
import { buildPreview } from "@/lib/preview";
import {
  isValidDate,
  parseBirthDate,
  parseBirthTime,
  REPORT_LANGUAGES,
  isReportType,
  type BirthDetailsInput,
} from "@/lib/report";
import { insertLead, supabaseUsesServerKey } from "@/lib/supabaseRest";

export const runtime = "nodejs";

type LeadPayload = Partial<BirthDetailsInput> & {
  email?: string;
  whatsapp?: string;
  consent?: boolean;
  source?: string;
};

function clean(value: unknown, max: number): string {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function POST(req: NextRequest) {
  let body: LeadPayload;
  try {
    body = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const reportType = isReportType(body.reportType) ? body.reportType : "horoscope";
  const fullName = clean(body.fullName, 120);
  // Panchang reads the day itself, so a name and date are optional there.
  const birthDate =
    clean(body.birthDate, 10) ||
    (reportType === "panchang" ? new Date().toISOString().slice(0, 10) : "");
  const birthTime = clean(body.birthTime, 5);
  const birthPlace = clean(body.birthPlace, 160);
  const gender = clean(body.gender, 20);
  const language = REPORT_LANGUAGES.some((l) => l.code === body.language)
    ? (body.language as BirthDetailsInput["language"])
    : "en";
  const email = clean(body.email, 160);
  const whatsapp = clean(body.whatsapp, 20);
  const consent = body.consent !== false;
  const source = clean(body.source, 40) || "home";

  const errors: string[] = [];
  if (reportType !== "panchang" && !fullName) errors.push("Full name is required.");
  if (reportType !== "panchang") {
    if (!birthDate) errors.push("Date of birth is required.");
    else {
      const parts = parseBirthDate(birthDate);
      if (!parts || !isValidDate(parts.day, parts.month, parts.year)) {
        errors.push("Date of birth is not a valid date.");
      }
    }
  }
  if (birthTime && !parseBirthTime(birthTime)) errors.push("Time of birth is invalid.");
  if (!birthPlace) errors.push("Birth place is required.");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    errors.push("Email does not look valid.");
  }
  if (whatsapp && whatsapp.replace(/\D/g, "").length < 10) {
    errors.push("WhatsApp number needs at least 10 digits.");
  }

  if (errors.length) {
    return NextResponse.json({ ok: false, error: errors[0], errors }, { status: 400 });
  }

  const input: BirthDetailsInput = {
    reportType,
    fullName,
    birthDate,
    birthTime,
    birthPlace,
    language,
    gender,
  };
  const preview = buildPreview(input);

  const row = {
    report_type: reportType,
    full_name: fullName || "Daily panchang",
    birth_date: birthDate || null,
    birth_time: birthTime || null,
    birth_place: birthPlace,
    language,
    gender: gender || null,
    contact_email: email || null,
    whatsapp_number: whatsapp || null,
    consented_at: consent ? new Date().toISOString() : null,
    payment_status: "preview" as const,
    name_number: preview.numbers.nameNumber ?? null,
    life_path: preview.numbers.lifePath ?? null,
    psychic_number: preview.numbers.psychic ?? null,
    source,
  };

  const saved = await insertLead(row);

  // The preview is the product; a storage hiccup should never block it.
  if (!saved.ok) {
    console.warn("[leads] could not store lead:", saved.error);
    return NextResponse.json({
      ok: true,
      stored: false,
      storedWith: supabaseUsesServerKey() ? "server-key" : "publishable-key",
      warning: "Preview generated but the lead could not be saved.",
      preview,
    });
  }

  const lead = Array.isArray(saved.data) ? saved.data[0] : saved.data;
  return NextResponse.json({
    ok: true,
    stored: true,
    leadId: lead?.id ?? null,
    preview,
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    help: "POST { reportType, fullName, birthDate, birthTime, birthPlace, language, gender, email?, whatsapp?, consent?, source? }",
  });
}
