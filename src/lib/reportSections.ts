/**
 * Structured (section-by-section) full reports.
 *
 * The WhatsApp builders produce flat text for copy/paste; the /report page needs
 * headings, tables and lists. Both read the same engines so the numbers agree.
 */

import { analyzeName, generateCorrectedNames, NUMBER_MEANINGS, reduceNumber, reduceToSingleDigit } from "./chaldean";
import { buildLifeTimeline } from "./horoscope";
import { panchangForDate } from "./panchang";
import { calculateKundli, SIGNS, SIGN_LORDS, HOUSE_THEMES } from "./kundli";
import {
  parseBirthDate,
  parseBirthTime,
  type BirthDetailsInput,
} from "./report";

export type ReportBlock =
  | { kind: "chart"; cells: { sign: string; entries: string[] }[] }
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

/** Sidereal birth chart: never invent missing birth time or birthplace. */
export function buildHoroscopeSections(input: BirthDetailsInput): StructuredReport {
  const base = {
    headline: `${input.fullName} — birth horoscope`,
    subline: `${input.birthDate} · ${input.birthTime || "time not provided"} · ${input.birthPlace}`,
    generatedAt: new Date().toISOString(),
    source: "astronomy-engine / Lahiri approximation",
  };
  const result = calculateKundli(input);
  if (!result.chart) return {
    ...base, summary: [], sections: [{ id: "details-needed", title: "Birth details needed for your Kundli", blocks: [
      { kind: "paragraph", text: result.reason || "Please contact us to complete your birth details." },
      { kind: "paragraph", text: "We have not substituted a location or birth time: doing so would produce a misleading chart." },
    ] }],
  };
  const c = result.chart;
  const moon = c.placements.find(p => p.name === "Moon")!;
  const chart = (navamsa: boolean): ReportBlock => ({kind:"chart", cells: SIGNS.map((sign, i) => ({
    sign,
    entries: [ ...(i === (navamsa ? c.d9Asc : c.ascSign) ? ["Asc"] : []), ...c.placements.filter(p => (navamsa ? p.d9 : p.sign) === i).map(p => p.name + (p.retrograde ? " (R)" : "")) ],
  }))});
  const position = (x: number) => `${(x % 30).toFixed(2)}°`;
  const current = c.dashas.find(d => d.current);
  return {
    ...base,
    summary: [
      {label:"Ascendant", value:SIGNS[c.ascSign],hint:position(c.asc)},
      {label:"Moon sign",value:SIGNS[moon.sign]},
      {label:"Nakshatra",value:moon.nakshatra,hint:`Pada ${moon.pada}`},
      {label:"Current dasha",value:current?.lord || "Not available"},
    ],
    sections: [
      {id:"birth",title:"Birth details & calculation method",blocks:[
        {kind:"table",columns:["Detail","Value"],rows:[["Name",input.fullName],["Birth date",input.birthDate],["Local birth time",input.birthTime],["Birthplace",input.birthPlace],["Coordinates",`${c.city}: ${c.lat}°, ${c.lon}°`],["Time zone",c.zone],["UTC moment",c.utc],["Ayanamsa",`Lahiri approximation ${c.ayanamsa.toFixed(4)}°`],["House system","Whole sign; mean Rahu and Ketu"]]},
        {kind:"paragraph",text:"Astronomy Engine geocentric positions, approximate Lahiri ayanamsa and mean lunar node. Ayanamsa, node choice, rounding and ephemeris differences can change results near sign or nakshatra boundaries. Birth time and city-centre coordinates affect the ascendant. For an expert-grade chart, confirm with a professional ephemeris."},
      ]},
      {id:"rashi-chart",title:"D1 Rashi / Lagna chart",blocks:[
        {kind:"paragraph",text:"South Indian layout: signs stay fixed; Asc marks the first house. (R) means retrograde. Rahu and Ketu use the mean node."}, chart(false),
      ]},
      {id:"grahas",title:"Planetary positions",blocks:[
        {kind:"table",columns:["Graha","Sign & degree","House","Nakshatra / pada","Motion"],rows:c.placements.map(p=>[p.name,`${SIGNS[p.sign]} ${position(p.longitude)}`,String(p.house),`${p.nakshatra} / ${p.pada}`,p.retrograde?"Retrograde":"Direct"]),note:`Ascendant: ${SIGNS[c.ascSign]} ${position(c.asc)}. Degrees are within the sidereal sign.`},
      ]},
      {id:"houses",title:"Twelve houses and their themes",blocks:[
        {kind:"table",columns:["House","Sign","Lord","Planets","Area of life"],rows:HOUSE_THEMES.map((theme,i)=>{const sign=(c.ascSign+i)%12; return [String(i+1),SIGNS[sign],SIGN_LORDS[sign],c.placements.filter(p=>p.house===i+1).map(p=>p.name).join(", ") || "—",theme];})},
        {kind:"paragraph",text:"House themes are traditional interpretive prompts, not predictions. An empty house remains significant through its sign and sign lord."},
      ]},
      {id:"navamsa",title:"D9 Navamsa chart",blocks:[
        {kind:"paragraph",text:"Each sign is divided into nine equal parts. D9 is traditionally used as a supplementary chart; interpret it alongside D1 rather than on its own."},chart(true),
        {kind:"table",columns:["Graha","D1 sign","D9 sign"],rows:c.placements.map(p=>[p.name,SIGNS[p.sign],SIGNS[p.d9]])},
      ]},
      {id:"dasha",title:"Vimshottari dasha",blocks:[
        {kind:"paragraph",text:`Moon in ${moon.nakshatra}, pada ${moon.pada}. The starting mahadasha balance is approximately ${c.balance.toFixed(2)} years, based on the Moon's position within the nakshatra. Dates use a 365.2425-day year and may differ from other traditions.`},
        {kind:"table",columns:["Mahadasha","From (UTC)","To (UTC)","Status"],rows:c.dashas.map(d=>[d.lord,d.from,d.to,d.current?"current":""])},
        {kind:"paragraph",text:current ? `Current mahadasha: ${current.lord}${c.currentSub ? `; current antardasha: ${c.currentSub.lord} (${c.currentSub.from} to ${c.currentSub.to})` : ""}.` : "No current period is available within the calculated sequence."},
      ]},
      {id:"interpretation",title:"Reading your chart",blocks:[
        {kind:"paragraph",text:`Your ascendant is ${SIGNS[c.ascSign]}, traditionally associated with the first house of self and identity. The Moon is in ${SIGNS[moon.sign]} in house ${moon.house}, associated with ${HOUSE_THEMES[moon.house-1]}. These are traditional associations for reflection, not verified predictions.`},
        {kind:"list",items:c.placements.map(p=>`${p.name} in ${SIGNS[p.sign]}, house ${p.house}: consider the traditional themes of ${HOUSE_THEMES[p.house-1]} alongside the planet's role in the chart.`)},
      ]},
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
