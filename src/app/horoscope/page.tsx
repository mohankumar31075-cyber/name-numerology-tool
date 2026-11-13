"use client";

import { useState } from "react";

const WA = "919008831075";

const SIGNS = [
  { name: "Aries", dates: "Mar 21 – Apr 19", emoji: "♈" },
  { name: "Taurus", dates: "Apr 20 – May 20", emoji: "♉" },
  { name: "Gemini", dates: "May 21 – Jun 20", emoji: "♊" },
  { name: "Cancer", dates: "Jun 21 – Jul 22", emoji: "♋" },
  { name: "Leo", dates: "Jul 23 – Aug 22", emoji: "♌" },
  { name: "Virgo", dates: "Aug 23 – Sep 22", emoji: "♍" },
  { name: "Libra", dates: "Sep 23 – Oct 22", emoji: "♎" },
  { name: "Scorpio", dates: "Oct 23 – Nov 21", emoji: "♏" },
  { name: "Sagittarius", dates: "Nov 22 – Dec 21", emoji: "♐" },
  { name: "Capricorn", dates: "Dec 22 – Jan 19", emoji: "♑" },
  { name: "Aquarius", dates: "Jan 20 – Feb 18", emoji: "♒" },
  { name: "Pisces", dates: "Feb 19 – Mar 20", emoji: "♓" },
];

const SNIPPETS: Record<string, string> = {
  Aries: "Energy is high for new starts. Focus on one clear goal at work; avoid rushed money decisions.",
  Taurus: "Steady progress in finances. A conversation at home brings clarity — stay patient.",
  Gemini: "Communication opens doors. Share ideas carefully; a short trip or call helps.",
  Cancer: "Emotions run deep. Protect your peace; family support is stronger than you think.",
  Leo: "Recognition is possible. Lead with kindness; creative work gets noticed.",
  Virgo: "Detail work pays off. Health routines matter — small improvements compound.",
  Libra: "Balance in relationships. Fair decisions in partnerships bring long-term gain.",
  Scorpio: "Focus and intensity help deep work. Avoid overthinking late-night plans.",
  Sagittarius: "Learning and travel themes. Say yes to growth; watch overspending.",
  Capricorn: "Discipline builds results. Career steps feel slower but solid — stay consistent.",
  Aquarius: "Fresh ideas flow. Network wisely; a friend brings useful information.",
  Pisces: "Intuition is strong. Creative or spiritual time restores energy; rest matters.",
};

export default function HoroscopePage() {
  const [selected, setSelected] = useState<string | null>(null);

  const msg = encodeURIComponent(
    selected
      ? `Hi, I checked ${selected} daily horoscope on your site. Please send detailed monthly / yearly horoscope + payment QR.`
      : `Hi, I want a detailed personal horoscope. Please share options and payment QR.`
  );
  const waUrl = `https://wa.me/${WA}?text=${msg}`;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Daily guidance</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-gray-900">Horoscope</h1>
          <p className="mt-2 text-sm text-gray-600">Pick your sun sign for today&apos;s note. Full report on WhatsApp.</p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {SIGNS.map((s) => (
            <button
              key={s.name}
              onClick={() => setSelected(s.name)}
              className={`rounded-2xl border p-3 text-center transition ${
                selected === s.name ? "border-brand-500 bg-brand-50 shadow" : "border-gray-100 bg-white hover:border-brand-200"
              }`}
            >
              <span className="text-2xl">{s.emoji}</span>
              <p className="mt-1 text-xs font-semibold text-gray-900">{s.name}</p>
              <p className="text-[10px] text-gray-400">{s.dates}</p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="mt-8 rounded-2xl border border-brand-100 bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-brand-600">Today · {selected}</p>
            <p className="mt-3 font-serif text-lg leading-relaxed text-gray-800">{SNIPPETS[selected]}</p>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex rounded-xl bg-green-600 px-6 py-3 text-sm font-semibold text-white shadow">
              Get full {selected} report on WhatsApp →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
