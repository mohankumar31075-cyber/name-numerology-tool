"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReportBlock, StructuredReport } from "@/lib/reportSections";

type Report = {
  structured: StructuredReport;
  whatsappText: string;
  whatsappUrl: string;
  source: string;
};

type Payment = {
  amount: number;
  currency: string;
  reference: string;
  upiLink: string | null;
  upiIdConfigured: boolean;
  whatsappUrl: string;
};

function inr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function Block({ block }: { block: ReportBlock }) {
  if (block.kind === "chart") {
    // Fixed-sign South Indian chart, clockwise from Pisces in the top-left.
    const cells = [11,0,1,2,10,null,null,3,9,null,null,4,8,7,6,5];
    return <div className="grid grid-cols-4 border-l border-t border-gold-300/40" aria-label="South Indian fixed-sign chart">
      {cells.map((index, i) => index === null ? <div key={i} className="min-h-[70px] border-b border-r border-gold-300/40 bg-white/[0.02]" /> :
        <div key={i} className="min-h-[70px] border-b border-r border-gold-300/40 p-2">
          <span className="block text-[10px] font-bold text-gold-300">{block.cells[index].sign}</span>
          <span className="block break-words text-xs leading-relaxed text-ink-50">{block.cells[index].entries.join(", ") || "—"}</span>
        </div>)}
    </div>;
  }
  if (block.kind === "paragraph") {
    return (
      <p className="text-[13.5px] leading-relaxed text-ink-100">{block.text}</p>
    );
  }

  if (block.kind === "list") {
    return (
      <ul className="space-y-1.5">
        {block.items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[13.5px] leading-relaxed text-ink-100">
            <span aria-hidden="true" className="text-gold-300">
              •
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (block.kind === "metrics") {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {block.items.map((m) => (
          <div
            key={m.label}
            className="rounded-[10px] border border-white/[0.07] bg-white/[0.04] px-3 py-2.5"
          >
            <span className="block text-[10px] leading-tight text-ink-300">
              {m.label}
            </span>
            <strong className="block truncate text-base text-gold-300">
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
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-left text-[13px]">
        <thead>
          <tr className="border-b border-white/10">
            {block.columns.map((c) => (
              <th
                key={c}
                className="py-2 pr-3 text-[10px] font-semibold uppercase tracking-wide text-ink-300"
              >
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, i) => (
            <tr key={i} className="border-b border-white/[0.06] last:border-0">
              {row.map((cell, j) => (
                <td
                  key={j}
                  className={`py-2 pr-3 align-top ${
                    j === 0 ? "text-ink-50" : "text-ink-100"
                  } ${cell === "current" ? "font-semibold text-gold-300" : ""}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {block.note && (
        <p className="mt-2 text-[11px] leading-relaxed text-ink-300">{block.note}</p>
      )}
    </div>
  );
}

export default function ReportView({
  orderId,
  paid,
  reportType,
  reference,
  languageLabel,
}: {
  orderId: string;
  paid: boolean;
  reportType: string;
  reference: string;
  languageLabel: string;
}) {
  const [report, setReport] = useState<Report | null>(null);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [paidNow, setPaidNow] = useState(paid);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const pdfRef = useRef<HTMLDivElement>(null);

  async function downloadPdf() {
    if (!pdfRef.current || downloading) return;
    setDownloading(true); setPdfError("");
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
      const pdf = new jsPDF({unit:"mm",format:"a4",compress:true});
      const pageWidth = 210, pageHeight = 297, margin = 12, width = pageWidth - 2*margin;
      let y = margin;
      const sections = pdfRef.current.querySelectorAll<HTMLElement>("[data-pdf-section]");
      for (const section of Array.from(sections)) {
        const canvas = await html2canvas(section, {
          backgroundColor: "#151728", scale: 1.5, windowWidth: 1024,
          onclone: (doc, cloned) => {
            cloned.style.width = "760px";
            cloned.style.maxWidth = "none";
            cloned.querySelectorAll<HTMLElement>(".overflow-x-auto").forEach(el => { el.style.overflow = "visible"; });
            cloned.querySelectorAll<HTMLElement>("table").forEach(el => { el.style.minWidth = "0"; });
          },
        });
        const imageHeight = canvas.height * width / canvas.width;
        if (y > margin && imageHeight <= pageHeight - 2*margin && y + imageHeight > pageHeight - margin) { pdf.addPage(); y = margin; }
        let pixelY = 0;
        while (pixelY < canvas.height) {
          const available = pageHeight - margin - y;
          if (available < 15) { pdf.addPage(); y = margin; continue; }
          const sliceHeight = Math.min(canvas.height - pixelY, Math.floor(available * canvas.width / width));
          const slice = document.createElement("canvas"); slice.width = canvas.width; slice.height = sliceHeight;
          const ctx = slice.getContext("2d");
          if (!ctx) throw new Error("Canvas is unavailable");
          ctx.drawImage(canvas, 0, pixelY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
          const h = sliceHeight * width / canvas.width;
          pdf.addImage(slice.toDataURL("image/jpeg", 0.9), "JPEG", margin, y, width, h);
          y += h + 3; pixelY += sliceHeight;
          if (pixelY < canvas.height) { pdf.addPage(); y = margin; }
        }
      }
      pdf.save(`jyotish-one-report-${reference}.pdf`);
    } catch {
      setPdfError("Could not create the PDF on this device. Please use Print / save PDF instead.");
    } finally { setDownloading(false); }
  }

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate-for-order", orderId }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not build the report.");
        return;
      }
      setReport(data.report as Report);
    } catch {
      setError("Network error while building the report.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const loadPayment = useCallback(async () => {
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "pay-intent", orderId }),
      });
      const data = await res.json();
      if (data.ok) setPayment(data.payment as Payment);
    } catch {
      /* the WhatsApp fallback still works */
    }
  }, [orderId]);

  useEffect(() => {
    if (paidNow) void loadReport();
    else void loadPayment();
  }, [paidNow, loadReport, loadPayment]);

  /* While locked, poll the order so the page unlocks on its own the moment the
     owner confirms the payment — the customer does not have to refresh. */
  useEffect(() => {
    if (paidNow) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/report?orderId=${orderId}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.ok && data.order?.paymentStatus === "paid") setPaidNow(true);
      } catch {
        /* keep the page usable offline; the next tick retries */
      }
    }, 20000);
    return () => clearInterval(timer);
  }, [paidNow, orderId]);

  async function claimPaid() {
    setClaiming(true);
    setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "claim-paid",
          orderId,
          paymentReference,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not record that payment reference.");
        return;
      }
      setClaimed(true);
      /* the poll above picks this up within 20s */
    } catch {
      setError("Network error while submitting your payment reference.");
    } finally {
      setClaiming(false);
    }
  }

  const waPayment =
    payment?.whatsappUrl ??
    `https://wa.me/919008831075?text=${encodeURIComponent(
      `Hi, I have paid for my ${reportType} report.\nReference: ${reference}\nPlease unlock my report.`
    )}`;

  /* ------------------------------------------------------------- locked view */
  if (!paidNow) {
    return (
      <div className="mt-5 space-y-4">
        <div className="rounded-[18px] border border-gold-300/30 bg-gold-300/[0.06] px-5 py-4">
          <p className="font-serif text-lg text-ink-50">Payment pending</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-200">
            Your report is ready and waiting. Pay
            {payment ? ` ${inr(payment.amount)}` : ""} using the button below —
            we verify it and unlock this page.
          </p>
          {payment?.upiLink ? (
            <a
              href={payment.upiLink}
              className="mt-3 block rounded-[9px] bg-gold-cta py-2.5 text-center text-sm font-bold text-[#20180e] transition hover:brightness-105"
            >
              Pay {inr(payment.amount)} with UPI
            </a>
          ) : (
            <a
              href={payment?.whatsappUrl ?? waPayment}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block rounded-[9px] bg-green-600 py-2.5 text-center text-sm font-bold text-white transition hover:bg-green-500"
            >
              Get payment details on WhatsApp
            </a>
          )}
          <p className="mt-2 text-[11px] text-ink-300">Reference: {reference}</p>
        </div>

        <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-sm font-semibold text-ink-50">
            {claimed ? "We have your payment reference" : "Already paid? Tell us"}
          </p>
          {claimed ? (
            <>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-200">
                Thank you. We&apos;re matching your payment now — this page
                unlocks as soon as it clears, and we&apos;ll also send the report
                on WhatsApp so you never have to chase it.
              </p>
              <a
                href={waPayment}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 block rounded-[9px] bg-green-600 py-2.5 text-center text-sm font-bold text-white transition hover:bg-green-500"
              >
                Send the screenshot on WhatsApp too →
              </a>
            </>
          ) : (
            <>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-300">
                Paste the UPI / transaction reference from your payment app. We
                check it against our account and unlock your report.
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  value={paymentReference}
                  onChange={(e) => {
                    setPaymentReference(e.target.value.toUpperCase().slice(0, 40));
                    setError("");
                  }}
                  placeholder="e.g. 4312 8890 1123"
                  aria-label="UPI or transaction reference"
                  className="flex-1 rounded-[10px] border border-ink-500 bg-[#10121f] px-3.5 py-2.5 text-sm text-ink-50 outline-none focus:border-gold-300"
                />
                <button
                  type="button"
                  onClick={claimPaid}
                  disabled={claiming || paymentReference.trim().length < 4}
                  className="rounded-[10px] bg-gold-cta px-4 text-sm font-bold text-[#20180e] transition hover:brightness-105 disabled:opacity-60"
                >
                  {claiming ? "Sending…" : "Submit"}
                </button>
              </div>
            </>
          )}
          {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
        </div>

        {!claimed && (
          <a
            href={waPayment}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-[11px] border border-green-500/40 py-3 text-center text-sm font-bold text-green-300 transition hover:bg-green-500/10"
          >
            Send payment screenshot on WhatsApp →
          </a>
        )}

        <div className="rounded-[18px] border border-white/10 bg-white/[0.02] px-5 py-4">
          <p className="text-[11px] font-bold uppercase tracking-eyebrow text-ink-300">
            What unlocks
          </p>
          <ul className="mt-2 space-y-1 text-[13px] text-ink-200">
            {[
              "Every section of your report, in full",
              "A printable view you can save as PDF",
              "The full report text for WhatsApp",
            ].map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------------- paid view */
  if (loading) {
    return (
      <div className="mt-8 flex items-center justify-center gap-3 rounded-[18px] border border-white/10 bg-white/[0.03] px-5 py-12 text-sm text-ink-200">
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-gold-300/40 border-t-gold-300"
        />
        Preparing your full report…
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="mt-5 space-y-3">
        <div className="rounded-[18px] border border-rose-400/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
          {error}
        </div>
        <button
          type="button"
          onClick={() => void loadReport()}
          className="w-full rounded-[11px] bg-gold-cta py-3 text-sm font-bold text-[#20180e] transition hover:brightness-105"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-2 print:hidden">
        <button type="button" onClick={() => void downloadPdf()} disabled={downloading} className="flex-1 rounded-[11px] bg-gold-cta px-4 py-3 text-sm font-bold text-[#20180e] disabled:opacity-60">{downloading ? "Preparing PDF…" : "Download complete PDF"}</button>
        <button type="button" onClick={() => window.print()} className="flex-1 rounded-[11px] border border-white/15 px-4 py-3 text-sm font-semibold text-ink-50">Print / save PDF</button>
        <a href={report.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-[11px] bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white">Send to WhatsApp</a>
      </div>
      {pdfError && <p role="alert" className="mt-2 text-sm text-rose-300">{pdfError}</p>}
      <div ref={pdfRef}>
      <div data-pdf-section className="mt-4 rounded-[14px] border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs uppercase text-gold-300">Jyotish One · Complete report</p>
        <h2 className="mt-1 font-serif text-xl text-ink-50">{report.structured.headline}</h2>
        <p className="mt-1 text-sm text-ink-200">{report.structured.subline}</p>
      </div>
      <div data-pdf-section className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {report.structured.summary.map((m) => (
          <div
            key={m.label}
            className="rounded-[10px] border border-white/[0.07] bg-white/[0.04] px-3 py-2.5"
          >
            <span className="block text-[10px] leading-tight text-ink-300">
              {m.label}
            </span>
            <strong className="block truncate text-base text-gold-300">
              {m.value}
            </strong>
            {m.hint && (
              <span className="block truncate text-[10px] text-ink-300">{m.hint}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {report.structured.sections.map((section) => (
          <section
            key={section.id}
            data-pdf-section
            className="rounded-[14px] border border-white/10 bg-white/[0.03] px-4 py-4"
          >
            <h2 className="font-serif text-lg text-ink-50">{section.title}</h2>
            <div className="mt-2.5 space-y-3">
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p data-pdf-section className="mt-5 rounded-[14px] border border-white/10 bg-white/[0.02] px-4 py-3 text-[11px] leading-relaxed text-ink-300">
        Report content: English{languageLabel !== "English" ? ` (requested: ${languageLabel})` : ""} · generated{" "}
        {new Date(report.structured.generatedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}{" "}
        · engine {report.source}. Traditional astrology and numerology are for
        reflection and cultural interest — not medical, legal or financial
        advice.
      </p>

      </div>
      <div className="mt-4 print:hidden">
        <details className="rounded-[14px] border border-white/10 bg-white/[0.02] px-4 py-3">
          <summary className="cursor-pointer text-xs font-semibold text-ink-100">
            Plain-text version (for WhatsApp)
          </summary>
          <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[#0c0d19] p-3 text-[11px] leading-relaxed text-ink-100">
            {report.whatsappText}
          </pre>
        </details>
      </div>
    </div>
  );
}
