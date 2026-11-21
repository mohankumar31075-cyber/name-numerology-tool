/**
 * Educational Hindu Panchang helpers (rule-based).
 * Structure mirrors hinducalendar.app sections for UX.
 */

export const TITHIS = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima",
];
export const TITHIS_KRISHNA = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Amavasya",
];
export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
];
export const YOGAS = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shula",
  "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan",
  "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti",
];
export const KARANAS = [
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimstughna",
];
export const MAAS = [
  "Chaitra", "Vaishakha", "Jyeshtha", "Ashadha", "Shravana", "Bhadrapada",
  "Ashwin", "Kartika", "Margashirsha", "Pausha", "Magha", "Phalguna",
];
export const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEKDAYS_HI = ["रविवार", "सोमवार", "मंगलवार", "बुधवार", "गुरुवार", "शुक्रवार", "शनिवार"];

export function rahuKalamSlot(weekday: number) {
  const part = [8, 2, 7, 5, 6, 4, 3][weekday];
  const startMin = 6 * 60 + (part - 1) * 90;
  const endMin = startMin + 90;
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return { start: fmt(startMin), end: fmt(endMin), label: "Rahu Kalam" };
}

export function yamaGhantaSlot(weekday: number) {
  const part = [5, 4, 3, 2, 1, 7, 6][weekday];
  const startMin = 6 * 60 + (part - 1) * 90;
  const endMin = startMin + 90;
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return { start: fmt(startMin), end: fmt(endMin), label: "Yama Ghanta" };
}

export function gulikaSlot(weekday: number) {
  const part = [7, 6, 5, 4, 3, 2, 1][weekday];
  const startMin = 6 * 60 + (part - 1) * 90;
  const endMin = startMin + 90;
  const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  return { start: fmt(startMin), end: fmt(endMin), label: "Gulika Kalam" };
}

export function abhijitMuhurta() {
  return { start: "11:48", end: "12:36", label: "Abhijit Muhurta" };
}

const DAY_CHOGH: string[][] = [
  ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg"],
  ["Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit"],
  ["Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog"],
  ["Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh"],
  ["Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh"],
  ["Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog", "Udveg", "Char"],
  ["Kaal", "Shubh", "Rog", "Udveg", "Char", "Labh", "Amrit", "Kaal"],
];

const NIGHT_CHOGH: string[][] = [
  ["Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh"],
  ["Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char"],
  ["Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal"],
  ["Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg"],
  ["Amrit", "Char", "Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit"],
  ["Rog", "Kaal", "Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog"],
  ["Labh", "Udveg", "Shubh", "Amrit", "Char", "Rog", "Kaal", "Labh"],
];

const AUSPICIOUS = new Set(["Amrit", "Shubh", "Labh", "Char"]);

export function choghadiyaDay(weekday: number) {
  return DAY_CHOGH[weekday].map((name, i) => {
    const startMin = 6 * 60 + i * 90;
    const endMin = startMin + 90;
    const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    return { name, start: fmt(startMin), end: fmt(endMin), good: AUSPICIOUS.has(name) };
  });
}

export function choghadiyaNight(weekday: number) {
  return NIGHT_CHOGH[weekday].map((name, i) => {
    const startMin = 18 * 60 + i * 90;
    const endMin = startMin + 90;
    const fmt = (m: number) => {
      const h = Math.floor(m / 60) % 24;
      return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    };
    return { name, start: fmt(startMin), end: fmt(endMin), good: AUSPICIOUS.has(name) };
  });
}

const HORA_LORDS = ["Sun", "Venus", "Mercury", "Moon", "Saturn", "Jupiter", "Mars"];
export function dayHoras(weekday: number) {
  const startIdx = weekday % 7;
  const out = [];
  for (let i = 0; i < 12; i++) {
    const lord = HORA_LORDS[(startIdx + i) % 7];
    const startMin = 6 * 60 + i * 60;
    const endMin = startMin + 60;
    const fmt = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
    out.push({ lord, start: fmt(startMin), end: fmt(endMin) });
  }
  return out;
}

export function panchangForDate(d: Date) {
  const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000);
  const cycle = dayOfYear % 30;
  const shukla = cycle < 15;
  const tithiIdx = cycle % 15;
  const tithi = shukla ? TITHIS[tithiIdx] : TITHIS_KRISHNA[tithiIdx];
  const paksha = shukla ? "Shukla Paksha" : "Krishna Paksha";
  const nakIdx = dayOfYear % 27;
  const yogaIdx = (dayOfYear * 3) % 27;
  const karanaIdx = (dayOfYear * 2) % 11;
  const maasIdx = Math.floor(((d.getMonth() + 10) % 12));
  const weekday = d.getDay();
  const vikram = d.getFullYear() + 57;
  const shaka = d.getFullYear() - 78;

  return {
    date: d.toISOString().slice(0, 10),
    weekday: WEEKDAYS[weekday],
    weekdayHi: WEEKDAYS_HI[weekday],
    tithi,
    paksha,
    maas: MAAS[maasIdx],
    nakshatra: NAKSHATRAS[nakIdx],
    yoga: YOGAS[yogaIdx],
    karana: KARANAS[karanaIdx],
    vikramSamvat: vikram,
    shakaSamvat: shaka,
    rahu: rahuKalamSlot(weekday),
    yama: yamaGhantaSlot(weekday),
    gulika: gulikaSlot(weekday),
    abhijit: abhijitMuhurta(),
    choghDay: choghadiyaDay(weekday),
    choghNight: choghadiyaNight(weekday),
    horas: dayHoras(weekday),
    sunrise: "06:00",
    sunset: "18:00",
    moonrise: "—",
    moonset: "—",
    note: "Educational timings based on traditional weekday rules (display assumes ~6:00 sunrise). City-accurate sunrise, exact tithi end times and lagna need full panchang — request via WhatsApp.",
  };
}
