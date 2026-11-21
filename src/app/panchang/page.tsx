"use client";

import { useMemo, useState } from "react";
import { panchangForDate } from "@/lib/panchang";
import { LANG_OPTIONS, type Lang, langLabel } from "@/lib/i18n";

const WA = "919008831075";

type Tab = "panchang" | "muhurta" | "choghadiya" | "hora" | "lagna" | "sunrise";

const TABS: { id: Tab; label: string }[] = [
  { id: "panchang", label: "Panchang" },
  { id: "muhurta", label: "Muhurta" },
  { id: "choghadiya", label: "Choghadiya" },
  { id: "hora", label: "Hora" },
  { id: "lagna", label: "Lagna" },
  { id: "sunrise", label: "Sunrise" },
];

export default function PanchangPage() {
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [tab, setTab] = useState<Tab>("panchang");
  const [lang, setLang] = useState<Lang>("en");
  const [city, setCity] = useState("Bengaluru");

  const snap = useMemo(() => {
    const d = new Date(dateStr + "T12:00:00");
    if (Number.isNaN(d.getTime())) return panchangForDate(new Date());
    return panchangForDate(d);
  }, [dateStr]);

  function shiftDay(delta: number) {
    const d = new Date(dateStr + "T12:00:00");
    d.setDate(d.getDate() + delta);
    setDateStr(d.toISOString().slice(0, 10));
  }

  const msg = encodeURIComponent(
    `Hi, I need full Hindu Panchang like hinducalendar.app.\nDate: ${snap.date}\nCity: ${city}\nSection: ${tab}\nLanguage: ${langLabel(lang)}\nPlease send accurate city panchang + payment QR.`
  );
  const waUrl = `https://wa.me/${WA}?text=${msg}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 to-white">
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Hindu Calendar · Panchang</p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-gray-900 sm:text-3xl">Aaj Ka Panchang</h1>
          <p className="mt-1 text-sm text-gray-600">Tithi · Nakshatra · Muhurta · Choghadiya</p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {LANG_OPTIONS.map((l) => (
            <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`rounded-full px-3 py-1 text-xs font-medium ${lang === l.code ? "bg-amber-700 text-white" : "border border-amber-200 bg-white text-amber-900"}`}>{l.native}</button>
          ))}
          <select value={city} onChange={(e) => setCity(e.target.value)} className="ml-auto rounded-full border border-amber-200 bg-white px-3 py-1 text-xs text-gray-700">
            {["Bengaluru", "Ujjain", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Mysuru"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="mb-4 flex items-center justify-between rounded-2xl bg-gray-900 px-3 py-3 text-white">
          <button type="button" onClick={() => shiftDay(-1)} className="rounded-full px-3 py-1 text-lg hover:bg-white/10">‹</button>
          <div className="text-center">
            <input type="date" value={dateStr} onChange={(e) => setDateStr(e.target.value)} className="rounded bg-transparent text-center text-sm font-semibold text-amber-300 outline-none" />
            <p className="text-xs text-gray-400">{snap.weekday} · {city}</p>
          </div>
          <button type="button" onClick={() => shiftDay(1)} className="rounded-full px-3 py-1 text-lg hover:bg-white/10">›</button>
        </div>

        <div className="mb-5 flex flex-wrap gap-1.5">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${tab === t.id ? "bg-amber-600 text-white shadow" : "border border-amber-100 bg-white text-amber-900 hover:bg-amber-50"}`}>{t.label}</button>
          ))}
        </div>

        <div className="mb-5 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-900 to-stone-900 p-5 text-amber-50 shadow-lg">
          <p className="text-xs uppercase tracking-wide text-amber-200/80">{snap.paksha} · {snap.maas}</p>
          <h2 className="mt-1 font-serif text-3xl font-bold text-amber-100">{snap.tithi}</h2>
          <p className="mt-2 text-sm text-amber-100/90">Nakshatra <strong>{snap.nakshatra}</strong> · Yoga <strong>{snap.yoga}</strong> · Karana <strong>{snap.karana}</strong></p>
          <p className="mt-3 text-xs text-amber-200/70">Vikram {snap.vikramSamvat} · Shaka {snap.shakaSamvat} · {snap.weekdayHi}</p>
        </div>

        {tab === "panchang" && (
          <section className="space-y-2 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-bold text-gray-900">Five limbs of the day</h3>
            <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Tithi</span><span className="font-semibold">{snap.tithi} ({snap.paksha})</span></div>
            <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Nakshatra</span><span className="font-semibold">{snap.nakshatra}</span></div>
            <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Yoga</span><span className="font-semibold">{snap.yoga}</span></div>
            <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Karana</span><span className="font-semibold">{snap.karana}</span></div>
            <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Vaar</span><span className="font-semibold">{snap.weekday} / {snap.weekdayHi}</span></div>
            <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Maah</span><span className="font-semibold">{snap.maas}</span></div>
          </section>
        )}

        {tab === "muhurta" && (
          <section className="space-y-3 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900">Muhurta windows (approx)</h3>
            <div className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-900"><span className="font-semibold">{snap.rahu.label}</span><span className="font-mono text-xs">{snap.rahu.start} – {snap.rahu.end}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-900"><span className="font-semibold">{snap.yama.label}</span><span className="font-mono text-xs">{snap.yama.start} – {snap.yama.end}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-900"><span className="font-semibold">{snap.gulika.label}</span><span className="font-mono text-xs">{snap.gulika.start} – {snap.gulika.end}</span></div>
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900"><span className="font-semibold">{snap.abhijit.label}</span><span className="font-mono text-xs">{snap.abhijit.start} – {snap.abhijit.end}</span></div>
          </section>
        )}

        {tab === "choghadiya" && (
          <section className="space-y-4 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <div>
              <h3 className="mb-2 text-sm font-bold text-gray-900">Day Choghadiya</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {snap.choghDay.map((c) => (
                  <div key={c.start + c.name} className={`rounded-xl px-2 py-2 text-center text-xs ${c.good ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}>
                    <p className="font-bold">{c.name}</p>
                    <p className="opacity-80">{c.start}–{c.end}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-bold text-gray-900">Night Choghadiya</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {snap.choghNight.map((c) => (
                  <div key={"n" + c.start + c.name} className={`rounded-xl px-2 py-2 text-center text-xs ${c.good ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}>
                    <p className="font-bold">{c.name}</p>
                    <p className="opacity-80">{c.start}–{c.end}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {tab === "hora" && (
          <section className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-gray-900">Day Hora (planetary hours)</h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {snap.horas.map((h) => (
                <div key={h.start} className="rounded-xl border border-gray-100 bg-amber-50/50 px-3 py-2 text-xs">
                  <p className="font-bold text-gray-900">{h.lord}</p>
                  <p className="text-gray-600">{h.start} – {h.end}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {tab === "lagna" && (
          <section className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-bold text-gray-900">Lagna / rising sign</h3>
            <p className="text-sm text-gray-700">Exact Lagna needs precise sunrise + longitude for {city}.</p>
            <p className="mt-2 text-sm text-gray-600">For Janma Kundli with Lagna and dashas, send DOB, TOB and place on WhatsApp — report in {langLabel(lang)}.</p>
            <a href={waUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white">Request Kundli / Lagna →</a>
          </section>
        )}

        {tab === "sunrise" && (
          <section className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-bold text-gray-900">Sun · Moon</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-amber-50 px-3 py-3 text-center"><p className="text-[10px] font-semibold uppercase text-amber-700">Sunrise</p><p className="mt-1 text-lg font-bold">{snap.sunrise}</p></div>
              <div className="rounded-xl bg-amber-50 px-3 py-3 text-center"><p className="text-[10px] font-semibold uppercase text-amber-700">Sunset</p><p className="mt-1 text-lg font-bold">{snap.sunset}</p></div>
              <div className="rounded-xl bg-amber-50 px-3 py-3 text-center"><p className="text-[10px] font-semibold uppercase text-amber-700">Moonrise</p><p className="mt-1 text-lg font-bold">{snap.moonrise}</p></div>
              <div className="rounded-xl bg-amber-50 px-3 py-3 text-center"><p className="text-[10px] font-semibold uppercase text-amber-700">Moonset</p><p className="mt-1 text-lg font-bold">{snap.moonset}</p></div>
            </div>
            <p className="mt-3 text-xs text-gray-500">Exact {city} times in full WhatsApp panchang.</p>
          </section>
        )}

        <p className="mt-4 text-center text-[11px] text-gray-400">{snap.note}</p>

        <a href={waUrl} target="_blank" rel="noopener noreferrer" className="mt-5 flex w-full items-center justify-center rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white shadow">
          Full city Panchang in {langLabel(lang)} on WhatsApp →
        </a>
      </main>
    </div>
  );
}
