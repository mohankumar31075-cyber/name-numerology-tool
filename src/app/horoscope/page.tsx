"use client";

import { useState } from "react";
import { LANG_OPTIONS, type Lang, langLabel } from "@/lib/i18n";

const CITIES = ["Bengaluru", "Mysuru", "Mumbai", "Delhi", "Chennai", "Hyderabad", "Kolkata", "Pune", "Ujjain"];

export default function HoroscopePage() {
  const [fullName, setFullName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("0");
  const [city, setCity] = useState("Bengaluru");
  const [gender, setGender] = useState("Male");
  const [lang, setLang] = useState<Lang>("en");
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    price: number;
    isFree: boolean;
    preview: Record<string, unknown>;
    customerWaUrl: string;
    whatsappText: string | null;
    deliverFull: boolean;
  } | null>(null);
  const [error, setError] = useState("");

  async function generate(unlock = false) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/horoscope-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          day: Number(day),
          month: Number(month),
          year: Number(year),
          hour: Number(hour),
          minute: Number(minute),
          city,
          gender,
          lang,
          coupon,
          unlock,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Failed");
        setResult(null);
        return;
      }
      setResult(data);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  function sendToWhatsApp() {
    if (!result) return;
    if (result.whatsappText) {
      window.open(
        `https://wa.me/919008831075?text=${encodeURIComponent(result.whatsappText)}`,
        "_blank"
      );
    } else {
      window.open(result.customerWaUrl, "_blank");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50/50 to-white">
      <main className="mx-auto max-w-lg px-4 py-8 sm:px-6">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Full detailed report</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-gray-900">Horoscope</h1>
          <p className="mt-2 text-sm text-gray-600">
            Name + DOB + birth time + place → numerology &amp; Vedic outline → WhatsApp
          </p>
        </div>

        <div className="mb-4">
          <p className="mb-1.5 text-xs font-semibold text-gray-500">Report language</p>
          <div className="flex flex-wrap gap-2">
            {LANG_OPTIONS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLang(l.code)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  lang === l.code ? "bg-indigo-600 text-white" : "border border-indigo-100 bg-white text-indigo-900"
                }`}
              >
                {l.native}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
          <label className="block">
            <span className="text-xs font-semibold text-gray-500">Full Name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
            />
          </label>

          <div>
            <span className="text-xs font-semibold text-gray-500">Date of Birth</span>
            <div className="mt-1 grid grid-cols-3 gap-2">
              <input type="number" placeholder="Day" min={1} max={31} value={day} onChange={(e) => setDay(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
              <input type="number" placeholder="Month" min={1} max={12} value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
              <input type="number" placeholder="Year" min={1900} max={2026} value={year} onChange={(e) => setYear(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-gray-500">Time of Birth</span>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <input type="number" placeholder="Hour 0-23" min={0} max={23} value={hour} onChange={(e) => setHour(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
              <input type="number" placeholder="Min 0-59" min={0} max={59} value={minute} onChange={(e) => setMinute(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-gray-500">Birth Place</span>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm">
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <div>
            <span className="text-xs font-semibold text-gray-500">Gender</span>
            <div className="mt-1 flex gap-2">
              {["Male", "Female", "Other"].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 rounded-xl py-2 text-xs font-semibold ${
                    gender === g ? "bg-indigo-600 text-white" : "border border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-gray-500">Coupon (optional)</span>
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="FREE100 / OFF30"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm uppercase"
            />
          </label>

          <button
            type="button"
            disabled={loading || !fullName || !day || !month || !year}
            onClick={() => generate(false)}
            className="w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow disabled:opacity-50"
          >
            {loading ? "Generating…" : "Generate full report"}
          </button>
        </div>

        {error && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}

        {result && (
          <div className="mt-6 space-y-3 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-indigo-600">Preview</p>
            <p className="text-sm text-gray-800">
              <strong>{String(result.preview.fullName)}</strong>
              <br />
              Name Number {String(result.preview.nameNumber)} · Life Path {String(result.preview.lifePath)}
              <br />
              City: {String(result.preview.city)} · Lang: {langLabel(lang)}
            </p>
            <p className="text-lg font-bold text-gray-900">
              {result.isFree ? "₹0 (FREE)" : `₹${result.price}`}
            </p>

            {result.deliverFull ? (
              <p className="text-xs text-emerald-700">Full report unlocked — ready to send on WhatsApp</p>
            ) : (
              <p className="text-xs text-amber-700">
                Payment required. After payment screenshot, deliver manually or unlock with FREE coupon.
              </p>
            )}

            <button
              type="button"
              onClick={sendToWhatsApp}
              className="flex w-full items-center justify-center rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white"
            >
              {result.deliverFull ? "Send full report on WhatsApp →" : "Send order + payment request on WhatsApp →"}
            </button>

            {result.deliverFull && result.whatsappText && (
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer font-semibold text-gray-700">Preview report text</summary>
                <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-gray-50 p-2">
                  {result.whatsappText}
                </pre>
              </details>
            )}
          </div>
        )}

        <p className="mt-6 text-center text-[11px] text-gray-400">
          Coupons: FREE100, NAMEFREE, OFF10, OFF20, OFF30 · Max price ₹299
        </p>
      </main>
    </div>
  );
}
