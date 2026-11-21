"use client";

import { REPORT_TYPES, type ReportType } from "@/lib/report";

const META: Record<
  ReportType,
  { icon: string; title: string; blurb: string }
> = {
  horoscope: {
    icon: "☾",
    title: "Birth Horoscope",
    blurb: "Kundli · planets · dasha",
  },
  numerology: {
    icon: "✳",
    title: "Name Numerology",
    blurb: "Name numbers · insights",
  },
  panchang: {
    icon: "☀",
    title: "Daily Panchang",
    blurb: "Tithi · nakshatra · yoga",
  },
};

export default function ReportPicker({
  value,
  onChange,
}: {
  value: ReportType;
  onChange: (next: ReportType) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose your report"
      className="mx-auto grid max-w-[820px] grid-cols-3 gap-2 sm:gap-3"
    >
      {REPORT_TYPES.map((type) => {
        const active = value === type;
        const meta = META[type];
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(type)}
            className={`card-hover rounded-[14px] border p-3 text-left sm:p-4 ${
              active
                ? "border-gold-300/50 bg-gold-300/[0.06]"
                : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
            }`}
          >
            <span className="text-xl" aria-hidden="true">
              {meta.icon}
            </span>
            <strong className="mt-1.5 block text-[13px] font-semibold text-ink-50 sm:text-sm">
              {meta.title}
            </strong>
            <small className="block text-[10px] leading-snug text-ink-200 sm:text-xs">
              {meta.blurb}
            </small>
          </button>
        );
      })}
    </div>
  );
}
