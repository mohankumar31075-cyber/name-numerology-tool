/**
 * Chaldean Numerology Engine
 */
export const CHALDEAN_MAP: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

const VOWELS = new Set(["A", "E", "I", "O", "U"]);

export function reduceNumber(n: number, keepMaster = true): number {
  while (n > 9) {
    if (keepMaster && (n === 11 || n === 22)) return n;
    n = String(n).split("").reduce((sum, d) => sum + Number(d), 0);
  }
  return n;
}

export function reduceToSingleDigit(n: number): number {
  return reduceNumber(n, false);
}

export function getNameNumber(name: string) {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  const letterBreakdown: { letter: string; value: number }[] = [];
  let compound = 0;
  for (const letter of clean) {
    const value = CHALDEAN_MAP[letter] ?? 0;
    letterBreakdown.push({ letter, value });
    compound += value;
  }
  return { compound, nameNumber: reduceToSingleDigit(compound), letterBreakdown };
}

export function getNameDestiny(name: string) {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  let compound = 0;
  for (const letter of clean) compound += CHALDEAN_MAP[letter] ?? 0;
  return { compound, destiny: reduceNumber(compound, true) };
}

export function getLifePath(day: number, month: number, year: number) {
  const compound = day + month + year;
  return { compound, lifePath: reduceNumber(compound, true) };
}

export function getPsychicNumber(day: number) {
  return reduceNumber(day, true);
}

export function getSoulUrge(name: string) {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  let compound = 0;
  for (const letter of clean) {
    if (VOWELS.has(letter)) compound += CHALDEAN_MAP[letter] ?? 0;
  }
  return { compound, soulUrge: reduceNumber(compound, true) || 1 };
}

export function getPersonality(name: string) {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  let compound = 0;
  for (const letter of clean) {
    if (!VOWELS.has(letter)) compound += CHALDEAN_MAP[letter] ?? 0;
  }
  return { compound, personality: reduceNumber(compound, true) || 1 };
}

export function getSubconsciousSelf(name: string) {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  const present = new Set<number>();
  for (const letter of clean) {
    const v = CHALDEAN_MAP[letter];
    if (v) present.add(v);
  }
  const count = present.size;
  return count === 0 ? 1 : reduceNumber(count, false);
}

export type CompatibilityStatus = "excellent" | "good" | "average" | "needs_attention";

export function getCompatibility(nameNumber: number, lifePath: number) {
  const singleName = reduceToSingleDigit(nameNumber);
  const singleLife = reduceToSingleDigit(lifePath);
  if (singleName === singleLife) {
    return { status: "excellent" as const, score: 95, message: "Perfect match with life path.", hasIssue: false, currentStrength: 88, correctedStrength: 95 };
  }
  const friendly: Record<number, number[]> = {
    1: [1, 2, 3, 5, 6, 9], 2: [1, 2, 3, 7, 9], 3: [1, 2, 3, 5, 6, 9], 4: [4, 5, 6, 7, 8],
    5: [1, 3, 5, 6, 7, 9], 6: [1, 3, 4, 5, 6, 9], 7: [2, 4, 5, 7], 8: [4, 5, 6, 8], 9: [1, 2, 3, 5, 6, 9],
  };
  if (friendly[singleName]?.includes(singleLife)) {
    return { status: "good" as const, score: 72, message: "Compatible; refinements can still help.", hasIssue: true, currentStrength: 62, correctedStrength: 92 };
  }
  return { status: "needs_attention" as const, score: 40, message: "Mismatch — name correction recommended.", hasIssue: true, currentStrength: 48, correctedStrength: 90 };
}

export function suggestTargetVibration(_lifePath: number): number {
  return 6;
}

export function getCorrectedNameTease(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0] || fullName;
  const rest = parts.slice(1).join(" ");
  const visibleStart = first.slice(0, Math.min(3, first.length)).toUpperCase();
  return {
    visibleStart,
    blurred: first.length > 3 ? "••••" : "••",
    visibleEnd: rest.toUpperCase(),
    targetVibration: 6,
    targetTitle: "Love, Luxury & Comfort",
  };
}

export function generateCorrectedNames(fullName: string, targetVibration: number) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return [];
  const first = parts[0];
  const restStr = parts.slice(1).join(" ");
  const variants = new Set<string>([first]);
  for (let i = 0; i < first.length; i++) {
    const ch = first[i];
    if ("AEIOUaeiou".includes(ch)) {
      variants.add(first.slice(0, i + 1) + ch.toLowerCase() + first.slice(i + 1));
    }
  }
  for (const end of ["a", "h", "an", "aa", "i"]) variants.add(first + end);
  const results: { spelling: string; nameNumber: number; compound: number }[] = [];
  for (const v of variants) {
    const full = restStr ? `${v} ${restStr}` : v;
    const n = getNameNumber(full);
    results.push({ spelling: full.replace(/\s+/g, " ").trim(), nameNumber: n.nameNumber, compound: n.compound });
  }
  results.sort((a, b) => Math.abs(a.nameNumber - targetVibration) - Math.abs(b.nameNumber - targetVibration));
  const seen = new Set<string>();
  const out: typeof results = [];
  for (const r of results) {
    const key = r.spelling.toUpperCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
    if (out.length >= 5) break;
  }
  return out;
}

export const NUMBER_MEANINGS: Record<number, any> = {
  1: { planet: "Sun", title: "Leadership & Ambition", short: "The Leader.", keywords: "Leadership", strengths: ["Leadership", "Initiative", "Originality"], challenges: ["Ego", "Impatience"], luckyDay: "Sunday", luckyColours: "Gold, Orange", luckyNumbers: "1, 2, 3" },
  2: { planet: "Moon", title: "Harmony & Diplomacy", short: "The Peacemaker.", keywords: "Diplomacy", strengths: ["Diplomacy", "Intuition"], challenges: ["Sensitivity"], luckyDay: "Monday", luckyColours: "White, Silver", luckyNumbers: "2, 7" },
  3: { planet: "Jupiter", title: "Creativity & Expression", short: "The Communicator.", keywords: "Creativity", strengths: ["Expression", "Optimism"], challenges: ["Scattered energy"], luckyDay: "Thursday", luckyColours: "Yellow, Purple", luckyNumbers: "3, 6, 9" },
  4: { planet: "Rahu", title: "Stability & Structure", short: "The Builder.", keywords: "Stability", strengths: ["Discipline", "Reliability"], challenges: ["Rigidity"], luckyDay: "Saturday", luckyColours: "Blue, Grey", luckyNumbers: "4, 5, 8" },
  5: { planet: "Mercury", title: "Freedom & Communication", short: "Mercury-ruled — quick, charming.", keywords: "Freedom", strengths: ["Universally liked", "Fast decisions", "Business acumen"], challenges: ["Restlessness", "Overthinking", "Nervous energy"], luckyDay: "Wednesday", luckyColours: "Green, Grey", luckyNumbers: "5, 3, 6" },
  6: { planet: "Venus", title: "Love & Luxury", short: "Venus-ruled — magnetic, artistic.", keywords: "Love", strengths: ["Attracts comfort", "Artistic gifts", "Harmony"], challenges: ["Over-indulgence"], luckyDay: "Friday", luckyColours: "Pink, White", luckyNumbers: "6, 3, 9" },
  7: { planet: "Ketu", title: "Wisdom & Analysis", short: "The Seeker.", keywords: "Wisdom", strengths: ["Analysis", "Insight"], challenges: ["Isolation"], luckyDay: "Tuesday", luckyColours: "Light Green", luckyNumbers: "7, 2" },
  8: { planet: "Saturn", title: "Power & Achievement", short: "The Achiever.", keywords: "Power", strengths: ["Ambition", "Resilience"], challenges: ["Delays"], luckyDay: "Saturday", luckyColours: "Black, Dark Blue", luckyNumbers: "8, 4, 5" },
  9: { planet: "Mars", title: "Courage & Compassion", short: "The Humanitarian.", keywords: "Courage", strengths: ["Courage", "Compassion"], challenges: ["Impulsiveness"], luckyDay: "Tuesday", luckyColours: "Red, Pink", luckyNumbers: "9, 3, 6" },
  11: { planet: "Neptune", title: "Master 11 — Visionary", short: "Master 11 — visionary guide.", keywords: "Inspiration", strengths: ["Vision", "Inspiration"], challenges: ["Tension"], luckyDay: "Monday", luckyColours: "Silver, Violet", luckyNumbers: "11, 2, 7" },
  22: { planet: "Uranus", title: "Master 22 — Builder", short: "Master 22 — large visions.", keywords: "Mastery", strengths: ["Vision", "Impact"], challenges: ["Pressure"], luckyDay: "Saturday", luckyColours: "Gold, Cream", luckyNumbers: "22, 4, 8" },
};

function meaningOf(n: number) {
  return NUMBER_MEANINGS[n] ?? NUMBER_MEANINGS[reduceToSingleDigit(n)] ?? NUMBER_MEANINGS[1];
}

export interface FullAnalysis {
  fullName: string; day: number; month: number; year: number; gender: string;
  name: ReturnType<typeof getNameNumber>;
  destiny: ReturnType<typeof getNameDestiny>;
  lifePath: ReturnType<typeof getLifePath>;
  psychic: number;
  soulUrge: ReturnType<typeof getSoulUrge>;
  personality: ReturnType<typeof getPersonality>;
  subconscious: number;
  compatibility: ReturnType<typeof getCompatibility>;
  nameMeaning: ReturnType<typeof meaningOf>;
  lifePathMeaning: ReturnType<typeof meaningOf>;
  correctedTease: ReturnType<typeof getCorrectedNameTease>;
  targetVibration: number;
}

export function analyzeName(fullName: string, day: number, month: number, year: number, gender: string): FullAnalysis {
  const name = getNameNumber(fullName);
  const destiny = getNameDestiny(fullName);
  const lifePath = getLifePath(day, month, year);
  const psychic = getPsychicNumber(day);
  const soulUrge = getSoulUrge(fullName);
  const personality = getPersonality(fullName);
  const subconscious = getSubconsciousSelf(fullName);
  const compatibility = getCompatibility(name.nameNumber, lifePath.lifePath);
  const targetVibration = suggestTargetVibration(lifePath.lifePath);
  const correctedTease = getCorrectedNameTease(fullName);
  correctedTease.targetVibration = targetVibration;
  correctedTease.targetTitle = meaningOf(targetVibration).title;
  return {
    fullName, day, month, year, gender, name, destiny, lifePath, psychic, soulUrge, personality, subconscious,
    compatibility, nameMeaning: meaningOf(name.nameNumber), lifePathMeaning: meaningOf(lifePath.lifePath),
    correctedTease, targetVibration,
  };
}
