"use client";

import { useState } from "react";

const GRAHAS = [
  { num: 1, name: "Surya (Sun)", role: "Soul, father, leadership, vitality", day: "Sunday", colour: "Orange / Gold", remedy: "Offer water to Sun at sunrise; wear ruby if advised" },
  { num: 2, name: "Chandra (Moon)", role: "Mind, mother, emotions, peace", day: "Monday", colour: "White / Silver", remedy: "Donate milk/rice on Monday; wear pearl if advised" },
  { num: 3, name: "Guru (Jupiter)", role: "Wisdom, luck, children, dharma", day: "Thursday", colour: "Yellow / Purple", remedy: "Donate yellow items; chant Guru mantra" },
  { num: 4, name: "Rahu", role: "Ambition, foreign, sudden gains", day: "Saturday", colour: "Smoke / Blue-grey", remedy: "Donate mustard oil; feed the needy" },
  { num: 5, name: "Budha (Mercury)", role: "Intellect, speech, trade, learning", day: "Wednesday", colour: "Green", remedy: "Donate green items; respect teachers" },
  { num: 6, name: "Shukra (Venus)", role: "Love, luxury, arts, marriage", day: "Friday", colour: "White / Pink", remedy: "Donate white sweets; keep surroundings clean" },
  { num: 7, name: "Ketu", role: "Spirituality, detachment, moksha", day: "Tuesday", colour: "Brown / Grey", remedy: "Donate black sesame; meditation" },
  { num: 8, name: "Shani (Saturn)", role: "Karma, discipline, longevity", day: "Saturday", colour: "Black / Dark blue", remedy: "Help workers; light sesame oil lamp" },
  { num: 9, name: "Mangal (Mars)", role: "Courage, energy, property, siblings", day: "Tuesday", colour: "Red", remedy: "Donate red lentils; Hanuman worship" },
];

const WA = "919008831075";

export default function NavagrahaPage() {
  const [day, setDay] = useState("");
  const [planet, setPlanet] = useState<(typeof GRAHAS)[0] | null>(null);

  function check() {
    const d = Number(day);
    if (!d || d < 1 || d > 31) {
      alert("Enter birth day (1–31)");
      return;
    }
    let n = d;
    while (n > 9) n = String(n).split("").reduce((s, x) => s + Number(x), 0);
    setPlanet(GRAHAS.find((g) => g.num === n) || GRAHAS[0]);
  }

  const msg = encodeURIComponent(
    planet
      ? `Hi, I checked Navagraha on your site.\nBirth day: ${day}\nRuling planet: ${planet.name}\nPlease send remedies report / payment QR on WhatsApp.`
      : `Hi, I want a full Navagraha / planetary remedies report. Please share details and payment QR.`
  );
  const waUrl = `https://wa.me/${WA}?text=${msg}`;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Nine Planets · Vedic Guide</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-gray-900 sm:text-4xl">Navagraha</h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Each birth number is ruled by one of the nine Grahas. Find your ruling planet and request a personalised remedies report on WhatsApp.
          </p>
        </div>

        <div className="mb-10 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 font-serif text-xl font-bold text-gray-900">Find your ruling planet</h2>
          <p className="mb-4 text-sm text-gray-500">Enter only the day of birth (1–31). We reduce it to a single digit.</p>
          <div className="flex flex-wrap gap-3">
            <input type="number" min={1} max={31} value={day} onChange={(e) => setDay(e.target.value)} placeholder="Birth day e.g. 8" className="w-40 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
            <button onClick={check} className="rounded-xl bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow">Check Planet</button>
          </div>
          {planet && (
            <div className="mt-5 rounded-xl bg-brand-50 p-4">
              <p className="text-sm text-brand-700">Your birth number maps to</p>
              <p className="font-serif text-2xl font-bold text-gray-900">{planet.name}</p>
              <p className="mt-1 text-sm text-gray-600">{planet.role}</p>
              <p className="mt-2 text-sm text-gray-700"><strong>Lucky day:</strong> {planet.day} · <strong>Colours:</strong> {planet.colour}</p>
              <p className="mt-1 text-sm text-gray-700"><strong>Simple remedy:</strong> {planet.remedy}</p>
            </div>
          )}
        </div>

        <h2 className="mb-4 font-serif text-xl font-bold text-gray-900">The Nine Navagraha</h2>
        <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GRAHAS.map((g) => (
            <div key={g.num} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-brand-700 text-lg font-bold text-white">{g.num}</div>
              <p className="font-semibold text-gray-900">{g.name}</p>
              <p className="mt-1 text-xs text-gray-500">{g.role}</p>
              <p className="mt-2 text-xs text-brand-800">{g.day} · {g.colour}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 text-center shadow">
          <h2 className="font-serif text-xl font-bold text-gray-900">Full Navagraha Remedies Report</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
            Get planet-wise remedies, dosha notes and a personalised plan. Message us on WhatsApp — we will send the payment QR / UPI link.
          </p>
          <a href={waUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-green-700">
            Request report on WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
}
