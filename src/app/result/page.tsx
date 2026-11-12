"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { analyzeName, type FullAnalysis } from "@/lib/chaldean";
import Link from "next/link";

function ResultContent() {
  const searchParams = useSearchParams();

  const analysis: FullAnalysis | null = useMemo(() => {
    const name = searchParams.get("name");
    const day = Number(searchParams.get("day"));
    const month = Number(searchParams.get("month"));
    const year = Number(searchParams.get("year"));
    const gender = searchParams.get("gender") || "Other";

    if (!name || !day || !month || !year) return null;

    return analyzeName(name, day, month, year, gender);
  }, [searchParams]);

  if (!analysis) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">Missing details</h1>
        <p className="mb-6 text-gray-600">Please go back and fill the form completely.</p>
        <Link
          href="/"
          className="inline-flex rounded-xl bg-maroon-800 px-6 py-3 font-semibold text-white"
        >
          ← Back to Form
        </Link>
      </div>
    );
  }

  const { name, birth, psychic, compatibility, nameMeaning, birthMeaning, fullName, day, month, year } = analysis;

  const statusColors = {
    excellent: "bg-green-100 text-green-800 border-green-200",
    good: "bg-emerald-50 text-emerald-800 border-emerald-200",
    average: "bg-amber-50 text-amber-800 border-amber-200",
    needs_attention: "bg-red-50 text-red-800 border-red-200",
  };

  const statusLabels = {
    excellent: "Excellent Alignment",
    good: "Good Compatibility",
    average: "Average Alignment",
    needs_attention: "Needs Attention",
  };

  // Temp testing number — change later
  const whatsappNumber = "919008831075";
  const whatsappMessage = encodeURIComponent(
    `Hi, I just checked my name on your tool.\n\nName: ${fullName}\nDOB: ${day}/${month}/${year}\nName Number: ${name.nameNumber}\nBirth Number: ${birth.birthNumber}\nCompatibility: ${statusLabels[compatibility.status]}\n\nI would like the detailed Name Correction Report.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen pb-20">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-maroon-800">
            ← Check another name
          </Link>
          <span className="text-xs font-medium text-maroon-700">Your Free Analysis</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <p className="mb-1 text-sm font-medium text-maroon-600">Analysis for</p>
          <h1 className="font-serif text-3xl font-bold text-gray-900 sm:text-4xl">{fullName}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Born {day}/{month}/{year} · {analysis.gender}
          </p>
        </div>

        <div className={`mb-8 rounded-2xl border p-5 text-center ${statusColors[compatibility.status]}`}>
          <p className="text-sm font-medium opacity-80">Overall Compatibility</p>
          <p className="mt-1 text-2xl font-bold">{statusLabels[compatibility.status]}</p>
          <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-current transition-all"
              style={{ width: `${compatibility.score}%` }}
            />
          </div>
          <p className="mt-3 text-sm opacity-90">{compatibility.message}</p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Name Number</p>
            <p className="mt-2 text-4xl font-bold text-maroon-800">{name.nameNumber}</p>
            <p className="mt-1 text-xs text-gray-500">Compound: {name.compound}</p>
            <p className="mt-2 text-sm font-medium text-gray-700">{nameMeaning.planet}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Birth Number</p>
            <p className="mt-2 text-4xl font-bold text-maroon-800">{birth.birthNumber}</p>
            <p className="mt-1 text-xs text-gray-500">From full DOB</p>
            <p className="mt-2 text-sm font-medium text-gray-700">{birthMeaning.planet}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Psychic Number</p>
            <p className="mt-2 text-4xl font-bold text-maroon-800">{psychic}</p>
            <p className="mt-1 text-xs text-gray-500">Birth Day energy</p>
            <p className="mt-2 text-sm font-medium text-gray-700">Core personality</p>
          </div>
        </div>

        <div className="mb-8 space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-900">
              Your Name Number {name.nameNumber} — {nameMeaning.planet}
            </h3>
            <p className="text-sm text-gray-600">{nameMeaning.short}</p>
            <p className="mt-2 text-xs text-gray-500">Keywords: {nameMeaning.keywords}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-900">
              Your Birth Number {birth.birthNumber} — {birthMeaning.planet}
            </h3>
            <p className="text-sm text-gray-600">{birthMeaning.short}</p>
            <p className="mt-2 text-xs text-gray-500">Keywords: {birthMeaning.keywords}</p>
          </div>
        </div>

        <details className="mb-8 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <summary className="cursor-pointer font-semibold text-gray-900">
            Letter-by-letter breakdown
          </summary>
          <div className="mt-4 flex flex-wrap gap-2">
            {name.letterBreakdown.map((item, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-lg bg-maroon-50 px-2.5 py-1 text-sm"
              >
                <span className="font-semibold text-maroon-900">{item.letter}</span>
                <span className="text-maroon-600">= {item.value}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Total compound = <strong>{name.compound}</strong> → reduced to{" "}
            <strong>{name.nameNumber}</strong>
          </p>
        </details>

        <div className="rounded-3xl border-2 border-maroon-200 bg-gradient-to-br from-maroon-50 to-white p-6 text-center shadow-lg sm:p-8">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-maroon-600">
            Want deeper clarity?
          </p>
          <h2 className="mb-3 font-serif text-2xl font-bold text-gray-900">
            Get Your Personalised Name Correction Report
          </h2>
          <p className="mx-auto mb-6 max-w-md text-sm text-gray-600">
            Detailed analysis of spelling options, lucky numbers & colours, remedies, and
            recommended name adjustments tailored to your birth chart energy.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:bg-green-700 sm:w-auto"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Get Report on WhatsApp
            </a>
            <button
              onClick={() => window.print()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-maroon-300 bg-white px-6 py-3.5 font-semibold text-maroon-800 transition hover:bg-maroon-50 sm:w-auto"
            >
              Print / Save this page
            </button>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Your free analysis is already complete above. The detailed report is optional.
          </p>
        </div>

        <p className="mt-10 text-center text-xs text-gray-400">
          This free analysis uses traditional Chaldean numerology principles for educational
          guidance only. It is not a substitute for professional advice.
        </p>
      </main>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">Loading your analysis...</p>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
