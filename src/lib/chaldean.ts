/**
 * Chaldean Numerology Engine
 * Standard letter values used in Indian name correction practice.
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
  const clean = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "");

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

/** Birth / Destiny number from full DOB (day + month + year) */
export function getBirthNumber(day: number, month: number, year: number): {
  compound: number;
  birthNumber: number;
} {
  const compound = day + month + year;
  return {
    compound,
    birthNumber: reduceToSingleDigit(compound),
  };
}

/** Psychic / Birth Day number (just the day reduced) */
export function getPsychicNumber(day: number): number {
  return reduceToSingleDigit(day);
}

export type CompatibilityStatus = "excellent" | "good" | "average" | "needs_attention";

export function getCompatibility(
  nameNumber: number,
  birthNumber: number
): {
  status: CompatibilityStatus;
  score: number; // 0-100
  message: string;
} {
  // Simple rule set commonly used in name correction:
  // Same number = excellent
  // Friendly pairs = good
  // Others = average / needs attention

  if (nameNumber === birthNumber) {
    return {
      status: "excellent",
      score: 95,
      message: "Your name number perfectly matches your birth number. Strong natural alignment.",
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

  const isFriendly = friendly[nameNumber]?.includes(birthNumber) ?? false;

  if (isFriendly) {
    return {
      status: "good",
      score: 75,
      message: "Your name and birth numbers are compatible. Minor refinements can still strengthen results.",
    };
  }

  // Some common "challenging" combinations
  const challenging = [
    [1, 8], [2, 4], [2, 8], [3, 8], [4, 1], [4, 2], [7, 1], [7, 3], [7, 9], [8, 1], [8, 2], [8, 3], [8, 9],
  ];

  const isChallenging = challenging.some(
    ([a, b]) => (nameNumber === a && birthNumber === b) || (nameNumber === b && birthNumber === a)
  );

  if (isChallenging) {
    return {
      status: "needs_attention",
      score: 35,
      message: "There is a noticeable mismatch between your name vibration and birth energy. Name correction can help restore balance.",
    };
  }

  return {
    status: "average",
    score: 55,
    message: "Your name and birth numbers are moderately aligned. Small spelling adjustments may improve flow and opportunities.",
  };
}

export const NUMBER_MEANINGS: Record<number, { planet: string; keywords: string; short: string }> = {
  1: {
    planet: "Sun",
    keywords: "Leadership, independence, ambition, originality",
    short: "The Leader — strong will, initiative, and drive for recognition.",
  },
  2: {
    planet: "Moon",
    keywords: "Sensitivity, cooperation, intuition, diplomacy",
    short: "The Peacemaker — emotional intelligence and partnership energy.",
  },
  3: {
    planet: "Jupiter",
    keywords: "Creativity, expression, optimism, expansion",
    short: "The Communicator — joyful, expressive, and growth-oriented.",
  },
  4: {
    planet: "Rahu",
    keywords: "Stability, hard work, practicality, structure",
    short: "The Builder — disciplined, reliable, and grounded.",
  },
  5: {
    planet: "Mercury",
    keywords: "Versatility, communication, freedom, curiosity",
    short: "The Explorer — adaptable, quick-minded, and dynamic.",
  },
  6: {
    planet: "Venus",
    keywords: "Harmony, love, beauty, responsibility",
    short: "The Nurturer — artistic, balanced, and relationship-focused.",
  },
  7: {
    planet: "Ketu",
    keywords: "Analysis, spirituality, introspection, wisdom",
    short: "The Seeker — deep thinker with spiritual and analytical strength.",
  },
  8: {
    planet: "Saturn",
    keywords: "Power, material success, discipline, karma",
    short: "The Achiever — ambitious, resilient, and authority-oriented.",
  },
  9: {
    planet: "Mars",
    keywords: "Energy, courage, compassion, completion",
    short: "The Humanitarian — passionate, idealistic, and action-driven.",
  },
};

export interface FullAnalysis {
  fullName: string;
  day: number;
  month: number;
  year: number;
  gender: string;
  name: ReturnType<typeof getNameNumber>;
  birth: ReturnType<typeof getBirthNumber>;
  psychic: number;
  compatibility: ReturnType<typeof getCompatibility>;
  nameMeaning: (typeof NUMBER_MEANINGS)[number];
  birthMeaning: (typeof NUMBER_MEANINGS)[number];
}

export function analyzeName(
  fullName: string,
  day: number,
  month: number,
  year: number,
  gender: string
): FullAnalysis {
  const name = getNameNumber(fullName);
  const birth = getBirthNumber(day, month, year);
  const psychic = getPsychicNumber(day);
  const compatibility = getCompatibility(name.nameNumber, birth.birthNumber);

  return {
    fullName,
    day,
    month,
    year,
    gender,
    name,
    birth,
    psychic,
    compatibility,
    nameMeaning: NUMBER_MEANINGS[name.nameNumber],
    birthMeaning: NUMBER_MEANINGS[birth.birthNumber],
  };
}
