"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LANG_OPTIONS, type Lang, UI } from "@/lib/i18n";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

export default function NameForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [lang, setLang] = useState<Lang>("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const t = UI[lang];

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || name.trim().length < 2) { setError("Please enter your full name."); return; }
    if (!day || !month || !year) { setError("Please select complete date of birth."); return; }
    setLoading(true);
    const tob = hour !== "" && minute !== "" ? `${hour}:${minute}` : "";
    const params = new URLSearchParams({ name: name.trim(), day, month, year, gender, lang, ...(tob ? { tob } : {}) });
    router.push(`/result?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-brand-200/60 bg-white p-6 shadow-xl sm:p-8">
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">{t.selectLang}</label>
        <div className="flex flex-wrap gap-2">
          {LANG_OPTIONS.map((l) => (
            <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${lang === l.code ? "bg-brand-700 text-white shadow" : "border border-gray-200 bg-gray-50 text-gray-700"}`}>{l.native}</button>
          ))}
        </div>
      </div>
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">{t.fullName}</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your Name" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-brand-400" />
      </div>
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">{t.dob}</label>
        <div className="grid grid-cols-3 gap-2">
          <select value={day} onChange={(e) => setDay(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm"><option value="">Day</option>{DAYS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm"><option value="">Month</option>{MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}</select>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm"><option value="">Year</option>{YEARS.map((y) => <option key={y} value={y}>{y}</option>)}</select>
        </div>
      </div>
      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">{t.tob} <span className="text-gray-400">(optional)</span></label>
        <div className="grid grid-cols-2 gap-2">
          <select value={hour} onChange={(e) => setHour(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm"><option value="">Hour</option>{HOURS.map((h) => <option key={h} value={h}>{h}</option>)}</select>
          <select value={minute} onChange={(e) => setMinute(e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm"><option value="">Min</option>{MINS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
        </div>
      </div>
      <div className="mb-6">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">{t.gender}</label>
        <div className="flex gap-2">
          {(["Male", "Female", "Other"] as const).map((g) => (
            <button key={g} type="button" onClick={() => setGender(g)} className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium ${gender === g ? "bg-brand-800 text-white" : "border border-gray-200 bg-gray-50"}`}>{g}</button>
          ))}
        </div>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand-800 py-3.5 font-semibold text-white shadow-lg disabled:opacity-70">{loading ? "Analysing..." : t.checkName + " →"}</button>
      <p className="mt-3 text-center text-xs text-gray-500">Report: {LANG_OPTIONS.find((l) => l.code === lang)?.native}</p>
    </form>
  );
}
