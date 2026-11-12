"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - i);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function NameForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || name.trim().length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    if (!day || !month || !year) {
      setError("Please select your complete date of birth.");
      return;
    }

    setLoading(true);

    const params = new URLSearchParams({
      name: name.trim(),
      day,
      month,
      year,
      gender,
    });

    router.push(`/result?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-3xl border border-maroon-200/60 bg-white p-6 shadow-xl shadow-maroon-900/5 sm:p-8"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Fill Details to Check Name</h2>
          <p className="text-sm text-gray-500">Takes less than 30 seconds</p>
        </div>
      </div>

      <div className="mb-5">
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
          Full Name <span className="text-gray-400">(as used commonly)</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your Name"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 outline-none transition focus:border-maroon-400 focus:bg-white focus:ring-2 focus:ring-maroon-100"
          autoComplete="name"
        />
      </div>

      <div className="mb-5">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Date of Birth</label>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none focus:border-maroon-400 focus:bg-white focus:ring-2 focus:ring-maroon-100"
          >
            <option value="">Day</option>
            {DAYS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none focus:border-maroon-400 focus:bg-white focus:ring-2 focus:ring-maroon-100"
          >
            <option value="">Month</option>
            {MONTHS.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm text-gray-900 outline-none focus:border-maroon-400 focus:bg-white focus:ring-2 focus:ring-maroon-100"
          >
            <option value="">Year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Gender</label>
        <div className="flex gap-2">
          {(["Male", "Female", "Other"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                gender === g
                  ? "bg-maroon-800 text-white shadow-md"
                  : "border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-maroon-800 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-maroon-900/20 transition hover:bg-maroon-900 disabled:opacity-70"
      >
        {loading ? (
          <>
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analysing...
          </>
        ) : (
          <>
            Check My Name Free
            <span aria-hidden>→</span>
          </>
        )}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-green-500">
          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
        </svg>
        100% private · No spam · Instant result
      </p>
    </form>
  );
}
