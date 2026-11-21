/**
 * Full (paid) report text for numerology and a graceful panchang fallback.
 * Horoscope reports reuse the existing engine in lib/fullReport.ts.
 */

import {
  analyzeName,
  generateCorrectedNames,
  NUMBER_MEANINGS,
  reduceNumber,
  reduceToSingleDigit,
} from "./chaldean";
import { getPanchangReport } from "./hinduCalendarMcp";
import { panchangForDate } from "./panchang";
import type { ReportLang } from "./fullReport";
import type { BirthDetailsInput } from "./report";

function meaning(n: number) {
  return (
    NUMBER_MEANINGS[n] ??
    NUMBER_MEANINGS[reduceToSingleDigit(n)] ??
    NUMBER_MEANINGS[1]
  );
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

const LANG_NAME: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  kn: "Kannada",
  ta: "Tamil",
  te: "Telugu",
};

export function languageName(code: string): string {
  return LANG_NAME[code] || "English";
}

export function buildNumerologyReport(input: BirthDetailsInput): string {
  const name = input.fullName.trim();
  const [year, month, day] = (input.birthDate || "2000-01-01")
    .split("-")
    .map(Number);
  const a = analyzeName(name, day, month, year, input.gender || "Other");
  const personalYear = reduceNumber(day + month + new Date().getFullYear(), true);
  const corrected = generateCorrectedNames(name, a.targetVibration).slice(0, 5);
  const timeline = a.compatibility;

  const lines = [
    `Namaste ${name} ji 🙏`,
    ``,
    `Your *Full Name Numerology Report* (${languageName(input.language)})`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📌 BIRTH DETAILS`,
    `Name: ${name}`,
    `DOB: ${pad(day)}/${pad(month)}/${year}`,
    input.birthTime ? `TOB: ${input.birthTime}` : `TOB: not provided`,
    `Birth place: ${input.birthPlace}`,
    `Gender: ${input.gender || "prefer not to say"}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🔢 CHALDEAN CORE NUMBERS`,
    `Name Number: *${a.name.nameNumber}* (compound ${a.name.compound}) — ${a.nameMeaning.title}`,
    `Life Path: *${a.lifePath.lifePath}* (compound ${a.lifePath.compound}) — ${a.lifePathMeaning.title}`,
    `Destiny: *${a.destiny.destiny}*`,
    `Soul Urge: *${a.soulUrge.soulUrge}* (inner desire)`,
    `Personality: *${a.personality.personality}* (outer self)`,
    `Subconscious Self: *${a.subconscious}* (under pressure)`,
    `Psychic Number: *${a.psychic}* (from birth day)`,
    `Personal Year: *${personalYear}* — ${meaning(personalYear).title}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `⚖️ NAME vs LIFE PATH`,
    `Alignment: ${timeline.currentStrength}% currently`,
    `${timeline.message}`,
    `Target vibration: *${a.targetVibration}* (${meaning(a.targetVibration).title})`,
    `Corrected-name alignment: ${timeline.correctedStrength}%`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✍️ SUGGESTED SPELLINGS`,
    ...(corrected.length
      ? corrected.map(
          (c) =>
            `• ${c.spelling} → ${c.nameNumber} (compound ${c.compound}, Cheiro ${c.cheiroNumber})`
        )
      : ["• Reply here and we will prepare spelling options manually."]),
    `_Try the first option for 40 days before deciding on a legal name change._`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🪐 YOUR RULING PLANET`,
    `Planet: *${a.nameMeaning.planet}*`,
    `Lucky day: ${a.nameMeaning.luckyDay}`,
    `Lucky colours: ${a.nameMeaning.luckyColours}`,
    `Lucky numbers: ${a.nameMeaning.luckyNumbers}`,
    `Strengths: ${a.nameMeaning.strengths.join(", ")}`,
    `Watch out for: ${a.nameMeaning.challenges.join(", ")}`,
    `Supportive practice: ${a.nameMeaning.luckyDay} — donate or serve in line with ${a.nameMeaning.planet} themes, keep the day light on commitments.`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📅 LIFE-PHASE VIEW`,
    `Past: ${a.lifePathMeaning.short} themes settled early — ${a.nameMeaning.strengths[0].toLowerCase()} was visible from childhood.`,
    `Present: ${meaning(a.lifePath.lifePath).title} is the active lesson; your name number ${a.name.nameNumber} either supports or resists it.`,
    `Future: aligning your name to ${a.targetVibration} is the practical lever.`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🔍 LETTER-BY-LETTER`,
    ...a.name.letterBreakdown
      .slice(0, 40)
      .map((l, i) => `${i + 1}. ${l.letter} = ${l.value}`),
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✅ NEXT`,
    `1) Confirm spelling to use on documents`,
    `2) Reply *PDF* for the printable report`,
    `3) Reply *KUNDLI* if you also want the birth chart`,
    ``,
    `⚠️ Numerology is a traditional system for reflection, not medical, legal or financial advice.`,
    `— Jyotish One · Chaldean engine`,
  ];

  return lines.join("\n");
}

export async function buildPanchangWhatsApp(
  input: BirthDetailsInput
): Promise<{ whatsappText: string; source: "mcp" | "local"; raw?: unknown }> {
  const date = input.birthDate || new Date().toISOString().slice(0, 10);
  const city = input.birthPlace.split(",")[0].trim() || "Bengaluru";
  const lang: ReportLang =
    input.language === "hi" || input.language === "kn" ? input.language : "en";

  try {
    const result = await getPanchangReport({ date, city, lang });
    return { whatsappText: result.whatsappText, source: "mcp", raw: result.raw };
  } catch {
    const parsed = new Date(`${date}T12:00:00`);
    const p = panchangForDate(Number.isNaN(parsed.getTime()) ? new Date() : parsed);
    const lines = [
      `📅 *Panchang — ${p.date}*`,
      `📍 ${input.birthPlace}`,
      ``,
      `*Tithi:* ${p.tithi} (${p.paksha})`,
      `*Nakshatra:* ${p.nakshatra}`,
      `*Yoga:* ${p.yoga}`,
      `*Karana:* ${p.karana}`,
      `*Maas:* ${p.maas}`,
      `Vikram ${p.vikramSamvat} · Shaka ${p.shakaSamvat}`,
      ``,
      `☀️ Sunrise ${p.sunrise} · Sunset ${p.sunset}`,
      `⛔ Rahu kalam ${p.rahu.start}–${p.rahu.end}`,
      `⛔ Yama ${p.yama.start}–${p.yama.end} · Gulika ${p.gulika.start}–${p.gulika.end}`,
      `✅ Abhijit ${p.abhijit.start}–${p.abhijit.end}`,
      ``,
      `*Choghadiya (day)*`,
      ...p.choghDay.map(
        (c) => `${c.good ? "✅" : "•"} ${c.name} ${c.start}–${c.end}`
      ),
      ``,
      `*Hora*`,
      ...p.horas.map((h) => `• ${h.lord}: ${h.start}–${h.end}`),
      ``,
      `_Computed locally from traditional weekday rules. City-accurate sunrise and exact tithi endings need the panchang engine._`,
    ];
    return { whatsappText: lines.join("\n"), source: "local" };
  }
}
