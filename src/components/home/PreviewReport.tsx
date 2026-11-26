"use client";

import { useEffect, useRef } from "react";
import {
  formatBirthDate,
  formatBirthTime,
  languageNative,
  REPORT_LABEL,
  type BirthDetailsInput,
} from "@/lib/report";
import type { ReportPreview } from "@/lib/preview";

const LOCKED_CONTENT = [
  "Planetary placements and house themes",
  "Vimshottari dasha timeline with dates",
  "Career, relationships and wellbeing themes",
  "Personalised practical suggestions",
  "Your full numerology profile with corrected spellings",
];

const TONE_CLASS: Record<string, string> = {
  default: "border-white/10 bg-white/[0.03]",
  highlight: "border-gold-300/30 bg-gold-300/[0.05]",
  warning: "border-rose-400/25 bg-rose-500/[0.06]",
};

export default function PreviewReport({
  preview,
  details,
  onUnlock,
}: {
  preview: ReportPreview;
  details: BirthDetailsInput;
  onUnlock: () => void;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [preview.generatedAt]);

  const birthBits = [
    details.birthDate ? `Born ${formatBirthDate(details.birthDate)}` : null,
    details.birthTime ? `at ${formatBirthTime(details.birthTime)}` : null,
    details.birthPlace || null,
  ].filter(Boolean);

  return (
    <section
      ref={ref}
      id="report"
      aria-live="polite"
      className="mx-auto mb-16 max-w-[800px] scroll-mt-20 animate-fade-up overflow-hidden rounded-[18px] border border-gold-600/45 bg-ink-800 shadow-panel"
    >
      <div className="border-b border-white/10 bg-gradient-to-br from-[#26223a] to-[#191a2b] px-5 py-6 sm:px-7">
        <p className="text-[10px] font-bold uppercase tracking-eyebrow text-gold-300">
          Your personal preview · {REPORT_LABEL[preview.reportType]}
        </p>
        <h2 className="mt-2 font-serif text-2xl leading-tight text-ink-50 sm:text-3xl">
          {preview.title}
        </h2>
        <p className="mt-1 text-xs text-ink-200">
          {birthBits.length ? birthBits.join(" · ") : preview.subtitle}
          {" · "}
          {languageNative(details.language)}
        </p>
      </div>

      <div className="px-5 py-6 sm:px-7">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {preview.metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-[11px] border border-white/[0.07] bg-white/[0.04] px-3.5 py-3"
            >
              <span className="block text-[11px] text-ink-200">{m.label}</span>
              <strong className="block truncate text-lg text-gold-300">
                {m.value}
              </strong>
              {m.hint && (
                <span className="block truncate text-[10px] text-ink-300">
                  {m.hint}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {preview.sections.map((section) => (
            <div
              key={section.title}
              className={`rounded-xl border px-4 py-3.5 ${
                TONE_CLASS[section.tone ?? "default"]
              }`}
            >
              <h3 className="font-serif text-base text-ink-50 sm:text-lg">
                {section.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-100">
                {section.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
          <h3 className="font-serif text-base text-ink-50 sm:text-lg">
            A first reflection
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-ink-100">
            {preview.reflection}
          </p>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-xl border border-dashed border-gold-600/60 px-4 pb-4 pt-4">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 max-h-24 overflow-hidden opacity-70 blur-[5px]"
          >
            <ul className="space-y-1.5 p-4 text-sm text-ink-100">
              {LOCKED_CONTENT.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="relative rounded-lg bg-ink-800/95 px-1 pt-14">
            <h3 className="font-serif text-base text-ink-50 sm:text-lg">
              Inside your complete report
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-200">
              {LOCKED_CONTENT.join(" · ")}.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-ink-200">
                Full report · downloadable PDF
              </span>
              <button
                type="button"
                onClick={onUnlock}
                className="rounded-[9px] bg-gold-cta px-4 py-2.5 text-sm font-bold text-[#20180e] shadow-cta transition hover:brightness-105"
              >
                Unlock full report
              </button>
            </div>
          </div>
        </div>

        <p className="mt-4 text-left text-[11px] leading-relaxed text-ink-300">
          Free preview computed with the Chaldean numerology and traditional
          panchang rules. The complete report pairs this with the Vedic chart
          engine, reviewed content and delivery in your chosen language.
        </p>
      </div>
    </section>
  );
}
