import { reduceToSingleDigit } from "./chaldean";

const PHASES = [
  { key: "childhood", from: 0, to: 12, title: { en: "Childhood foundation", hi: "बाल्यावस्था आधार", kn: "ಬಾಲ್ಯದ ಅಡಿಪಾಯ" } },
  { key: "youth", from: 12, to: 24, title: { en: "Youth & learning", hi: "यौवन और शिक्षा", kn: "ಯೌವನ ಮತ್ತು ಕಲಿಕೆ" } },
  { key: "career", from: 24, to: 36, title: { en: "Career establishment", hi: "करियर स्थापना", kn: "ವೃತ್ತಿ ಸ್ಥಾಪನೆ" } },
  { key: "growth", from: 36, to: 48, title: { en: "Growth & responsibility", hi: "विकास और ज़िम्मेदारी", kn: "ಬೆಳವಣಿಗೆ ಮತ್ತು ಜವಾಬ್ದಾರಿ" } },
  { key: "peak", from: 48, to: 60, title: { en: "Peak influence", hi: "शीर्ष प्रभाव", kn: "ಉನ್ನತ ಪ್ರಭಾವ" } },
  { key: "wisdom", from: 60, to: 84, title: { en: "Wisdom & legacy", hi: "ज्ञान और विरासत", kn: "ಜ್ಞಾನ ಮತ್ತು ಪರಂಪರೆ" } },
];

const THEMES: Record<number, { past: string; present: string; future: string }> = {
  1: { past: "Leadership trials and independent starts shaped early identity.", present: "Focus is on authority, recognition, and self-driven goals.", future: "New initiatives and visibility improve when name vibration is aligned." },
  2: { past: "Relationships and sensitivity played a strong role in formative years.", present: "Partnerships, diplomacy, and emotional balance matter most.", future: "Harmony at home and work strengthens with supportive name energy." },
  3: { past: "Creative expression and communication opened many doors.", present: "Visibility, teaching, and social skill are active themes.", future: "Creative or speaking roles expand when numbers support Jupiter energy." },
  4: { past: "Structure, hard work, and practical foundations were emphasized.", present: "Systems, property, and discipline define the current phase.", future: "Stability grows through consistent effort and name correction if needed." },
  5: { past: "Change, movement, and curiosity marked earlier chapters.", present: "Freedom, business, and adaptability are highlighted.", future: "Travel and opportunity increase when restlessness is channelled." },
  6: { past: "Family duty and caretaking themes appeared early.", present: "Love, comfort, and responsibility are central.", future: "Luxury and relationship harmony improve under Venus-aligned names." },
  7: { past: "Inner search and analysis shaped personality.", present: "Research, spirituality, or specialised skill is active.", future: "Wisdom and quiet success grow with focused remedies." },
  8: { past: "Delays and hard lessons built resilience.", present: "Karma, authority, and long-term results are in focus.", future: "Status and resources improve after sustained discipline." },
  9: { past: "Service, courage, and broad ideals influenced the past.", present: "Compassion and completion of cycles are themes.", future: "Public work and generosity bring recognition." },
};

export function buildLifeTimeline(day: number, month: number, year: number, lifePath: number) {
  const now = new Date();
  const age = now.getFullYear() - year - (now.getMonth() + 1 < month || (now.getMonth() + 1 === month && now.getDate() < day) ? 1 : 0);
  const lp = reduceToSingleDigit(lifePath);
  const theme = THEMES[lp] || THEMES[1];
  const phases = PHASES.map((p) => {
    let status: "past" | "present" | "future" = "future";
    if (age >= p.to) status = "past";
    else if (age >= p.from) status = "present";
    return { ...p, status, ageRange: `${p.from}–${p.to}` };
  });
  return {
    age,
    lifePath: lp,
    past: theme.past,
    present: theme.present,
    future: theme.future,
    phases,
    disclaimer:
      "Preview based on life-path numerology and age phases. Full Vedic Kundli with planetary dashas requires exact birth place + expert chart — delivered on WhatsApp in your chosen language.",
  };
}

export function rahuKalamForWeekday(d: Date): string {
  const slots = ["07:30–09:00", "13:30–15:00", "15:00–16:30", "12:00–13:30", "10:30–12:00", "09:00–10:30", "06:00–07:30"];
  return slots[d.getDay()];
}

const TITHIS = ["Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima/Amavasya"];
const NAKSHATRAS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];

export function panchangSnapshot(d: Date) {
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  const tithiIdx = dayOfYear % 15;
  const nakIdx = dayOfYear % 27;
  const paksha = dayOfYear % 30 < 15 ? "Shukla Paksha" : "Krishna Paksha";
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    date: d.toISOString().slice(0, 10),
    weekday: weekdays[d.getDay()],
    tithi: TITHIS[tithiIdx],
    nakshatra: NAKSHATRAS[nakIdx],
    paksha,
    rahuKalam: rahuKalamForWeekday(d),
    note: "Educational snapshot from calendar rules. For city-accurate sunrise/tithi ends, use full Panchang report via WhatsApp.",
  };
}
