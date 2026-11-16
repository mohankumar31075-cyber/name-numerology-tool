"use client";

import { useMemo, useState } from "react";
import { panchangSnapshot } from "@/lib/horoscope";
import { LANG_OPTIONS, type Lang, langLabel } from "@/lib/i18n";

const WA = "919008831075";

export default function PanchangPage() {
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [lang, setLang] = useState<Lang>("en");

  const snap = useMemo(() => {
    const d = new Date(dateStr + "T12:00:00");
    if (Number.isNaN(d.getTime())) return panchangSnapshot(new Date());
    return panchangSnapshot(d);
  }, [dateStr]);

  const msg = encodeURIComponent(
    `Hi, I need Hindu Panchang / Muhurat guidance.\nDate: ${snap.date}\nReport language: ${langLabel(lang)}\nPlease send detailed city Panchang + payment QR.`
  );
  const waUrl = `https://wa.me/${WA}?text=${msg}`;

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <div className="mb-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Hindu Calendar</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-gray-900">Panchang</h1>
          <p className="mt-2 text-sm text-gray-600">Tithi, Nakshatra, Paksha & Rahu Kalam preview. Full report on WhatsApp.</p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {LANG_OPTIONS.map((l) => (
            <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${lang === l.code ? "bg-brand-700 text-white" : "border border-gray-200 bg-white text-gray-700"}`}>
              {l.native}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Select date</label>
          <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-400" />
        </div>

        <div className="space-y-3 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
          <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Weekday</span><span className="font-semibold">{snap.weekday}</span></div>
          <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Tithi</span><span className="font-semibold">{snap.tithi}</span></div>
          <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Paksha</span><span className="font-semibold">{snap.paksha}</span></div>
          <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Nakshatra</span><span className="font-semibold">{snap.nakshatra}</span></div>
          <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Rahu Kalam (approx)</span><span className="font-semibold">{snap.rahuKalam}</span></div>
          <p className="pt-2 text-xs text-gray-500">{snap.note}</p>
        </div>

        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="mt-6 flex w-full items-center justify-center rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white shadow">
          Full Panchang in {langLabel(lang)} on WhatsApp →
        </a>
      </main>
    </div>
  );
}
