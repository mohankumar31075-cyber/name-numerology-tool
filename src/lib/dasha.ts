/**
 * Approximate Vimshottari dasha timeline from birth date.
 */

export type DashaRow = {
  name: string;
  years: number;
  from: Date;
  to: Date;
  fromStr: string;
  toStr: string;
};

const ORDER: { name: string; years: number }[] = [
  { name: "Ketu", years: 7 },
  { name: "Venus", years: 20 },
  { name: "Sun", years: 6 },
  { name: "Moon", years: 10 },
  { name: "Mars", years: 7 },
  { name: "Rahu", years: 18 },
  { name: "Jupiter", years: 16 },
  { name: "Saturn", years: 19 },
  { name: "Mercury", years: 17 },
];

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function buildVimshottari(
  birth: Date,
  firstLord: string = "Ketu",
  firstBalanceYears: number = 1.2
): { rows: DashaRow[]; current: DashaRow | null; next: DashaRow | null } {
  const idx = ORDER.findIndex((p) => p.name.toLowerCase() === firstLord.toLowerCase());
  const startIdx = idx >= 0 ? idx : 0;

  const rows: DashaRow[] = [];
  let t = birth.getTime();

  const first = ORDER[startIdx];
  const bal = Math.min(Math.max(firstBalanceYears, 0.05), first.years);
  {
    const from = new Date(t);
    t += bal * 365.25 * 24 * 3600 * 1000;
    const to = new Date(t);
    rows.push({ name: first.name, years: bal, from, to, fromStr: fmt(from), toStr: fmt(to) });
  }

  let i = (startIdx + 1) % ORDER.length;
  const limit = birth.getTime() + 120 * 365.25 * 24 * 3600 * 1000;
  let guard = 0;
  while (t < limit && guard < 20) {
    const p = ORDER[i];
    const from = new Date(t);
    t += p.years * 365.25 * 24 * 3600 * 1000;
    const to = new Date(t);
    rows.push({ name: p.name, years: p.years, from, to, fromStr: fmt(from), toStr: fmt(to) });
    i = (i + 1) % ORDER.length;
    guard++;
  }

  const now = Date.now();
  const current = rows.find((r) => now >= r.from.getTime() && now < r.to.getTime()) || null;
  const nextIdx = current ? rows.indexOf(current) + 1 : 0;
  const next = rows[nextIdx] || null;

  return { rows, current, next };
}

export function nakshatraLord(nak?: string): string {
  if (!nak) return "Ketu";
  const n = nak.toLowerCase();
  const map: [RegExp, string][] = [
    [/ashwini|magha|mula/, "Ketu"],
    [/bharani|purva\s*phalguni|purva\s*ashadha/, "Venus"],
    [/krittika|uttara\s*phalguni|uttara\s*ashadha/, "Sun"],
    [/rohini|hasta|shravana/, "Moon"],
    [/mrigashira|chitra|dhanishta/, "Mars"],
    [/ardra|swati|shatabhisha/, "Rahu"],
    [/punarvasu|vishakha|purva\s*bhadrapada/, "Jupiter"],
    [/pushya|anuradha|uttara\s*bhadrapada/, "Saturn"],
    [/ashlesha|jyeshtha|revati/, "Mercury"],
  ];
  for (const [re, lord] of map) {
    if (re.test(n)) return lord;
  }
  return "Ketu";
}

export function antardashaYears(mdYears: number, adPlanetYears: number) {
  return (mdYears * adPlanetYears) / 120;
}
