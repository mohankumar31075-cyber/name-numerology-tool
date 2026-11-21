"use client";

import { useCallback, useEffect, useState } from "react";
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
  confirmHeader: string;
  confirmAmount: number;
};

function inr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

function Block({ block }: { block: ReportBlock }) {
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
  const [paidAmount, setPaidAmount] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [paidNow, setPaidNow] = useState(paid);

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

  async function confirmPaid() {
    setVerifying(true);
    setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm-paid",
          orderId,
          paidAmount: Number(paidAmount),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not confirm that payment.");
        return;
      }
      setPaidNow(true);
    } catch {
      setError("Network error while confirming payment.");
    } finally {
      setVerifying(false);
    }
  }

  const waPayment = `https://wa.me/919008831075?text=${encodeURIComponent(
    `Hi, I have paid for my ${reportType} report.\nReference: ${reference}\n${
      paidAmount ? `Amount paid: ₹${paidAmount}\n` : ""
    }Please unlock my report.`
  )}`;

  /* ------------------------------------------------------------- locked view */
  if (!paidNow) {
    return (
      <div className="mt-5 space-y-4">
        <div className="rounded-[18px] border border-gold-300/30 bg-gold-300/[0.06] px-5 py-4">
          <p className="font-serif text-lg text-ink-50">Payment pending</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-200">
            Your report is prepared but locked. Complete the payment
            {payment ? ` of ${inr(payment.amount)}` : ""} and it will unlock here
            instantly — no need to wait for WhatsApp.
          </p>
          {payment?.upiLink && (
            <a
              href={payment.upiLink}
              className="mt-3 block rounded-[9px] bg-white/10 py-2.5 text-center text-sm font-semibold text-ink-50 transition hover:bg-white/15"
            >
              Pay {inr(payment.amount)} with UPI
            </a>
          )}
          <p className="mt-2 text-[11px] text-ink-300">
            Reference: {reference}
            {payment ? ` · ${payment.confirmHeader}: ${payment.confirmAmount}` : ""}
          </p>
        </div>

        <div className="rounded-[18px] border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-sm font-semibold text-ink-50">
            Already paid? Confirm it here
          </p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-300">
            {payment?.upiIdConfigured
              ? `Enter the amount you paid (${inr(payment.amount)}). We verify it before unlocking.`
              : "Paid us by UPI or bank transfer? Enter the amount you sent and we'll verify it before unlocking."}
          </p>
          <div className="mt-3 flex gap-2">
            <input
              inputMode="numeric"
              value={paidAmount}
              onChange={(e) => {
                setPaidAmount(e.target.value.replace(/[^\d]/g, ""));
                setError("");
              }}
              placeholder={
                payment ? `Amount paid (e.g. ${payment.amount})` : "Amount paid (₹)"
              }
              aria-label="Amount paid in rupees"
              className="flex-1 rounded-[10px] border border-ink-500 bg-[#10121f] px-3.5 py-2.5 text-sm text-ink-50 outline-none focus:border-gold-300"
            />
            <button
              type="button"
              onClick={confirmPaid}
              disabled={verifying || !paidAmount}
              className="rounded-[10px] bg-gold-cta px-4 text-sm font-bold text-[#20180e] transition hover:brightness-105 disabled:opacity-60"
            >
              {verifying ? "Checking…" : "Unlock"}
            </button>
          </div>
          {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
        </div>

        <a
          href={waPayment}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-[11px] bg-green-600 py-3 text-center text-sm font-bold text-white transition hover:bg-green-500"
        >
          Send payment screenshot on WhatsApp →
        </a>

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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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

      <div className="mt-4 flex flex-wrap gap-2 print:hidden">
        <a
          href={report.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-[11px] bg-green-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-green-500"
        >
          Send to WhatsApp
        </a>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex-1 rounded-[11px] border border-white/15 px-4 py-2.5 text-sm font-semibold text-ink-50 transition hover:border-gold-300/60 hover:text-gold-200"
        >
          Print / save PDF
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {report.structured.sections.map((section) => (
          <section
            key={section.id}
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

      <p className="mt-5 rounded-[14px] border border-white/10 bg-white/[0.02] px-4 py-3 text-[11px] leading-relaxed text-ink-300">
        Report in {languageLabel} · generated{" "}
        {new Date(report.structured.generatedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}{" "}
        · engine {report.source}. Traditional astrology and numerology are for
        reflection and cultural interest — not medical, legal or financial
        advice.
      </p>

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
