/**
 * Chaldean Numerology Engine — aligned closer to commercial name-correction funnels
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

/** Reduce, but keep Master numbers 11 and 22 */
export function reduceNumber(n: number, keepMaster = true): number {
  while (n > 9) {
    if (keepMaster && (n === 11 || n === 22)) return n;
    n = String(n)
      .split("")
      .reduce((sum, d) => sum + Number(d), 0);
  }
  return n;
}

export function reduceToSingleDigit(n: number): number {
  return reduceNumber(n, false);
}

export function getNameNumber(name: string): {
  compound: number;
  nameNumber: number;
  letterBreakdown: { letter: string; value: number }[];
} {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  const letterBreakdown: { letter: string; value: number }[] = [];
  let compound = 0;
  for (const letter of clean) {
    const value = CHALDEAN_MAP[letter] ?? 0;
    letterBreakdown.push({ letter, value });
    compound += value;
  }
  return {
    compound,
    nameNumber: reduceToSingleDigit(compound),
    letterBreakdown,
  };
}

export function getNameDestiny(name: string): {
  compound: number;
  destiny: number;
} {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  let compound = 0;
  for (const letter of clean) compound += CHALDEAN_MAP[letter] ?? 0;
  return { compound, destiny: reduceNumber(compound, true) };
}

export function getLifePath(day: number, month: number, year: number): {
  compound: number;
  lifePath: number;
} {
  const compound = day + month + year;
  return { compound, lifePath: reduceNumber(compound, true) };
}

export function getPsychicNumber(day: number): number {
  return reduceNumber(day, true);
}

export function getSoulUrge(name: string): {
  compound: number;
  soulUrge: number;
} {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  let compound = 0;
  for (const letter of clean) {
    if (VOWELS.has(letter)) compound += CHALDEAN_MAP[letter] ?? 0;
  }
  return { compound, soulUrge: reduceNumber(compound, true) || 1 };
}

export function getPersonality(name: string): {
  compound: number;
  personality: number;
} {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  let compound = 0;
  for (const letter of clean) {
    if (!VOWELS.has(letter)) compound += CHALDEAN_MAP[letter] ?? 0;
  }
  return { compound, personality: reduceNumber(compound, true) || 1 };
}

export function getSubconsciousSelf(name: string): number {
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

export function getCompatibility(
  nameNumber: number,
  lifePath: number
): {
  status: CompatibilityStatus;
  score: number;
  message: string;
  hasIssue: boolean;
  currentStrength: number;
  correctedStrength: number;
} {
  const singleName = reduceToSingleDigit(nameNumber);
  const singleLife = reduceToSingleDigit(lifePath);

  if (singleName === singleLife) {
    return {
      status: "excellent",
      score: 95,
      message: "Your name number perfectly matches your life path. Strong natural alignment.",
      hasIssue: false,
      currentStrength: 88,
      correctedStrength: 95,
    };
  }

  const friendly: Record<number, number[]> = {
    1: [1, 2, 3, 5, 6, 9],
    2: [1, 2, 3, 7, 9],
    3: [1, 2, 3, 5, 6, 9],
    4: [4, 5, 6, 7, 8],
    5: [1, 3, 5, 6, 7, 9],
    6: [1, 3, 4, 5, 6, 9],
    7: [2, 4, 5, 7],
    8: [4, 5, 6, 8],
    9: [1, 2, 3, 5, 6, 9],
  };

  if (friendly[singleName]?.includes(singleLife)) {
    return {
      status: "good",
      score: 72,
      message: "Your name and life path numbers are compatible. Minor refinements can still strengthen results.",
      hasIssue: true,
      currentStrength: 62,
      correctedStrength: 92,
    };
  }

  const challenging = [
    [1, 8], [2, 4], [2, 8], [3, 8], [4, 1], [4, 2], [5, 4], [5, 8],
    [7, 1], [7, 3], [7, 9], [8, 1], [8, 2], [8, 3], [8, 9],
  ];

  if (
    challenging.some(
      ([a, b]) =>
        (singleName === a && singleLife === b) || (singleName === b && singleLife === a)
    )
  ) {
    return {
      status: "needs_attention",
      score: 38,
      message: "There is a noticeable mismatch. Name correction can help restore balance and money flow.",
      hasIssue: true,
      currentStrength: 45,
      correctedStrength: 90,
    };
  }

  return {
    status: "average",
    score: 55,
    message: "Moderately aligned. Small spelling adjustments may improve opportunities.",
    hasIssue: true,
    currentStrength: 58,
    correctedStrength: 88,
  };
}

export function suggestTargetVibration(lifePath: number): number {
  const single = reduceToSingleDigit(lifePath);
  const preferred = [6, 3, 1, 9, 5, 2];
  for (const p of preferred) {
    if (p === single || [1, 2, 3, 5, 6, 9].includes(p)) return p;
  }
  return 6;
}

export function getCorrectedNameTease(fullName: string): {
  visibleStart: string;
  blurred: string;
  visibleEnd: string;
  targetVibration: number;
  targetTitle: string;
} {
  const parts = fullName.trim().split(/\s+/);
  const first = parts[0] || fullName;
  const rest = parts.slice(1).join(" ");

  let visibleStart = first.slice(0, Math.min(3, first.length));
  let blurred = "••••";
  if (first.length <= 3) {
    visibleStart = first.slice(0, 1);
    blurred = "••";
  }

  return {
    visibleStart: visibleStart.toUpperCase(),
    blurred,
    visibleEnd: rest.toUpperCase(),
    targetVibration: 6,
    targetTitle: "Love, Luxury & Comfort",
  };
}

export const NUMBER_MEANINGS: Record<
  number,
  {
    planet: string;
    title: string;
    short: string;
    keywords: string;
    strengths: string[];
    challenges: string[];
    luckyDay: string;
    luckyColours: string;
    luckyNumbers: string;
  }
> = {
  1: {
    planet: "Sun",
    title: "Leadership & Ambition",
    short: "The Leader — strong will, initiative, and drive for recognition.",
    keywords: "Leadership, independence, ambition",
    strengths: ["Natural leadership", "Strong initiative", "Original thinking"],
    challenges: ["Ego clashes", "Impatience", "Difficulty collaborating"],
    luckyDay: "Sunday",
    luckyColours: "Gold, Orange",
    luckyNumbers: "1, 2, 3",
  },
  2: {
    planet: "Moon",
    title: "Harmony & Diplomacy",
    short: "The Peacemaker — emotional intelligence and partnership energy.",
    keywords: "Sensitivity, cooperation, intuition",
    strengths: ["Diplomacy", "Intuition", "Supportive nature"],
    challenges: ["Over-sensitivity", "Indecision", "Dependency"],
    luckyDay: "Monday",
    luckyColours: "White, Silver",
    luckyNumbers: "2, 7",
  },
  3: {
    planet: "Jupiter",
    title: "Creativity & Expression",
    short: "The Communicator — expressive, joyful, uplifts others.",
    keywords: "Creativity, expression, optimism",
    strengths: ["Creative expression", "Optimism", "Social charm"],
    challenges: ["Scattered energy", "Over-talking", "Restlessness"],
    luckyDay: "Thursday",
    luckyColours: "Yellow, Purple",
    luckyNumbers: "3, 6, 9",
  },
  4: {
    planet: "Rahu",
    title: "Stability & Structure",
    short: "The Builder — disciplined, reliable, and grounded.",
    keywords: "Stability, hard work, practicality",
    strengths: ["Discipline", "Reliability", "Practical skills"],
    challenges: ["Rigidity", "Resistance to change", "Overwork"],
    luckyDay: "Saturday",
    luckyColours: "Blue, Grey",
    luckyNumbers: "4, 5, 8",
  },
  5: {
    planet: "Mercury",
    title: "Freedom & Communication",
    short: "Mercury-ruled — quick, charming, universal.",
    keywords: "Versatility, communication, freedom",
    strengths: ["Universally liked", "Fast decisions", "Business acumen"],
    challenges: ["Restlessness", "Overthinking", "Nervous energy"],
    luckyDay: "Wednesday",
    luckyColours: "Green, Grey",
    luckyNumbers: "5, 3, 6",
  },
  6: {
    planet: "Venus",
    title: "Love & Luxury",
    short: "Venus-ruled — magnetic, artistic, luxurious.",
    keywords: "Harmony, love, beauty, responsibility",
    strengths: ["Attracts love & comfort", "Artistic gifts", "Family harmony"],
    challenges: ["Over-indulgence", "Relationship drama", "Distraction by beauty"],
    luckyDay: "Friday",
    luckyColours: "Pink, White",
    luckyNumbers: "6, 3, 9",
  },
  7: {
    planet: "Ketu",
    title: "Wisdom & Analysis",
    short: "The Seeker — deep thinker with spiritual strength.",
    keywords: "Analysis, spirituality, introspection",
    strengths: ["Deep analysis", "Spiritual insight", "Research ability"],
    challenges: ["Isolation", "Overthinking", "Detachment"],
    luckyDay: "Tuesday",
    luckyColours: "Light Green, Grey",
    luckyNumbers: "7, 2",
  },
  8: {
    planet: "Saturn",
    title: "Power & Achievement",
    short: "The Achiever — ambitious, resilient, authority-oriented.",
    keywords: "Power, material success, discipline",
    strengths: ["Ambition", "Resilience", "Authority"],
    challenges: ["Hard lessons", "Delays", "Heavy responsibilities"],
    luckyDay: "Saturday",
    luckyColours: "Black, Dark Blue",
    luckyNumbers: "8, 4, 5",
  },
  9: {
    planet: "Mars",
    title: "Courage & Compassion",
    short: "The Humanitarian — passionate, idealistic, action-driven.",
    keywords: "Energy, courage, compassion",
    strengths: ["Courage", "Compassion", "Drive to complete"],
    challenges: ["Impulsiveness", "Conflict", "Burnout"],
    luckyDay: "Tuesday",
    luckyColours: "Red, Pink",
    luckyNumbers: "9, 3, 6",
  },
  11: {
    planet: "Neptune",
    title: "Master 11 — Visionary",
    short: "Master 11 — visionary guide & inspirational leader.",
    keywords: "Inspiration, intuition, spiritual leadership",
    strengths: ["Visionary insight", "Inspiration to others", "Spiritual awareness"],
    challenges: ["Nervous tension", "High expectations", "Scattered focus"],
    luckyDay: "Monday",
    luckyColours: "Silver, Violet",
    luckyNumbers: "11, 2, 7",
  },
  22: {
    planet: "Uranus",
    title: "Master 22 — Master Builder",
    short: "Master 22 — turns big visions into reality.",
    keywords: "Mastery, large-scale achievement, structure",
    strengths: ["Large-scale vision", "Practical mastery", "Lasting impact"],
    challenges: ["Pressure of potential", "Overwhelm", "Perfectionism"],
    luckyDay: "Saturday",
    luckyColours: "Gold, Cream",
    luckyNumbers: "22, 4, 8",
  },
};

function meaningOf(n: number) {
  return NUMBER_MEANINGS[n] ?? NUMBER_MEANINGS[reduceToSingleDigit(n)] ?? NUMBER_MEANINGS[1];
}

export interface FullAnalysis {
  fullName: string;
  day: number;
  month: number;
  year: number;
  gender: string;
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

export function analyzeName(
  fullName: string,
  day: number,
  month: number,
  year: number,
  gender: string
): FullAnalysis {
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
    fullName,
    day,
    month,
    year,
    gender,
    name,
    destiny,
    lifePath,
    psychic,
    soulUrge,
    personality,
    subconscious,
    compatibility,
    nameMeaning: meaningOf(name.nameNumber),
    lifePathMeaning: meaningOf(lifePath.lifePath),
    correctedTease,
    targetVibration,
  };
}
