export type ReportType = "horoscope" | "numerology" | "panchang";

export const REPORT_TYPES: ReportType[] = ["horoscope", "numerology", "panchang"];

export function isReportType(value: string | null | undefined): value is ReportType {
  return value === "horoscope" || value === "numerology" || value === "panchang";
}

export const REPORT_LABEL: Record<ReportType, string> = {
  horoscope: "Birth Horoscope",
  numerology: "Name Numerology",
  panchang: "Daily Panchang",
};

/** Languages offered in the form, mapped to the app's internal language codes. */
export const REPORT_LANGUAGES = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
] as const;

export type ReportLanguageCode = (typeof REPORT_LANGUAGES)[number]["code"];

export const GENDERS = ["", "Female", "Male", "Other"] as const;

/** Share of the ₹299 full report that a preview request unlocks as analytics metadata. */
export const BASE_REPORT_PRICE = 299;

export function languageLabel(code: string | null | undefined): string {
  return (
    REPORT_LANGUAGES.find((l) => l.code === code)?.label ?? "English"
  );
}

export function languageNative(code: string | null | undefined): string {
  return (
    REPORT_LANGUAGES.find((l) => l.code === code)?.native ?? "English"
  );
}

export type BirthDetailsInput = {
  reportType: ReportType;
  fullName: string;
  birthDate: string; // yyyy-mm-dd, empty allowed for panchang
  birthTime: string; // HH:mm, empty allowed
  birthPlace: string;
  language: ReportLanguageCode;
  gender: string;
};

export const EMPTY_BIRTH_DETAILS: BirthDetailsInput = {
  reportType: "horoscope",
  fullName: "",
  birthDate: "",
  birthTime: "",
  birthPlace: "Bengaluru, India",
  language: "en",
  gender: "",
};

/** Accepts yyyy-mm-dd or dd/mm/yyyy style strings and returns parts, or null. */
export function parseBirthDate(
  value: string
): { day: number; month: number; year: number } | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    if (!isValidDate(day, month, year)) return null;
    return { day, month, year };
  }
  return null;
}

export function parseBirthTime(
  value: string
): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export function isValidDate(day: number, month: number, year: number): boolean {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const d = new Date(Date.UTC(year, month - 1, day));
  return (
    d.getUTCFullYear() === year &&
    d.getUTCMonth() === month - 1 &&
    d.getUTCDate() === day
  );
}

export function toIsoDate(day: number, month: number, year: number): string {
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Human-readable date, e.g. 12 March 1991. */
export function formatBirthDate(iso: string): string {
  const parts = parseBirthDate(iso);
  if (!parts) return "—";
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${parts.day} ${months[parts.month - 1]} ${parts.year}`;
}

/** 24h time to 12h display, e.g. 07:05 → 7:05 AM. */
export function formatBirthTime(value: string): string {
  const t = parseBirthTime(value);
  if (!t) return "";
  const suffix = t.hour >= 12 ? "PM" : "AM";
  const hour12 = t.hour % 12 === 0 ? 12 : t.hour % 12;
  return `${hour12}:${String(t.minute).padStart(2, "0")} ${suffix}`;
}

export function isValidWhatsAppNumber(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}
