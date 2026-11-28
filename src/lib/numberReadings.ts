import { reduceToSingleDigit } from "./chaldean";

export type NumberReading = { digits: string; sum: number; number: number; theme: string };
const themes: Record<number, string> = {
  0: "A zero total is a neutral starting point in this simple digit-sum method.",
  1: "Initiative, independence and fresh starts.",
  2: "Cooperation, sensitivity and balance.",
  3: "Expression, creativity and learning.",
  4: "Structure, patience and practical effort.",
  5: "Change, communication and adaptability.",
  6: "Care, responsibility and harmony.",
  7: "Reflection, analysis and inner growth.",
  8: "Ambition, discipline and long-term effort.",
  9: "Compassion, energy and completion.",
};

/** Digit-sum reading: vehicle letters and formatting are deliberately excluded. */
export function numberReading(value: string, kind: "mobile" | "vehicle"): NumberReading | null {
  const input = value.trim().toUpperCase();
  if (kind === "mobile" && !/^[+\d\s()-]+$/.test(input)) return null;
  if (kind === "vehicle" && !/^[A-Z\d\s-]+$/.test(input)) return null;
  const digits = input.replace(/\D/g, "");
  if (kind === "mobile" ? digits.length < 10 || digits.length > 15 : digits.length < 1 || digits.length > 12) return null;
  const sum = [...digits].reduce((a, d) => a + Number(d), 0);
  const number = reduceToSingleDigit(sum);
  return { digits, sum, number, theme: themes[number] };
}
