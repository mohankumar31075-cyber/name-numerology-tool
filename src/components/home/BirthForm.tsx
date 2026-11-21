"use client";

import { useState, type FormEvent } from "react";
import { REPORT_LANGUAGES, type BirthDetailsInput, type ReportType } from "@/lib/report";

const PLACE_SUGGESTIONS = [
  "Bengaluru, India",
  "Mysuru, India",
  "Mumbai, India",
  "Delhi, India",
  "Chennai, India",
  "Hyderabad, India",
  "Kolkata, India",
  "Pune, India",
  "Ujjain, India",
];

const TITLES: Record<ReportType, string> = {
  horoscope: "Your birth details",
  numerology: "Your name details",
  panchang: "Your day details",
};

const fieldBase =
  "w-full rounded-[10px] border border-ink-500/80 bg-[#10121f] px-3.5 py-3 text-sm text-ink-50 outline-none transition placeholder:text-ink-300/70 focus:border-gold-300 focus:ring-1 focus:ring-gold-300/30";

const labelBase = "mb-1.5 block text-[12px] text-ink-100";

function validate(details: BirthDetailsInput): string | null {
  const isPanchang = details.reportType === "panchang";
  if (!isPanchang && details.fullName.trim().length < 2) {
    return "Please enter the full name you use.";
  }
  if (!isPanchang && !details.birthDate) {
    return "Please choose your date of birth.";
  }
  if (!details.birthPlace.trim()) {
    return "Please add your birth place.";
  }
  if (details.birthDate) {
    const chosen = new Date(`${details.birthDate}T12:00:00`);
    if (Number.isNaN(chosen.getTime()) || chosen.getTime() > Date.now()) {
      return "Date of birth must be a real, past date.";
    }
  }
  return null;
}

export default function BirthForm({
  reportType,
  onReportTypeChange,
  initial,
  submitting,
  onSubmit,
}: {
  reportType: ReportType;
  onReportTypeChange: (next: ReportType) => void;
  initial: BirthDetailsInput;
  submitting: boolean;
  onSubmit: (details: BirthDetailsInput) => void;
}) {
  const [details, setDetails] = useState<BirthDetailsInput>({
    ...initial,
    reportType,
  });
  const [error, setError] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Keep the local copy in sync when the card above changes the report type.
  const effectiveType = reportType;
  if (details.reportType !== effectiveType) {
    setDetails((d) => ({ ...d, reportType: effectiveType }));
  }

  const isPanchang = effectiveType === "panchang";
  const isNumerology = effectiveType === "numerology";

  function update<K extends keyof BirthDetailsInput>(key: K, value: BirthDetailsInput[K]) {
    setDetails((d) => ({ ...d, [key]: value }));
    if (error) setError("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const problem = validate({ ...details, reportType: effectiveType });
    if (problem) {
      setError(problem);
      return;
    }
    setError("");
    onSubmit({ ...details, reportType: effectiveType });
  }

  return (
    <section
      id="form"
      className="mx-auto mb-16 mt-7 max-w-[800px] scroll-mt-24 px-5 sm:px-0"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-[20px] border border-ink-500/70 bg-panel-sheen p-5 shadow-panel sm:p-7"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-serif text-[22px] text-ink-50 sm:text-2xl">
            {TITLES[effectiveType]}
          </h2>
          <div className="flex items-center gap-1.5 text-[11px] text-mint-400 sm:text-xs">
            <span aria-hidden="true">▣</span>
            Your details stay private
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="fullname" className={labelBase}>
              {isNumerology ? "Full name (as you write it)" : "Full name"}
              {isPanchang && <span className="text-ink-300"> (optional)</span>}
            </label>
            <input
              id="fullname"
              value={details.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder="Name you use every day"
              maxLength={100}
              autoComplete="name"
              className={fieldBase}
            />
          </div>

          <div>
            <label htmlFor="dob" className={labelBase}>
              {isPanchang ? "Date to read" : "Date of birth"}
              {isPanchang && <span className="text-ink-300"> (defaults to today)</span>}
            </label>
            <input
              id="dob"
              type="date"
              value={details.birthDate}
              onChange={(e) => update("birthDate", e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              min="1900-01-01"
              className={fieldBase}
            />
          </div>

          <div>
            <label htmlFor="tob" className={labelBase}>
              Time of birth <span className="text-ink-300">(optional)</span>
            </label>
            <input
              id="tob"
              type="time"
              value={details.birthTime}
              onChange={(e) => update("birthTime", e.target.value)}
              className={fieldBase}
            />
            <p className="mt-1 text-[11px] text-ink-300">
              If unknown, leave blank for a general reading.
            </p>
          </div>

          <div className="relative sm:col-span-2">
            <label htmlFor="place" className={labelBase}>
              {isPanchang ? "Place" : "Birth place"}
            </label>
            <input
              id="place"
              value={details.birthPlace}
              onChange={(e) => update("birthPlace", e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowSuggestions(false), 120)}
              placeholder="City, country (e.g. Bengaluru, India)"
              maxLength={120}
              autoComplete="off"
              className={fieldBase}
            />
            {showSuggestions && (
              <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-[10px] border border-ink-500 bg-ink-850 shadow-panel">
                {PLACE_SUGGESTIONS.map((place) => (
                  <li key={place}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        update("birthPlace", place);
                        setShowSuggestions(false);
                      }}
                      className="block w-full px-3.5 py-2 text-left text-sm text-ink-100 transition hover:bg-white/[0.06] hover:text-ink-50"
                    >
                      {place}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="lang" className={labelBase}>
              Report language
            </label>
            <select
              id="lang"
              value={details.language}
              onChange={(e) =>
                update("language", e.target.value as BirthDetailsInput["language"])
              }
              className={fieldBase}
            >
              {REPORT_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="gender" className={labelBase}>
              Gender <span className="text-ink-300">(optional)</span>
            </label>
            <select
              id="gender"
              value={details.gender}
              onChange={(e) => update("gender", e.target.value)}
              className={fieldBase}
            >
              <option value="">Prefer not to say</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-[10px] border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-[11px] bg-gold-cta px-4 py-3.5 text-sm font-bold text-[#20180e] shadow-cta transition hover:brightness-105 active:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Reading your details…" : "Create my free preview  →"}
        </button>

        <p className="mt-3 text-center text-[11px] leading-relaxed text-ink-300">
          A short preview is free. Unlock the complete report as a downloadable
          PDF and receive a copy by WhatsApp or email.
        </p>
      </form>
    </section>
  );
}
