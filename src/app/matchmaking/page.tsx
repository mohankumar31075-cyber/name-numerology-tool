"use client";

import { useState } from "react";

const WA = "919008831075";

function roughMatchScore(
  boyName: string,
  girlName: string,
  boyDay: number,
  girlDay: number
): { score: number; max: number; label: string; points: { name: string; got: number; max: number }[] } {
  const reduce = (n: number) => {
    while (n > 9) n = String(n).split("").reduce((s, d) => s + Number(d), 0);
    return n;
  };
  const b = reduce(boyDay);
  const g = reduce(girlDay);
  const nameScore = (() => {
    const sum = (s: string) =>
      s.toUpperCase().replace(/[^A-Z]/g, "").split("").reduce((acc, ch) => acc + (ch.charCodeAt(0) - 64), 0);
    const bn = reduce(sum(boyName));
    const gn = reduce(sum(girlName));
    return bn === gn ? 8 : Math.abs(bn - gn) <= 2 ? 6 : 4;
  })();
  const varna = b % 4 === g % 4 ? 1 : 0;
  const vashya = Math.abs(b - g) <= 3 ? 2 : 1;
  const tara = 3;
  const yoni = Math.abs(b - g) % 2 === 0 ? 3 : 2;
  const graha = b === g || Math.abs(b - g) === 1 ? 5 : 3;
  const gana = Math.abs(b - g) <= 2 ? 6 : 4;
  const bhakoot = Math.abs(b - g) !== 6 ? 7 : 0;
  const nadi = b !== g ? 8 : 0;
  const points = [
    { name: "Varna", got: varna, max: 1 },
    { name: "Vashya", got: vashya, max: 2 },
    { name: "Tara", got: tara, max: 3 },
    { name: "Yoni", got: yoni, max: 4 },
    { name: "Graha Maitri", got: graha, max: 5 },
    { name: "Gana", got: gana, max: 6 },
    { name: "Bhakoot", got: bhakoot, max: 7 },
    { name: "Nadi", got: nadi, max: 8 },
    { name: "Name harmony", got: nameScore, max: 8 },
  ];
  const score = points.reduce((s, p) => s + p.got, 0);
  const max = points.reduce((s, p) => s + p.max, 0);
  let label = "Average match";
  if (score >= max * 0.75) label = "Excellent match";
  else if (score >= max * 0.55) label = "Good match";
  else if (score < max * 0.4) label = "Needs careful review";
  return { score, max, label, points };
}

export default function MatchmakingPage() {
  const [boyName, setBoyName] = useState("");
  const [girlName, setGirlName] = useState("");
  const [boyDay, setBoyDay] = useState("");
  const [girlDay, setGirlDay] = useState("");
  const [result, setResult] = useState<ReturnType<typeof roughMatchScore> | null>(null);

  function run() {
    if (!boyName || !girlName || !boyDay || !girlDay) {
      alert("Please fill boy & girl name and birth day");
      return;
    }
    setResult(roughMatchScore(boyName, girlName, Number(boyDay), Number(girlDay)));
  }

  const msg = encodeURIComponent(
    result
      ? `Hi, I checked Matchmaking on your site.\nBoy: ${boyName} (day ${boyDay})\nGirl: ${girlName} (day ${girlDay})\nScore: ${result.score}/${result.max} — ${result.label}\nPlease send full Kundli Milan report + payment QR.`
      : `Hi, I want full Kundli Matchmaking report. Please share details and payment QR.`
  );
  const waUrl = `https://wa.me/${WA}?text=${msg}`;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Kundli Milan</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-gray-900">Matchmaking</h1>
          <p className="mt-2 text-sm text-gray-600">Quick compatibility preview. Full report via WhatsApp.</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Boy — Full name</label>
            <input value={boyName} onChange={(e) => setBoyName(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400" placeholder="e.g. Rahul Sharma" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Boy — Birth day (1–31)</label>
            <input type="number" min={1} max={31} value={boyDay} onChange={(e) => setBoyDay(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Girl — Full name</label>
            <input value={girlName} onChange={(e) => setGirlName(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400" placeholder="e.g. Priya Verma" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-500">Girl — Birth day (1–31)</label>
            <input type="number" min={1} max={31} value={girlDay} onChange={(e) => setGirlDay(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
          </div>
          <button onClick={run} className="w-full rounded-xl bg-brand-700 py-3 text-sm font-semibold text-white shadow">
            Check Match
          </button>
        </div>

        {result && (
          <div className="mt-6 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
            <p className="text-center text-sm text-gray-500">Compatibility score</p>
            <p className="text-center font-serif text-4xl font-bold text-brand-800">
              {result.score}<span className="text-lg text-gray-400">/{result.max}</span>
            </p>
            <p className="mt-1 text-center font-semibold text-emerald-700">{result.label}</p>
            <ul className="mt-4 space-y-1.5 text-sm">
              {result.points.map((p) => (
                <li key={p.name} className="flex justify-between border-b border-gray-50 py-1">
                  <span className="text-gray-600">{p.name}</span>
                  <span className="font-medium text-gray-900">{p.got}/{p.max}</span>
                </li>
              ))}
            </ul>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="mt-5 flex w-full items-center justify-center rounded-xl bg-green-600 py-3 text-sm font-semibold text-white">
              Get full Kundli Milan on WhatsApp →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
