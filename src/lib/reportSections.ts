/**
 * Structured (section-by-section) full reports.
 *
 * The WhatsApp builders produce flat text for copy/paste; the /report page needs
 * headings, tables and lists. Both read the same engines so the numbers agree.
 */

import { analyzeName, generateCorrectedNames, NUMBER_MEANINGS, reduceNumber, reduceToSingleDigit } from "./chaldean";
import { buildVimshottari, nakshatraLord, type DashaRow } from "./dasha";
import { buildLifeTimeline } from "./horoscope";
import { CITIES } from "./hinduCalendarMcp";
import { panchangForDate } from "./panchang";
import {
  parseBirthDate,
  parseBirthTime,
  type BirthDetailsInput,
} from "./report";

export type ReportBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "table"; columns: string[]; rows: string[][]; note?: string }
  | { kind: "metrics"; items: { label: string; value: string; hint?: string }[] };

export type ReportSection = {
  id: string;
  title: string;
  blocks: ReportBlock[];
};

export type StructuredReport = {
  headline: string;
  subline: string;
  sections: ReportSection[];
  summary: { label: string; value: string; hint?: string }[];
  generatedAt: string;
  source: string;
};

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

function dashaTable(rows: DashaRow[], current: DashaRow | null): ReportBlock {
  const body = rows.slice(0, 10).map((r) => [
    r.name,
    r.fromStr,
    r.toStr,
    `${r.years.toFixed(1)} yr`,
    current && r.name === current.name && r.fromStr === current.fromStr ? "current" : "",
  ]);
  return {
    kind: "table",
    columns: ["Mahadasha", "From", "To", "Length", ""],
    rows: body,
    note: "Approximate Vimshottari timeline. Exact dates need the Moon degree from a city-accurate birth chart.",
  };
}

/* ------------------------------------------------------------------ numerology */

export function buildNumerologySections(input: BirthDetailsInput): StructuredReport {
  const name = input.fullName.trim();
  const date = parseBirthDate(input.birthDate) ?? { day: 1, month: 1, year: 2000 };
  const a = analyzeName(name, date.day, date.month, date.year, input.gender || "Other");
  const personalYear = reduceNumber(date.day + date.month + new Date().getFullYear(), true);
  const corrected = generateCorrectedNames(name, a.targetVibration).slice(0, 5);
  const nm = a.nameMeaning;
  const lm = a.lifePathMeaning;
  const timeline = buildLifeTimeline(date.day, date.month, date.year, a.lifePath.lifePath);

  return {
    headline: `${name} — name numerology`,
    subline: `${pad(date.day)}/${pad(date.month)}/${date.year} · Chaldean system`,
    summary: [
      { label: "Name number", value: String(a.name.nameNumber), hint: `compound ${a.name.compound}` },
      { label: "Life path", value: String(a.lifePath.lifePath), hint: lm.title },
      { label: "Destiny", value: String(a.destiny.destiny) },
    ],
    source: "chaldean",
    generatedAt: new Date().toISOString(),
    sections: [
      {
        id: "core",
        title: "Your core numbers",
        blocks: [
          {
            kind: "metrics",
            items: [
              { label: "Name number", value: String(a.name.nameNumber), hint: `compound ${a.name.compound}` },
              { label: "Life path", value: String(a.lifePath.lifePath), hint: lm.title },
              { label: "Destiny", value: String(a.destiny.destiny) },
              { label: "Soul urge", value: String(a.soulUrge.soulUrge), hint: "inner desire" },
              { label: "Personality", value: String(a.personality.personality), hint: "outer self" },
              { label: "Subconscious", value: String(a.subconscious), hint: "under pressure" },
              { label: "Psychic", value: String(a.psychic), hint: "from birth day" },
              { label: "Personal year", value: String(personalYear), hint: meaning(personalYear).title },
            ],
          },
          {
            kind: "paragraph",
            text: `Your name carries the ${a.name.nameNumber} vibration — ${nm.title.toLowerCase()}, ruled by ${nm.planet}. Your life path is ${a.lifePath.lifePath} — ${lm.title.toLowerCase()}. Where these two agree, life feels straightforward; where they pull apart, effort feels doubled.`,
          },
        ],
      },
      {
        id: "alignment",
        title: "Name vs life path",
        blocks: [
          {
            kind: "metrics",
            items: [
              { label: "Current alignment", value: `${a.compatibility.currentStrength}%` },
              { label: "Target vibration", value: `${a.targetVibration}`, hint: meaning(a.targetVibration).title },
              { label: "Corrected alignment", value: `${a.compatibility.correctedStrength}%` },
            ],
          },
          { kind: "paragraph", text: a.compatibility.message },
          {
            kind: "paragraph",
            text: `Strengths that come naturally with this name: ${nm.strengths.join(", ")}. Edges to watch: ${nm.challenges.join(", ")}.`,
          },
        ],
      },
      {
        id: "spellings",
        title: "Suggested spellings",
        blocks: [
          {
            kind: "paragraph",
            text: `These are spelling options computed for a target vibration of ${a.targetVibration} (${meaning(a.targetVibration).title}). Use one consistently for at least 40 days before changing documents.`,
          },
          {
            kind: "table",
            columns: ["Spelling", "Name number", "Compound", "Cheiro"],
            rows: corrected.length
              ? corrected.map((c) => [c.spelling, String(c.nameNumber), String(c.compound), String(c.cheiroNumber)])
              : [["—", "—", "—", "—"]],
            note: "Cheiro method reduces each name part before adding them.",
          },
        ],
      },
      {
        id: "planet",
        title: "Ruling planet & practical notes",
        blocks: [
          {
            kind: "table",
            columns: ["Planet", "Lucky day", "Lucky colours", "Lucky numbers"],
            rows: [[nm.planet, nm.luckyDay, nm.luckyColours, nm.luckyNumbers]],
          },
          {
            kind: "list",
            items: [
              `Keep ${nm.luckyDay} for decisions that matter, and avoid over-scheduling it.`,
              `Supportive colours: ${nm.luckyColours.toLowerCase()}.`,
              `On the ${nm.planet}-routed days, service and calm speech work better than force.`,
            ],
          },
        ],
      },
      {
        id: "phases",
        title: "Life phases",
        blocks: [
          {
            kind: "table",
            columns: ["Phase", "Age", "Status"],
            rows: timeline.phases.map((p) => [p.title.en, p.ageRange, p.status]),
          },
          { kind: "paragraph", text: `Past: ${timeline.past}` },
          { kind: "paragraph", text: `Present: ${timeline.present}` },
          { kind: "paragraph", text: `Future: ${timeline.future}` },
        ],
      },
      {
        id: "letters",
        title: "Letter-by-letter breakdown",
        blocks: [
          {
            kind: "table",
            columns: ["#", "Letter", "Value"],
            rows: a.name.letterBreakdown.slice(0, 40).map((l, i) => [String(i + 1), l.letter, String(l.value)]),
          },
        ],
      },
    ],
  };
}

/* ------------------------------------------------------------------- horoscope */

const SIGN_BY_LIFE_PATH: Record<number, string> = {
  1: "Leo", 2: "Cancer", 3: "Sagittarius", 4: "Aquarius",
  5: "Gemini", 6: "Taurus", 7: "Pisces", 8: "Capricorn", 9: "Aries",
};

const REMEDY_BY_LORD: Record<string, string> = {
  Ketu: "Donate black sesame on a Tuesday; keep a simple meditation routine.",
  Venus: "White sweets on Friday; keep your spaces clean and uncluttered.",
  Sun: "Offer water to the rising sun; Sundays are for discipline, not debt.",
  Moon: "Milk or rice on Monday; protect sleep, especially on full-moon weeks.",
  Mars: "Red lentils on Tuesday; exercise and cooling speech calm the heat.",
  Rahu: "Mustard oil lamp on Saturday; avoid shortcuts in money and contracts.",
  Jupiter: "Yellow items on Thursday; learning and honest teaching help.",
  Saturn: "Help workers, feed the needy; patience over speed in obligations.",
  Mercury: "Green items on Wednesday; respect teachers and finish what you start.",
};

export function buildHoroscopeSections(input: BirthDetailsInput): StructuredReport {
  const date = parseBirthDate(input.birthDate) ?? { day: 1, month: 1, year: 2000 };
  const time = parseBirthTime(input.birthTime) ?? { hour: 12, minute: 0 };
  const lifePath = reduceNumber(date.day + date.month + date.year, true);
  const lm = meaning(lifePath);
  const timeline = buildLifeTimeline(date.day, date.month, date.year, lifePath);

  // Approximate nakshatra from the calendar day (documented as approximate).
  const dayOfYear = Math.floor(
    (Date.UTC(date.year, date.month - 1, date.day) - Date.UTC(date.year, 0, 0)) / 86400000
  );
  const nakshatraNames = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
    "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
    "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
    "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
    "Uttara Bhadrapada", "Revati",
  ];
  const nakshatra = nakshatraNames[dayOfYear % 27];
  const lord = nakshatraLord(nakshatra);
  const pada = (dayOfYear % 4) + 1;

  const birthDate = new Date(Date.UTC(date.year, date.month - 1, date.day, 12));
  const dasha = buildVimshottari(new Date(birthDate.getTime() - 12 * 3600 * 1000), lord, 3.5);
  const cityKey = input.birthPlace.split(",")[0].trim();
  const cityKnown = Boolean(CITIES[cityKey]);
  const sign = SIGN_BY_LIFE_PATH[reduceToSingleDigit(lifePath)] ?? "Aries";
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return {
    headline: `${input.fullName} — birth horoscope`,
    subline: `${pad(date.day)}/${pad(date.month)}/${date.year} · ${pad(time.hour)}:${pad(time.minute)} · ${input.birthPlace}`,
    summary: [
      { label: "Life path", value: String(lifePath), hint: lm.title },
      { label: "Janma nakshatra", value: nakshatra, hint: `pada ${pada}` },
      { label: "Nakshatra lord", value: lord, hint: "dasha start" },
    ],
    source: "chaldean+vedic-approx",
    generatedAt: new Date().toISOString(),
    sections: [
      {
        id: "birth",
        title: "Birth details",
        blocks: [
          {
            kind: "table",
            columns: ["Detail", "Value"],
            rows: [
              ["Date of birth", `${pad(date.day)}/${pad(date.month)}/${date.year}`],
              ["Time of birth", input.birthTime ? `${pad(time.hour)}:${pad(time.minute)}` : "not provided (noon assumed)"],
              ["Place", input.birthPlace],
              ["Weekday", weekdays[birthDate.getUTCDay()]],
              ["Gender", input.gender || "prefer not to say"],
              ["City in engine", cityKnown ? `${cityKey} (lat/lon known)` : `${cityKey} (nearest city used)`],
            ],
          },
        ],
      },
      {
        id: "core",
        title: "Temperament",
        blocks: [
          {
            kind: "metrics",
            items: [
              { label: "Life path", value: String(lifePath), hint: lm.title },
              { label: "Life-path sign", value: sign, hint: "indicative" },
              { label: "Ruling planet", value: lm.planet },
            ],
          },
          {
            kind: "paragraph",
            text: `${lm.title}. Strengths: ${lm.strengths.join(", ")}. Under pressure: ${lm.challenges.join(", ")}. In Vedic practice the Moon sign matters most for temperament — the full chart pins it from your exact birth time.`,
          },
        ],
      },
      {
        id: "nakshatra",
        title: "Janma nakshatra & dasha start",
        blocks: [
          {
            kind: "table",
            columns: ["Nakshatra", "Pada", "Lord", "Naam akshar basis"],
            rows: [[nakshatra, String(pada), lord, "from pada syllable table"]],
          },
          {
            kind: "paragraph",
            text: `Your Vimshottari sequence begins with ${lord}, which is why the early dasha dates below start there. The exact balance at birth depends on the Moon's degree, so treat the first row as indicative.`,
          },
        ],
      },
      {
        id: "dasha",
        title: "Vimshottari dasha timeline",
        blocks: [
          dashaTable(dasha.rows, dasha.current),
          {
            kind: "paragraph",
            text: dasha.current
              ? `You are in ${dasha.current.name} mahadasha (${dasha.current.fromStr} → ${dasha.current.toStr}).${dasha.next ? ` Next: ${dasha.next.name} from ${dasha.next.fromStr}.` : ""}`
              : "Current dasha cannot be resolved from the approximate sequence — exact birth time will fix this.",
          },
        ],
      },
      {
        id: "remedies",
        title: "Remedies for your dasha lord",
        blocks: [
          {
            kind: "list",
            items: [
              REMEDY_BY_LORD[lord] ?? "Keep a steady routine and simple mantra practice.",
              dasha.current ? REMEDY_BY_LORD[dasha.current.name] ?? "" : "",
              "Remedies are supportive practices, not a substitute for medical, legal or financial advice.",
            ].filter(Boolean),
          },
        ],
      },
      {
        id: "phases",
        title: "Life phases",
        blocks: [
          {
            kind: "table",
            columns: ["Phase", "Age", "Status"],
            rows: timeline.phases.map((p) => [p.title.en, p.ageRange, p.status]),
          },
          { kind: "paragraph", text: timeline.present },
        ],
      },
    ],
  };
}

/* --------------------------------------------------------------------- panchang */

export function buildPanchangSections(input: BirthDetailsInput): StructuredReport {
  const iso = input.birthDate || new Date().toISOString().slice(0, 10);
  const parsed = parseBirthDate(iso);
  const dateObj = parsed
    ? new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day, 12))
    : new Date();
  const p = panchangForDate(dateObj);

  return {
    headline: `Panchang — ${p.date}`,
    subline: `${p.weekday} · ${input.birthPlace}`,
    summary: [
      { label: "Tithi", value: p.tithi, hint: p.paksha },
      { label: "Nakshatra", value: p.nakshatra, hint: p.maas },
      { label: "Yoga", value: p.yoga, hint: p.karana },
    ],
    source: "panchang-rules",
    generatedAt: new Date().toISOString(),
    sections: [
      {
        id: "core",
        title: "Panchang at a glance",
        blocks: [
          {
            kind: "table",
            columns: ["Element", "Value"],
            rows: [
              ["Tithi", p.tithi],
              ["Paksha", p.paksha],
              ["Nakshatra", p.nakshatra],
              ["Yoga", p.yoga],
              ["Karana", p.karana],
              ["Maas", p.maas],
              ["Vikram Samvat", String(p.vikramSamvat)],
              ["Shaka Samvat", String(p.shakaSamvat)],
            ],
          },
        ],
      },
      {
        id: "timings",
        title: "Timings",
        blocks: [
          {
            kind: "table",
            columns: ["Window", "Time", "Use"],
            rows: [
              ["Sunrise", p.sunrise, "day begins"],
              ["Sunset", p.sunset, "day ends"],
              ["Abhijit muhurta", `${p.abhijit.start}–${p.abhijit.end}`, "good for new starts"],
              ["Rahu kalam", `${p.rahu.start}–${p.rahu.end}`, "avoid major work"],
              ["Yama ghanta", `${p.yama.start}–${p.yama.end}`, "avoid major work"],
              ["Gulika", `${p.gulika.start}–${p.gulika.end}`, "avoid major work"],
            ],
          },
          { kind: "paragraph", text: p.note },
        ],
      },
      {
        id: "choghadiya",
        title: "Choghadiya",
        blocks: [
          {
            kind: "table",
            columns: ["Day", "Time", "Quality"],
            rows: p.choghDay.map((c) => [c.name, `${c.start}–${c.end}`, c.good ? "favourable" : "avoid"]),
          },
          {
            kind: "table",
            columns: ["Night", "Time", "Quality"],
            rows: p.choghNight.map((c) => [c.name, `${c.start}–${c.end}`, c.good ? "favourable" : "avoid"]),
          },
        ],
      },
      {
        id: "hora",
        title: "Hora",
        blocks: [
          {
            kind: "table",
            columns: ["#", "Lord", "From", "To"],
            rows: p.horas.map((h, i) => [String(i + 1), h.lord, h.start, h.end]),
          },
        ],
      },
    ],
  };
}

export function buildStructuredReport(input: BirthDetailsInput): StructuredReport {
  if (input.reportType === "numerology") return buildNumerologySections(input);
  if (input.reportType === "panchang") return buildPanchangSections(input);
  return buildHoroscopeSections(input);
}
