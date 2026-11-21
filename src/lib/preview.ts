import {
  analyzeName,
  getPsychicNumber,
  NUMBER_MEANINGS,
  reduceNumber,
  reduceToSingleDigit,
} from "./chaldean";
import { buildLifeTimeline } from "./horoscope";
import { panchangForDate } from "./panchang";
import {
  parseBirthDate,
  parseBirthTime,
  type BirthDetailsInput,
  type ReportType,
} from "./report";

export type PreviewMetric = {
  label: string;
  value: string;
  hint?: string;
};

export type PreviewSection = {
  title: string;
  body: string;
  tone?: "default" | "highlight" | "warning";
};

export type ReportPreview = {
  reportType: ReportType;
  title: string;
  subtitle: string;
  metrics: PreviewMetric[];
  sections: PreviewSection[];
  reflection: string;
  numbers: {
    nameNumber?: number;
    compound?: number;
    lifePath?: number;
    psychic?: number;
    soulUrge?: number;
    personality?: number;
  };
  birth: {
    date?: string;
    time?: string;
    place: string;
    gender: string;
  };
  displayName: string;
  generatedAt: string;
};

const PLANET_BY_NUMBER: Record<number, string> = {
  1: "Sun (Surya)",
  2: "Moon (Chandra)",
  3: "Jupiter (Guru)",
  4: "Rahu",
  5: "Mercury (Budha)",
  6: "Venus (Shukra)",
  7: "Ketu",
  8: "Saturn (Shani)",
  9: "Mars (Mangal)",
  11: "Moon / Neptune (master 11)",
  22: "Saturn / Uranus (master 22)",
};

const NAKSHATRA_LORDS = [
  "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury",
];

/** Approximate nakshatra from a birth date, used only for the free preview. */
function approximateNakshatra(dayOfYear: number) {
  const index = dayOfYear % 27;
  const names = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni",
    "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha",
    "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana",
    "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
  ];
  return { name: names[index], lord: NAKSHATRA_LORDS[index % 9], index };
}

function numberProfile(n: number) {
  const base = reduceToSingleDigit(n);
  return NUMBER_MEANINGS[n] ?? NUMBER_MEANINGS[base] ?? NUMBER_MEANINGS[1];
}

function buildNumerologyPreview(input: BirthDetailsInput, date: { day: number; month: number; year: number } | null): ReportPreview {
  const name = input.fullName.trim();
  const day = date?.day ?? 1;
  const month = date?.month ?? 1;
  const year = date?.year ?? 2000;
  const analysis = analyzeName(name, day, month, year, input.gender || "Other");
  const timeline = date ? buildLifeTimeline(day, month, year, analysis.lifePath.lifePath) : null;
  const nameMeaning = analysis.nameMeaning;
  const lifeMeaning = analysis.lifePathMeaning;
  const psychicMeaning = numberProfile(analysis.psychic);
  const target = numberProfile(analysis.targetVibration);

  const compatibilityLine =
    analysis.compatibility.status === "excellent"
      ? "Your name number and life path already share the same frequency — a rare, naturally aligned combination."
      : analysis.compatibility.status === "good"
        ? "Your name number is broadly compatible with your life path, with room to fine-tune the compound value."
        : "Your name number and life path sit on different frequencies — this is exactly where a name correction can help.";

  return {
    reportType: "numerology",
    displayName: name || "Your name",
    title: name ? `${name}'s numerology` : "Name numerology",
    subtitle: date
      ? `Born ${date.day}/${date.month}/${date.year} · free Chaldean preview`
      : "Free Chaldean preview",
    metrics: [
      { label: "Name number", value: String(analysis.name.nameNumber), hint: `Compound ${analysis.name.compound}` },
      { label: "Life path", value: String(analysis.lifePath.lifePath), hint: lifeMeaning.title },
      { label: "Psychic number", value: String(analysis.psychic), hint: psychicMeaning.title },
    ],
    numbers: {
      nameNumber: analysis.name.nameNumber,
      compound: analysis.name.compound,
      lifePath: analysis.lifePath.lifePath,
      psychic: analysis.psychic,
      soulUrge: analysis.soulUrge.soulUrge,
      personality: analysis.personality.personality,
    },
    sections: [
      {
        title: "What your name vibration says",
        body: `${nameMeaning.title}. ${nameMeaning.strengths.join(", ")} come naturally; ${nameMeaning.challenges.join(" and ").toLowerCase()} are the edges to watch. Ruled by ${nameMeaning.planet}, with ${nameMeaning.luckyDay} as the strongest day for decisions and ${nameMeaning.luckyColours.toLowerCase()} as supportive colours.`,
        tone: "default",
      },
      {
        title: "Name vs life path",
        body: `${compatibilityLine} Alignment score: ${analysis.compatibility.currentStrength}%. A name tuned to ${analysis.targetVibration} (${target.title}) typically lifts this toward ${analysis.compatibility.correctedStrength}%.`,
        tone: "highlight",
      },
      ...(timeline
        ? [
            {
              title: `Where you are now (age ${timeline.age})`,
              body: timeline.present,
              tone: "default" as const,
            },
          ]
        : []),
      {
        title: "Soul urge & personality",
        body: `Inside (soul urge ${analysis.soulUrge.soulUrge}) you are drawn to ${numberProfile(analysis.soulUrge.soulUrge).title.toLowerCase()}; the world sees you as ${numberProfile(analysis.personality.personality).title.toLowerCase()}. When the two pull apart, decisions feel heavy — the full report maps how to bring them together.`,
        tone: "default",
      },
    ],
    reflection: `${name.split(" ")[0] || "Your name"} carries the ${analysis.name.nameNumber} vibration — ${nameMeaning.short.toLowerCase()} ${analysis.compatibility.hasIssue ? "A spelling-level adjustment is worth exploring." : "It supports your life path well."} The complete report covers corrected spellings, signature and business-name checks, and language-specific name options.`,
    birth: {
      date: date ? `${date.day}/${date.month}/${date.year}` : undefined,
      time: input.birthTime || undefined,
      place: input.birthPlace,
      gender: input.gender || "Prefer not to say",
    },
    generatedAt: new Date().toISOString(),
  };
}

function buildHoroscopePreview(input: BirthDetailsInput, date: { day: number; month: number; year: number } | null): ReportPreview {
  const day = date?.day ?? 1;
  const month = date?.month ?? 1;
  const year = date?.year ?? 2000;
  const time = parseBirthTime(input.birthTime);
  const lifePath = date ? reduceNumber(day + month + year, true) : 1;
  const psychic = getPsychicNumber(day);
  const lifeMeaning = numberProfile(lifePath);
  const psychicMeaning = numberProfile(psychic);
  const dayOfYear = date
    ? Math.floor(
        (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86400000
      )
    : 0;
  const nakshatra = approximateNakshatra(dayOfYear);
  const timeline = date ? buildLifeTimeline(day, month, year, lifePath) : null;
  const birthDate = date ? new Date(Date.UTC(year, month - 1, day)) : null;
  const weekday = birthDate
    ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][birthDate.getUTCDay()]
    : "—";

  return {
    reportType: "horoscope",
    displayName: input.fullName || "Your chart",
    title: `${input.fullName || "Your"} horoscope`,
    subtitle: date
      ? `Born ${weekday}, ${day}/${month}/${year}${time ? ` at ${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}` : ""} · ${input.birthPlace}`
      : "Birth details needed for an accurate chart",
    metrics: [
      { label: "Life path", value: String(lifePath), hint: lifeMeaning.title },
      { label: "Psychic number", value: String(psychic), hint: psychicMeaning.planet },
      { label: "Birth nakshatra", value: nakshatra.name, hint: `Lord ${nakshatra.lord}` },
    ],
    numbers: { lifePath, psychic },
    sections: [
      {
        title: "Core temperament",
        body: `${lifeMeaning.title}. ${lifeMeaning.strengths.join(" and ")} lead your chart; ${lifeMeaning.challenges.join(" and ").toLowerCase()} show up when pressure builds. Ruling planet in your numbers: ${lifeMeaning.planet}.`,
        tone: "default",
      },
      {
        title: "Birth star (nakshatra)",
        body: `Approximate janma nakshatra: ${nakshatra.name}, ruled by ${nakshatra.lord}. The full kundli pins the exact pada from your birth time and place — the pada decides your naam akshar (naming syllable) and the first dasha balance.`,
        tone: "highlight",
      },
      ...(timeline
        ? [
            {
              title: `Current chapter (age ${timeline.age})`,
              body: timeline.present,
              tone: "default" as const,
            },
          ]
        : []),
      {
        title: "What the full report adds",
        body: `Exact Lagna and house placements, planetary strengths, Vimshottari dasha dates month-by-month, and remedies matched to your running dasha lord${time ? "" : " — add a birth time to sharpen the Lagna and dasha timing"}.`,
        tone: "default",
      },
    ],
    reflection: `Your chart opens with ${lifeMeaning.title.toLowerCase()} and a ${psychicMeaning.planet}-influenced mind. ${time ? "With a birth time you also get an exact Lagna and dasha timeline." : "Adding a birth time sharpens the Lagna and dasha timeline."} The complete PDF walks through career, relationships and wellbeing themes.`,
    birth: {
      date: date ? `${day}/${month}/${year}` : undefined,
      time: input.birthTime || undefined,
      place: input.birthPlace,
      gender: input.gender || "Prefer not to say",
    },
    generatedAt: new Date().toISOString(),
  };
}

function buildPanchangPreview(input: BirthDetailsInput): ReportPreview {
  const target = input.birthDate || new Date().toISOString().slice(0, 10);
  const parsed = parseBirthDate(target);
  const dateObj = parsed
    ? new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day, 12))
    : new Date();
  const p = panchangForDate(dateObj);
  const goodChogh = p.choghDay.filter((c) => c.good).slice(0, 2);
  const nextGood = goodChogh.length ? goodChogh[0] : p.choghDay[0];

  return {
    reportType: "panchang",
    displayName: input.fullName || "Daily panchang",
    title: `Panchang · ${p.date}`,
    subtitle: `${p.weekday} · ${input.birthPlace}`,
    metrics: [
      { label: "Tithi", value: p.tithi, hint: p.paksha },
      { label: "Nakshatra", value: p.nakshatra, hint: p.maas },
      { label: "Yoga", value: p.yoga, hint: p.karana },
    ],
    numbers: {},
    sections: [
      {
        title: "Auspicious windows",
        body: `Abhijit muhurta ${p.abhijit.start}–${p.abhijit.end}. Best choghadiya today: ${goodChogh.map((c) => `${c.name} ${c.start}–${c.end}`).join(", ") || "—"}. Next favourable window: ${nextGood.name} ${nextGood.start}–${nextGood.end}.`,
        tone: "highlight",
      },
      {
        title: "Avoid for major work",
        body: `Rahu kalam ${p.rahu.start}–${p.rahu.end}, Yama ghanta ${p.yama.start}–${p.yama.end}, Gulika ${p.gulika.start}–${p.gulika.end}. Traditional practice keeps new ventures, signing and travel out of these windows.`,
        tone: "warning",
      },
      {
        title: "Day context",
        body: `${p.paksha}, ${p.maas} maas, Vikram Samvat ${p.vikramSamvat}, Shaka Samvat ${p.shakaSamvat}. Sunrise ${p.sunrise}, sunset ${p.sunset} (approximate — city-accurate timings come from the panchang engine).`,
        tone: "default",
      },
    ],
    reflection: `${p.weekday} opens with ${p.tithi} tithi in ${p.paksha.toLowerCase()}. Use the favourable windows above for anything you want to start, and let the full panchang fill in sunrise-accurate muhurta, hora and lagna.`,
    birth: {
      date: target,
      time: input.birthTime || undefined,
      place: input.birthPlace,
      gender: input.gender || "Prefer not to say",
    },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Builds a free preview entirely from the local numerology / panchang engines.
 * Shared by the client form (instant preview) and the server (stored lead record).
 */
export function buildPreview(input: BirthDetailsInput): ReportPreview {
  const date = parseBirthDate(input.birthDate);
  if (input.reportType === "panchang") return buildPanchangPreview(input);
  if (input.reportType === "numerology") return buildNumerologyPreview(input, date);
  return buildHoroscopePreview(input, date);
}

export function planetForNumber(n: number): string {
  return PLANET_BY_NUMBER[n] ?? "—";
}
