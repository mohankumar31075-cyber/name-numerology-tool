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
        <Link href="/" className="inline-flex rounded-xl bg-maroon-800 px-6 py-3 font-semibold text-white">
          ← Back to Form
        </Link>
      </div>
    );
  }

  const {
    name,
    lifePath,
    psychic,
    soulUrge,
    personality,
    subconscious,
    compatibility,
    nameMeaning,
    lifePathMeaning,
    fullName,
    day,
    month,
    year,
  } = analysis;

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

  const whatsappNumber = "919008831075";
  const whatsappMessage = encodeURIComponent(
    `Hi, I just checked my name on your tool.\n\nName: ${fullName}\nDOB: ${day}/${month}/${year}\nName Number: ${name.nameNumber}\nLife Path: ${lifePath.lifePath}\nCompatibility: ${statusLabels[compatibility.status]}\n\nI would like the detailed Name Correction Report.`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const coreNumbers = [
    {
      label: "Life Path Number",
      value: lifePath.lifePath,
      desc: lifePathMeaning.short,
      color: "from-amber-400 to-orange-500",
    },
    {
      label: "Name Destiny Number",
      value: name.nameNumber,
      desc: nameMeaning.short,
      color: "from-blue-400 to-indigo-500",
    },
    {
      label: "Personality Number",
      value: personality.personality,
      desc: "How others perceive you.",
      color: "from-emerald-400 to-teal-500",
    },
    {
      label: "Soul Urge Number",
      value: soulUrge.soulUrge,
      desc: "Your inner desires and motivations.",
      color: "from-pink-400 to-rose-500",
    },
    {
      label: "Subconscious Self",
      value: subconscious,
      desc: "Instinctive response under pressure.",
      color: "from-violet-400 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-maroon-50/20 pb-24">
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-maroon-800">
            ← Check another name
          </Link>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
            Analysis Complete
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-maroon-600">
            Free Preview For
          </p>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-gray-900 sm:text-4xl">
            {fullName.toUpperCase()}
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Born {day}/{month}/{year} · {analysis.gender}
          </p>
        </div>

        <div className={`mb-8 rounded-2xl border p-5 text-center ${statusColors[compatibility.status]}`}>
          <p className="text-sm font-medium opacity-80">Name ↔ Life Path Compatibility</p>
          <p className="mt-1 text-2xl font-bold">{statusLabels[compatibility.status]}</p>
          <div className="mx-auto mt-3 h-2 max-w-xs overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-current transition-all"
              style={{ width: `${compatibility.score}%` }}
            />
          </div>
          <p className="mt-3 text-sm opacity-90">{compatibility.message}</p>
        </div>

        <section className="mb-10">
          <h2 className="mb-1 font-serif text-2xl font-bold text-gray-900">Your Core Numbers</h2>
          <p className="mb-5 text-sm text-gray-500">
            Five key numbers derived from your name and birth date.
          </p>
          <div className="space-y-3">
            {coreNumbers.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-xl font-bold text-white shadow`}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-1 font-serif text-2xl font-bold text-gray-900">Your Name Number</h2>
          <p className="mb-5 text-sm text-gray-500">
            Every letter has a Chaldean value. Here&apos;s how yours adds up.
          </p>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <p className="mb-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
              Full Name
            </p>
            <p className="mb-6 text-center font-serif text-xl font-bold tracking-widest text-gray-900">
              {fullName.toUpperCase()}
            </p>

            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {name.letterBreakdown.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-maroon-800 text-lg font-bold text-white shadow">
                    {item.letter}
                  </div>
                  <span className="mt-1 text-xs font-medium text-maroon-700">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-amber-50 px-4 py-4 text-center">
              <p className="text-sm text-gray-700">
                {name.letterBreakdown.map((i) => i.value).join(" + ")} ={" "}
                <strong>{name.compound}</strong>
              </p>
              <p className="mt-2 text-sm text-gray-500">↓ Reduced to single digit</p>
              <div className="mx-auto mt-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gold-500 text-2xl font-bold text-white shadow-lg">
                {name.nameNumber}
              </div>
              <p className="mt-3 text-sm text-gray-600">
                This is your <strong>Name Number</strong> — the vibration your full name emits.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="mb-1 font-serif text-2xl font-bold text-gray-900">
            Your Name Number Analysis
          </h2>
          <p className="mb-5 text-sm text-gray-500">
            What number {name.nameNumber} means for you.
          </p>

          <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-maroon-800 to-maroon-950 p-5 text-white shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-white/30 bg-white/10 text-3xl font-bold">
                {name.nameNumber}
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-maroon-200">
                  Name Number
                </p>
                <p className="text-xl font-bold">{nameMeaning.title}</p>
                <p className="text-sm text-maroon-100">{nameMeaning.short}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-semibold text-emerald-800">Your Strengths</h3>
              <ul className="space-y-2">
                {nameMeaning.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 text-emerald-500">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-semibold text-rose-800">Common Challenges</h3>
              <ul className="space-y-2">
                {nameMeaning.challenges.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 text-rose-500">✗</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <div className="rounded-3xl border-2 border-maroon-200 bg-gradient-to-br from-maroon-50 to-white p-6 text-center shadow-lg sm:p-8">
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-maroon-600">
            This is only the surface
          </p>
          <h2 className="mb-3 font-serif text-2xl font-bold text-gray-900">
            Get Your Full Name Correction Report
          </h2>
          <p className="mx-auto mb-6 max-w-md text-sm text-gray-600">
            Your full report reveals corrected name spellings, Lo Shu grid, lucky numbers & colours,
            and personalised remedies.
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
              Get Full Report on WhatsApp
            </a>
            <button
              onClick={() => window.print()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-maroon-300 bg-white px-6 py-3.5 font-semibold text-maroon-800 transition hover:bg-maroon-50 sm:w-auto"
            >
              Print / Save this page
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-gray-400">
          Free analysis uses traditional Chaldean numerology for educational guidance only.
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
