"use client";

import { useCallback, useMemo, useState } from "react";
import BirthForm from "./BirthForm";
import CheckoutDialog from "./CheckoutDialog";
import PreviewReport from "./PreviewReport";
import ReportPicker from "./ReportPicker";
import {
  EMPTY_BIRTH_DETAILS,
  type BirthDetailsInput,
  type ReportType,
} from "@/lib/report";
import { buildPreview, type ReportPreview } from "@/lib/preview";

type StoredLead = { id: string | null; stored: boolean };

export default function HomeExperience({
  defaultReportType = "horoscope",
}: {
  defaultReportType?: ReportType;
}) {
  const [reportType, setReportType] = useState<ReportType>(defaultReportType);
  const [submitting, setSubmitting] = useState(false);
  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [details, setDetails] = useState<BirthDetailsInput>(EMPTY_BIRTH_DETAILS);
  const [lead, setLead] = useState<StoredLead>({ id: null, stored: false });
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const heroCopy = useMemo(
    () => ({
      horoscope: {
        headline: "Your story, written in the",
        accent: "stars & numbers.",
        blurb:
          "One thoughtful place for your birth chart, name numerology and daily panchang. Begin with a free personal preview.",
      },
      numerology: {
        headline: "Your name, read in the",
        accent: "language of numbers.",
        blurb:
          "Chaldean name number, life path and spelling corrections — begin with a free personal preview.",
      },
      panchang: {
        headline: "Today, mapped by the",
        accent: "tithi & nakshatra.",
        blurb:
          "Auspicious windows, rahu kalam and choghadiya for your city — start with today's free panchang.",
      },
    }),
    []
  )[reportType];

  const handleSubmit = useCallback(
    async (input: BirthDetailsInput) => {
      setSubmitting(true);
      const local = buildPreview(input);
      setDetails(input);
      setPreview(local);

      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...input, source: "home" }),
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          setLead({ id: data.leadId ?? null, stored: Boolean(data.stored) });
          if (data.preview) setPreview(data.preview as ReportPreview);
        } else if (data?.error) {
          console.warn("[home] lead not stored:", data.error);
        }
      } catch {
        // Preview already rendered from the local engine.
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  return (
    <>
      <section className="mx-auto max-w-4xl px-5 pb-7 pt-14 text-center sm:px-7 sm:pt-16">
        <p className="text-[11px] font-bold uppercase tracking-eyebrow text-gold-300">
          Vedic wisdom · Made personal
        </p>
        <h1 className="mx-auto mt-4 max-w-3xl font-serif text-[clamp(2.35rem,6vw,3.9rem)] font-medium leading-[1.05] tracking-tight text-ink-50">
          {heroCopy.headline}{" "}
          <span className="italic text-gold-300">{heroCopy.accent}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-[620px] text-balance text-[15px] leading-relaxed text-ink-100/90">
          {heroCopy.blurb}
        </p>
      </section>

      <div id="reports" className="scroll-mt-24 px-5 pb-1 sm:px-7">
        <ReportPicker value={reportType} onChange={setReportType} />
      </div>

      <BirthForm
        reportType={reportType}
        onReportTypeChange={setReportType}
        initial={EMPTY_BIRTH_DETAILS}
        submitting={submitting}
        onSubmit={handleSubmit}
      />

      {preview && (
        <PreviewReport
          preview={preview}
          details={details}
          onUnlock={() => setCheckoutOpen(true)}
        />
      )}

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        details={details}
        preview={preview}
        orderId={lead.id}
      />

      <span className="sr-only" aria-live="polite">
        {lead.stored ? "Preview saved." : ""}
      </span>
    </>
  );
}
