"use client";

import { useMemo, useState } from "react";
import { panchangForDate } from "@/lib/panchang";
import { LANG_OPTIONS, type Lang, langLabel } from "@/lib/i18n";

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
  const [loading, setLoading] = useState(false);

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

  async function sendAccurateWhatsApp() {
    setLoading(true);
    try {
      const res = await fetch("/api/panchang-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "panchang", date: dateStr, city, lang }),
      });
      const data = await res.json();
      if (!data.ok) {
        alert(data.error || "Could not fetch panchang");
        return;
      }
      window.open(`https://wa.me/919008831075?text=${encodeURIComponent(data.whatsappText)}`, "_blank");
    } catch {
      alert("Network error fetching accurate panchang");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 to-white">
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <div className="mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Hindu Calendar · Panchang</p>
          <h1 className="mt-1 font-serif text-2xl font-bold text-gray-900 sm:text-3xl">Aaj Ka Panchang</h1>
          <p className="mt-1 text-sm text-gray-600">Accurate engine: hinducalendar.app MCP</p>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {LANG_OPTIONS.map((l) => (
            <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`rounded-full px-3 py-1 text-xs font-medium ${lang === l.code ? "bg-amber-700 text-white" : "border border-amber-200 bg-white text-amber-900"}`}>{l.native}</button>
          ))}
          <select value={city} onChange={(e) => setCity(e.target.value)} className="ml-auto rounded-full border border-amber-200 bg-white px-3 py-1 text-xs text-gray-700">
            {["Bengaluru", "Ujjain", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Mysuru", "Kolkata", "Pune"].map((c) => (
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
          <p className="mt-2 text-sm text-amber-100/90">Preview · tap WhatsApp for city-accurate MCP data</p>
        </div>

        {tab === "panchang" && (
          <section className="space-y-2 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-bold text-gray-900">Five limbs (preview)</h3>
            <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Tithi</span><span className="font-semibold">{snap.tithi}</span></div>
            <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Nakshatra</span><span className="font-semibold">{snap.nakshatra}</span></div>
            <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Yoga</span><span className="font-semibold">{snap.yoga}</span></div>
            <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Karana</span><span className="font-semibold">{snap.karana}</span></div>
            <div className="flex justify-between border-b border-gray-50 py-2 text-sm"><span className="text-gray-500">Vaar</span><span className="font-semibold">{snap.weekday}</span></div>
          </section>
        )}

        {tab === "muhurta" && (
          <section className="space-y-3 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900">Muhurta (approx preview)</h3>
            <div className="flex justify-between rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-900"><span className="font-semibold">{snap.rahu.label}</span><span>{snap.rahu.start} – {snap.rahu.end}</span></div>
            <div className="flex justify-between rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-900"><span className="font-semibold">{snap.abhijit.label}</span><span>{snap.abhijit.start} – {snap.abhijit.end}</span></div>
            <p className="text-xs text-gray-500">For exact Rahu Kalam at {city}, use WhatsApp accurate report.</p>
          </section>
        )}

        {(tab === "choghadiya" || tab === "hora" || tab === "lagna" || tab === "sunrise") && (
          <section className="rounded-2xl border border-amber-100 bg-white p-4 text-sm text-gray-700 shadow-sm">
            <p>Full <strong>{tab}</strong> grid for {city} is included in the accurate WhatsApp report from the Hindu Calendar MCP engine.</p>
          </section>
        )}

        <button type="button" disabled={loading} onClick={sendAccurateWhatsApp} className="mt-5 flex w-full items-center justify-center rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white shadow disabled:opacity-60">
          {loading ? "Fetching accurate panchang…" : `Send accurate Panchang (${city}) on WhatsApp →`}
        </button>
        <p className="mt-2 text-center text-[11px] text-gray-400">Uses hinducalendar.app MCP · Language: {langLabel(lang)}</p>
      </main>
    </div>
  );
}
