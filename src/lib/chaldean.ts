/**
 * Chaldean Numerology Engine
 * Full analysis: Name, Life Path, Destiny, Personality, Soul Urge, Subconscious
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

export function reduceToSingleDigit(n: number): number {
  while (n > 9) {
    n = String(n)
      .split("")
      .reduce((sum, d) => sum + Number(d), 0);
  }
  return n;
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

/** Life Path from full DOB */
export function getLifePath(day: number, month: number, year: number): {
  compound: number;
  lifePath: number;
} {
  const compound = day + month + year;
  return { compound, lifePath: reduceToSingleDigit(compound) };
}

/** Psychic / Birth Day number */
export function getPsychicNumber(day: number): number {
  return reduceToSingleDigit(day);
}

/** Soul Urge = sum of vowels only */
export function getSoulUrge(name: string): {
  compound: number;
  soulUrge: number;
} {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  let compound = 0;
  for (const letter of clean) {
    if (VOWELS.has(letter)) compound += CHALDEAN_MAP[letter] ?? 0;
  }
  return { compound, soulUrge: reduceToSingleDigit(compound) || 0 };
}

/** Personality = sum of consonants only */
export function getPersonality(name: string): {
  compound: number;
  personality: number;
} {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  let compound = 0;
  for (const letter of clean) {
    if (!VOWELS.has(letter)) compound += CHALDEAN_MAP[letter] ?? 0;
  }
  return { compound, personality: reduceToSingleDigit(compound) || 0 };
}

/** Subconscious Self = count of distinct numbers present in the name (1-8) */
export function getSubconsciousSelf(name: string): number {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, "");
  const present = new Set<number>();
  for (const letter of clean) {
    const v = CHALDEAN_MAP[letter];
    if (v) present.add(v);
  }
  const count = present.size;
  return count === 0 ? 1 : reduceToSingleDigit(count) || count;
}

export type CompatibilityStatus = "excellent" | "good" | "average" | "needs_attention";

export function getCompatibility(
  nameNumber: number,
  lifePath: number
): {
  status: CompatibilityStatus;
  score: number;
  message: string;
} {
  if (nameNumber === lifePath) {
    return {
      status: "excellent",
      score: 95,
      message: "Your name number perfectly matches your life path. Strong natural alignment.",
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

  if (friendly[nameNumber]?.includes(lifePath)) {
    return {
      status: "good",
      score: 75,
      message: "Your name and life path numbers are compatible. Minor refinements can still strengthen results.",
    };
  }

  const challenging = [
    [1, 8], [2, 4], [2, 8], [3, 8], [4, 1], [4, 2], [7, 1], [7, 3], [7, 9], [8, 1], [8, 2], [8, 3], [8, 9],
  ];

  if (challenging.some(([a, b]) => (nameNumber === a && lifePath === b) || (nameNumber === b && lifePath === a))) {
    return {
      status: "needs_attention",
      score: 35,
      message: "There is a noticeable mismatch between your name vibration and life path. Name correction can help restore balance.",
    };
  }

  return {
    status: "average",
    score: 55,
    message: "Your name and life path are moderately aligned. Small spelling adjustments may improve flow and opportunities.",
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
  }
> = {
  1: {
    planet: "Sun",
    title: "Leadership & Ambition",
    short: "The Leader — strong will, initiative, and drive for recognition.",
    keywords: "Leadership, independence, ambition, originality",
    strengths: ["Natural leadership", "Strong initiative", "Original thinking"],
    challenges: ["Ego clashes", "Impatience", "Difficulty collaborating"],
  },
  2: {
    planet: "Moon",
    title: "Harmony & Diplomacy",
    short: "The Peacemaker — emotional intelligence and partnership energy.",
    keywords: "Sensitivity, cooperation, intuition, diplomacy",
    strengths: ["Diplomacy", "Intuition", "Supportive nature"],
    challenges: ["Over-sensitivity", "Indecision", "Dependency"],
  },
  3: {
    planet: "Jupiter",
    title: "Creativity & Expression",
    short: "The Communicator — joyful, expressive, and growth-oriented.",
    keywords: "Creativity, expression, optimism, expansion",
    strengths: ["Creative expression", "Optimism", "Social charm"],
    challenges: ["Scattered energy", "Over-talking", "Restlessness"],
  },
  4: {
    planet: "Rahu",
    title: "Stability & Structure",
    short: "The Builder — disciplined, reliable, and grounded.",
    keywords: "Stability, hard work, practicality, structure",
    strengths: ["Discipline", "Reliability", "Practical skills"],
    challenges: ["Rigidity", "Resistance to change", "Overwork"],
  },
  5: {
    planet: "Mercury",
    title: "Freedom & Versatility",
    short: "The Explorer — adaptable, quick-minded, and dynamic.",
    keywords: "Versatility, communication, freedom, curiosity",
    strengths: ["Adaptability", "Quick mind", "Communication"],
    challenges: ["Restlessness", "Inconsistency", "Scattered focus"],
  },
  6: {
    planet: "Venus",
    title: "Love & Luxury",
    short: "Venus-ruled — magnetic, artistic, luxurious.",
    keywords: "Harmony, love, beauty, responsibility",
    strengths: ["Attracts love & comfort", "Artistic gifts", "Family harmony"],
    challenges: ["Over-indulgence", "Relationship drama", "Distraction by beauty"],
  },
  7: {
    planet: "Ketu",
    title: "Wisdom & Analysis",
    short: "The Seeker — deep thinker with spiritual and analytical strength.",
    keywords: "Analysis, spirituality, introspection, wisdom",
    strengths: ["Deep analysis", "Spiritual insight", "Research ability"],
    challenges: ["Isolation", "Overthinking", "Detachment"],
  },
  8: {
    planet: "Saturn",
    title: "Power & Achievement",
    short: "The Achiever — ambitious, resilient, and authority-oriented.",
    keywords: "Power, material success, discipline, karma",
    strengths: ["Ambition", "Resilience", "Authority"],
    challenges: ["Hard lessons", "Delays", "Heavy responsibilities"],
  },
  9: {
    planet: "Mars",
    title: "Courage & Compassion",
    short: "The Humanitarian — passionate, idealistic, and action-driven.",
    keywords: "Energy, courage, compassion, completion",
    strengths: ["Courage", "Compassion", "Drive to complete"],
    challenges: ["Impulsiveness", "Conflict", "Burnout"],
  },
};

export interface FullAnalysis {
  fullName: string;
  day: number;
  month: number;
  year: number;
  gender: string;
  name: ReturnType<typeof getNameNumber>;
  lifePath: ReturnType<typeof getLifePath>;
  psychic: number;
  soulUrge: ReturnType<typeof getSoulUrge>;
  personality: ReturnType<typeof getPersonality>;
  subconscious: number;
  compatibility: ReturnType<typeof getCompatibility>;
  nameMeaning: (typeof NUMBER_MEANINGS)[number];
  lifePathMeaning: (typeof NUMBER_MEANINGS)[number];
}

export function analyzeName(
  fullName: string,
  day: number,
  month: number,
  year: number,
  gender: string
): FullAnalysis {
  const name = getNameNumber(fullName);
  const lifePath = getLifePath(day, month, year);
  const psychic = getPsychicNumber(day);
  const soulUrge = getSoulUrge(fullName);
  const personality = getPersonality(fullName);
  const subconscious = getSubconsciousSelf(fullName);
  const compatibility = getCompatibility(name.nameNumber, lifePath.lifePath);

  return {
    fullName,
    day,
    month,
    year,
    gender,
    name,
    lifePath,
    psychic,
    soulUrge,
    personality,
    subconscious,
    compatibility,
    nameMeaning: NUMBER_MEANINGS[name.nameNumber] ?? NUMBER_MEANINGS[1],
    lifePathMeaning: NUMBER_MEANINGS[lifePath.lifePath] ?? NUMBER_MEANINGS[1],
  };
}
