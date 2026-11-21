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

function approxDashaFromNakshatra(_nakName: string | undefined, birth: Date) {
  const periods: { name: string; years: number }[] = [
    { name: "Ketu", years: 1.2 },
    { name: "Venus", years: 20 },
    { name: "Sun", years: 6 },
    { name: "Moon", years: 10 },
    { name: "Mars", years: 7 },
    { name: "Rahu", years: 18 },
    { name: "Jupiter", years: 16 },
    { name: "Saturn", years: 19 },
    { name: "Mercury", years: 17 },
  ];
  let t = birth.getTime();
  const rows: { name: string; from: string; to: string }[] = [];
  for (const p of periods) {
    const from = new Date(t);
    t += p.years * 365.25 * 24 * 3600 * 1000;
    const to = new Date(t);
    rows.push({
      name: p.name,
      from: from.toISOString().slice(0, 7),
      to: to.toISOString().slice(0, 7),
    });
  }
  const now = Date.now();
  const current =
    rows.find((r) => {
      const a = new Date(r.from + "-01").getTime();
      const b = new Date(r.to + "-01").getTime();
      return now >= a && now < b;
    })?.name || "—";
  return { rows, current };
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

  const birthDate = new Date(year, month - 1, day);
  const dasha = approxDashaFromNakshatra(birth.nakshatra, birthDate);
  const lpMean = MEANING[life.lifePath] || "";
  const nnMean = MEANING[nameInfo.nameNumber] || "";

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
    `Compound name total: ${nameInfo.compound}`,
    ``,
    corrected.length
      ? `*Suggested spellings*\n${corrected
          .map((c) => `• ${c.spelling} (${c.nameNumber})`)
          .join("\n")}`
      : `*Suggested spellings*: reply PDF for full correction list`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `⭐ VEDIC BIRTH DETAILS`,
    `Nakshatra: *${birth.nakshatra}* (Pada ${birth.pada})`,
    `Naam Akshar: *${birth.naamAkshar}*`,
    `Moon (Chandra): *${birth.chandra}*`,
    `Lagna: *${birth.lagna}*`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📖 NAVAMSHA NOTE`,
    `Pada-based Moon navamsha flavour is included in detailed follow-up.`,
    `Inner need often links emotional security with public dignity.`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `⏳ DASHA OUTLINE (approx.)`,
    `Current focus band: *${dasha.current}*`,
    ...dasha.rows.slice(0, 6).map((r) => `• ${r.name}: ${r.from} → ${r.to}`),
    `• … (full AD table on request)`,
    ``,
    `*Moon-period remedies (when Moon MD active)*`,
    `• Om Chandraya Namaha (Mon)`,
    `• White/cream, steady sleep`,
    `• Respect elders / one kind family act weekly`,
    ``,
    `*Mars-period focus*`,
    `• Courage, property, competition — watch temper & heat`,
    ``,
    `*Rahu-period focus*`,
    `• Networks, platforms — keep ethics & health clean`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    `✅ NEXT`,
    `1) Confirm birth city if wrong.`,
    `2) Reply *PDF* for Name Correction + full remedies sheet.`,
    `3) Reply *KUNDLI* for deeper chart discussion.`,
    ``,
    `— Astro Services`,
    `Engine: hinducalendar.app · Numerology: Chaldean`,
  ];

  if (lang === "hi") {
    lines.unshift("（रिपोर्ट संरचना अंग्रेज़ी में — पूर्ण हिंदी PDF उपलब्ध）", "");
  } else if (lang === "kn") {
    lines.unshift("（ವರದಿ ರಚನೆ ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ — ಪೂರ್ಣ ಕನ್ನಡ PDF ಲಭ್ಯ）", "");
  }

  return {
    whatsappText: lines.join("\n"),
    preview: {
      fullName,
      nameNumber: nameInfo.nameNumber,
      lifePath: life.lifePath,
      birth,
      dashaCurrent: dasha.current,
      city,
      lang,
    },
  };
}
