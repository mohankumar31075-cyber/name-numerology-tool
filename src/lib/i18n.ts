export type Lang = "en" | "hi" | "kn";

export const LANG_OPTIONS: { code: Lang; label: string; native: string }[] = [
  { code: "en", label: "English", native: "English" },
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
];

export function langLabel(code: string): string {
  return LANG_OPTIONS.find((l) => l.code === code)?.native || "English";
}

export const UI: Record<Lang, Record<string, string>> = {
  en: {
    reportLang: "Report language",
    fullName: "Full Name",
    dob: "Date of Birth",
    tob: "Time of Birth",
    gender: "Gender",
    checkName: "Check My Name Free",
    selectLang: "Language for full report (PDF / WhatsApp)",
  },
  hi: {
    reportLang: "रिपोर्ट की भाषा",
    fullName: "पूरा नाम",
    dob: "जन्म तिथि",
    tob: "जन्म समय",
    gender: "लिंग",
    checkName: "मुफ़्त नाम जाँचें",
    selectLang: "पूर्ण रिपोर्ट की भाषा (PDF / WhatsApp)",
  },
  kn: {
    reportLang: "ವರದಿಯ ಭಾಷೆ",
    fullName: "ಪೂರ್ಣ ಹೆಸರು",
    dob: "ಜನ್ಮ ದಿನಾಂಕ",
    tob: "ಜನ್ಮ ಸಮಯ",
    gender: "ಲಿಂಗ",
    checkName: "ಉಚಿತ ಹೆಸರು ಪರಿಶೀಲಿಸಿ",
    selectLang: "ಪೂರ್ಣ ವರದಿಯ ಭಾಷೆ (PDF / WhatsApp)",
  },
};
