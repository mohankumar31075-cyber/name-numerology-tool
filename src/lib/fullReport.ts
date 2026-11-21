/**
 * Full Name + Horoscope WhatsApp report generator
 */

import {
  getNameNumber,
  getLifePath,
  getSoulUrge,
  getPersonality,
  getNameDestiny,
  generateCorrectedNames,
} from "./chaldean";
import { CITIES, getBirthDetailsReport } from "./hinduCalendarMcp";
import { buildVimshottari, nakshatraLord } from "./dasha";

export type ReportLang = "en" | "hi" | "kn";

export type ReportInput = {
  fullName: string;
  day: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  city: string;
  gender: string;
  lang: ReportLang;
};

const MEANING: Record<number, string> = {
  1: "Leadership, independence, new starts",
  2: "Partnership, sensitivity, diplomacy",
  3: "Creativity, communication, expression",
  4: "Structure, hard work, stability",
  5: "Freedom, change, adaptability",
  6: "Responsibility, care, harmony",
  7: "Analysis, spirituality, research",
  8: "Karma, authority, material results",
  9: "Compassion, completion, humanitarian",
  11: "Intuition, inspiration (master)",
  22: "Master builder, large vision",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export async function buildFullReport(input: ReportInput): Promise<{
  whatsappText: string;
  preview: Record<string, unknown>;
}> {
  const { fullName, day, month, year, hour, minute, city, gender, lang } = input;
  const nameInfo = getNameNumber(fullName);
  const life = getLifePath(day, month, year);
  const soul = getSoulUrge(fullName);
  const pers = getPersonality(fullName);
  const destiny = getNameDestiny(fullName);
  const corrected = generateCorrectedNames(fullName, 6).slice(0, 4);

  const loc = CITIES[city] || CITIES.Bengaluru;
  const timeIso = `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00+05:30`;

  let birth: {
    nakshatra?: string;
    pada?: string;
    naamAkshar?: string;
    chandra?: string;
    lagna?: string;
  } = {};

  try {
    const b = await getBirthDetailsReport({ timeIso, city, lat: loc.lat, lon: loc.lon });
    const raw = b.raw as Record<string, unknown>;
    const nak = raw.nakshatra as { name?: string } | undefined;
    const pada = raw.pada as { index?: number; naam_akshar?: string } | undefined;
    const ch = raw.chandra_rashi as { name?: string } | undefined;
    const lg = raw.lagna_rashi as { name?: string } | undefined;
    birth = {
      nakshatra: nak?.name || String(raw.nakshatra || "—"),
      pada: pada?.index != null ? String(pada.index) : "—",
      naamAkshar: pada?.naam_akshar || "—",
      chandra: ch?.name || "—",
      lagna: lg?.name || "—",
    };
  } catch {
    birth = { nakshatra: "—", pada: "—", naamAkshar: "—", chandra: "—", lagna: "—" };
  }

  const birthDate = new Date(year, month - 1, day, hour, minute);
  const lord = nakshatraLord(birth.nakshatra);
  const balance = lord === "Ketu" ? 1.2 : 3.5;
  const dasha = buildVimshottari(birthDate, lord, balance);

  const lpMean = MEANING[life.lifePath] || "";
  const nnMean = MEANING[nameInfo.nameNumber] || "";

  const dashaLines = dasha.rows.slice(0, 8).map((r) => `• ${r.name}: ${r.fromStr} → ${r.toStr}`);

  const lines = [
    `Namaste ${fullName} ji 🙏`,
    ``,
    `Your *Full Name + Horoscope Report* (${lang === "hi" ? "Hindi" : lang === "kn" ? "Kannada" : "English"})`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📌 BIRTH DETAILS`,
    `Name: ${fullName}`,
    `DOB: ${day}/${month}/${year}`,
    `TOB: ${pad(hour)}:${pad(minute)}`,
    `Birth city: ${city}`,
    `Gender: ${gender}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🔢 CHALDEAN NAME NUMEROLOGY`,
    `Name Number: *${nameInfo.nameNumber}* (${nnMean})`,
    `Life Path: *${life.lifePath}* (${lpMean})`,
    `Destiny: ${destiny.destiny}`,
    `Soul Urge: ${soul.soulUrge}`,
    `Personality: ${pers.personality}`,
    `Compound: ${nameInfo.compound}`,
    ``,
    corrected.length
      ? `*Suggested spellings*\n${corrected.map((c) => `• ${c.spelling} (${c.nameNumber})`).join("\n")}`
      : `*Suggested spellings*: reply PDF for full list`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `⭐ VEDIC BIRTH DETAILS`,
    `Nakshatra: *${birth.nakshatra}* (Pada ${birth.pada})`,
    `Naam Akshar: *${birth.naamAkshar}*`,
    `Moon (Chandra): *${birth.chandra}*`,
    `Lagna: *${birth.lagna}*`,
    `Dasha start lord: *${lord}*`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `⏳ VIMSHOTTARI DASHA (approx. dates)`,
    `Current: *${dasha.current?.name || "—"}* (${dasha.current?.fromStr || "—"} → ${dasha.current?.toStr || "—"})`,
    dasha.next ? `Next: *${dasha.next.name}* from ${dasha.next.fromStr}` : null,
    ``,
    `*Mahadasha timeline*`,
    ...dashaLines,
    ``,
    `_Dates approximate. Exact AD needs Moon degree lock._`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🌿 REMEDIES (supportive — not medicine)`,
    `• Mantra + weekday discipline for active dasha lord`,
    `• Moon: Om Chandraya Namaha, white/cream, steady sleep`,
    `• Mars: exercise, calm speech, watch heat/anger`,
    `• Rahu: truth in deals, fixed routine, avoid shortcuts`,
    `• Saturn: service, patience, joint care`,
    `• Jupiter: learning, honest teaching, food moderation`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `💎 GEMSTONES (optional — expert only)`,
    `Ruby-Sun, Pearl-Moon, Coral-Mars, Emerald-Mercury,`,
    `Yellow sapphire-Jupiter, Diamond-Venus, Blue sapphire-Saturn.`,
    ``,
    `⚠️ *Gemstone safety*`,
    `• Not medicine; no guarantee of money/health/legal results`,
    `• Do NOT self-prescribe Neelam / Gomed / Cat eye`,
    `• Remove if anxiety, sleep loss, or conflict increases`,
    `• Check metal allergy; lab-test costly stones`,
    `• Medical issues → doctor first`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🕉️ YANTRA note (optional)`,
    `Navagraha / Sri yantra = focus aid for mantra and discipline.`,
    `Symbol of balanced grahas — does not force outcomes.`,
    `⚠️ Not medicine; stop if fear or anxiety increases.`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✅ NEXT`,
    `1) Confirm birth city if wrong`,
    `2) Reply *PDF* for extended remedies sheet`,
    `3) Reply *KUNDLI* for deeper chart discussion`,
    ``,
    `— Astro Services`,
    `Engine: hinducalendar.app · Chaldean · Vimshottari approx.`,
  ].filter((x) => x !== null) as string[];

  if (lang === "hi") lines.unshift("(Hindi note — full Hindi PDF on request)", "");
  if (lang === "kn") lines.unshift("(Kannada note — full Kannada PDF on request)", "");

  return {
    whatsappText: lines.join("\n"),
    preview: {
      fullName,
      nameNumber: nameInfo.nameNumber,
      lifePath: life.lifePath,
      birth,
      dashaCurrent: dasha.current?.name,
      dashaCurrentFrom: dasha.current?.fromStr,
      dashaCurrentTo: dasha.current?.toStr,
      dashaNext: dasha.next?.name,
      city,
      lang,
      lord,
    },
  };
}
