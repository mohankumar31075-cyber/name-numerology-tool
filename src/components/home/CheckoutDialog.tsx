"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BASE_REPORT_PRICE,
  isValidWhatsAppNumber,
  languageNative,
  type BirthDetailsInput,
} from "@/lib/report";
import type { ReportPreview } from "@/lib/preview";

type Quote = {
  basePrice: number;
  discountPercent: number;
  coupon: string | null;
  couponLabel: string | null;
  price: number;
  isFree: boolean;
  currency: string;
  upiIdConfigured: boolean;
  upiLink: string | null;
  reference: string;
  whatsappUrl: string;
};

type FullReport = {
  whatsappText: string;
  whatsappUrl: string;
  source: string;
};

type Phase = "details" | "coupon" | "pay" | "ready" | "delivered";

function inr(n: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CheckoutDialog({
  open,
  onClose,
  details,
  preview,
  orderId,
}: {
  open: boolean;
  onClose: () => void;
  details: BirthDetailsInput;
  preview: ReportPreview | null;
  orderId: string | null;
}) {
  const [phase, setPhase] = useState<Phase>("details");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [report, setReport] = useState<FullReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!open) return;
    setPhase("details");
    setError("");
    setCouponError("");
    setBusy(false);
  }, [open]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const price = useMemo(() => {
    if (quote) return quote.price;
    if (coupon.trim()) return null; // unknown until validated
    return BASE_REPORT_PRICE;
  }, [quote, coupon]);

  const fetchQuote = useCallback(
    async (code: string) => {
      setBusy(true);
      setError("");
      try {
        const res = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "quote", ...details, coupon: code }),
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          setError(data.error || "Could not prepare the payment.");
          return null;
        }
        setQuote(data.quote as Quote);
        return data.quote as Quote;
      } catch {
        setError("Network error. Please try again.");
        return null;
      } finally {
        setBusy(false);
      }
    },
    [details]
  );

  async function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (!code) {
      setCouponError("Enter a coupon code.");
      return;
    }
    setCouponError("");
    setBusy(true);
    try {
      const res = await fetch("/api/coupon/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCouponError(data.error || "That coupon is not valid.");
        setQuote(null);
        return;
      }
      const next = await fetchQuote(code);
      if (next) {
        setToast(
          `Coupon applied — ${next.couponLabel || `${next.discountPercent}% off`}`
        );
        if (next.isFree) {
          await generateFullReport(next.coupon);
        } else {
          setPhase("pay");
        }
      }
    } catch {
      setCouponError("Could not check that coupon.");
    } finally {
      setBusy(false);
    }
  }

  async function generateFullReport(validatedCoupon?: string | null) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          ...details,
          coupon: validatedCoupon ?? coupon.trim().toUpperCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok || !data.report) {
        setError(data.error || "Could not create the full report.");
        return;
      }
      setReport(data.report as FullReport);
      setPhase("ready");
    } catch {
      setError("Network error while creating the report.");
    } finally {
      setBusy(false);
    }
  }

  function continueFromDetails() {
    if (whatsapp && !isValidWhatsAppNumber(whatsapp)) {
      setError("Enter a valid WhatsApp number with country code.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      setError("That email does not look right.");
      return;
    }
    setError("");
    setPhase("coupon");
  }

  function payHandOff() {
    const url = quote?.whatsappUrl;
    window.open(url || `https://wa.me/919008831075`, "_blank", "noopener,noreferrer");
    setPhase("pay");
  }

  function confirmPaid() {
    setToast("Thanks! Send us the payment screenshot on WhatsApp and we'll unlock your report.");
    setPhase("delivered");
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
    >
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-ink-500 bg-ink-850 p-5 shadow-panel sm:rounded-3xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3
              id="checkout-title"
              className="font-serif text-xl text-ink-50"
            >
              Unlock your complete report
            </h3>
            <p className="mt-0.5 text-xs text-ink-200">
              {details.fullName || "Your report"} ·{" "}
              {languageNative(details.language)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close checkout"
            className="rounded-full border border-white/15 px-2.5 py-1 text-sm text-ink-200 transition hover:border-white/30 hover:text-ink-50"
          >
            ✕
          </button>
        </div>

        {preview && preview.metrics.length > 0 && (
          <div className="mb-4 grid grid-cols-3 gap-2">
            {preview.metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2"
              >
                <span className="block truncate text-[10px] text-ink-300">
                  {m.label}
                </span>
                <strong className="block truncate text-sm text-gold-300">
                  {m.value}
                </strong>
              </div>
            ))}
          </div>
        )}

        {phase === "details" && (
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1 block text-[12px] text-ink-100">
                WhatsApp number <span className="text-ink-300">(optional)</span>
              </span>
              <input
                type="tel"
                inputMode="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+91 90000 00000"
                className="w-full rounded-[10px] border border-ink-500 bg-[#10121f] px-3.5 py-2.5 text-sm text-ink-50 outline-none focus:border-gold-300"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] text-ink-100">
                Email <span className="text-ink-300">(optional)</span>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-[10px] border border-ink-500 bg-[#10121f] px-3.5 py-2.5 text-sm text-ink-50 outline-none focus:border-gold-300"
              />
            </label>
            <p className="text-[11px] leading-relaxed text-ink-300">
              We use these only to deliver your report. No marketing spam.
            </p>
            <button
              type="button"
              onClick={continueFromDetails}
              className="w-full rounded-[11px] bg-gold-cta py-3 text-sm font-bold text-[#20180e] transition hover:brightness-105"
            >
              Continue →
            </button>
          </div>
        )}

        {phase === "coupon" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-200">Full report</span>
                <span className="text-ink-100">{inr(BASE_REPORT_PRICE)}</span>
              </div>
              {quote && quote.discountPercent > 0 && (
                <div className="mt-1 flex items-center justify-between text-gold-300">
                  <span>{quote.couponLabel || quote.coupon}</span>
                  <span>−{quote.discountPercent}%</span>
                </div>
              )}
              <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 font-semibold">
                <span className="text-ink-50">Total</span>
                <span className="text-gold-300">
                  {price === 0 ? "FREE" : price === null ? "—" : inr(price)}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                value={coupon}
                onChange={(e) => {
                  setCoupon(e.target.value.toUpperCase());
                  setCouponError("");
                }}
                placeholder="Coupon code"
                aria-label="Coupon code"
                className="flex-1 rounded-[10px] border border-ink-500 bg-[#10121f] px-3.5 py-2.5 text-sm uppercase text-ink-50 outline-none focus:border-gold-300"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={busy}
                className="rounded-[10px] bg-white/10 px-4 text-sm font-semibold text-ink-50 transition hover:bg-white/15 disabled:opacity-60"
              >
                Apply
              </button>
            </div>
            {couponError && (
              <p className="text-xs text-rose-300">{couponError}</p>
            )}

            <button
              type="button"
              onClick={() => {
                setQuote(null);
                setCoupon("");
                void fetchQuote("").then((q) => q && setPhase("pay"));
              }}
              disabled={busy}
              className="w-full rounded-[11px] bg-gold-cta py-3 text-sm font-bold text-[#20180e] transition hover:brightness-105 disabled:opacity-70"
            >
              {busy ? "Preparing…" : "Continue to payment →"}
            </button>
            <button
              type="button"
              onClick={() => setPhase("details")}
              className="w-full text-center text-xs text-ink-300 underline-offset-2 hover:underline"
            >
              Back
            </button>
          </div>
        )}

        {phase === "pay" && quote && (
          <div className="space-y-3">
            <div className="rounded-xl border border-gold-300/30 bg-gold-300/[0.05] px-4 py-3">
              <div className="flex items-center justify-between text-sm text-ink-100">
                <span>Amount due</span>
                <strong className="text-lg text-gold-300">{inr(quote.price)}</strong>
              </div>
              {quote.upiLink && (
                <a
                  href={quote.upiLink}
                  className="mt-3 block rounded-[9px] bg-white/10 py-2.5 text-center text-sm font-semibold text-ink-50 transition hover:bg-white/15"
                >
                  Pay {inr(quote.price)} with UPI
                </a>
              )}
              <p className="mt-2 text-[11px] text-ink-300">
                Reference: {quote.reference.slice(0, 8).toUpperCase()}
              </p>
            </div>

            <p className="text-xs leading-relaxed text-ink-200">
              After paying, message us on WhatsApp with your payment screenshot.
              Your full report is prepared and sent in{" "}
              {languageNative(details.language)}.
            </p>

            <button
              type="button"
              onClick={payHandOff}
              className="w-full rounded-[11px] bg-green-600 py-3 text-sm font-bold text-white transition hover:bg-green-500"
            >
              Continue on WhatsApp →
            </button>
            <button
              type="button"
              onClick={confirmPaid}
              className="w-full rounded-[11px] bg-gold-cta py-3 text-sm font-bold text-[#20180e] transition hover:brightness-105"
            >
              I have paid — unlock my report
            </button>
            <button
              type="button"
              onClick={() => setPhase("coupon")}
              className="w-full text-center text-xs text-ink-300 underline-offset-2 hover:underline"
            >
              Have a coupon?
            </button>
          </div>
        )}

        {phase === "delivered" && (
          <div className="space-y-3">
            <div className="rounded-xl border border-mint-400/30 bg-mint-400/[0.07] px-4 py-3 text-sm text-ink-100">
              Your payment is being confirmed. Our team will send your complete
              report on WhatsApp and email shortly.
            </div>
            <a
              href={
                quote?.whatsappUrl ||
                `https://wa.me/919008831075?text=${encodeURIComponent(
                  "Hi, I have paid for my report."
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-[11px] bg-green-600 py-3 text-center text-sm font-bold text-white transition hover:bg-green-500"
            >
              Open WhatsApp →
            </a>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-[11px] border border-white/15 py-2.5 text-sm text-ink-100 transition hover:border-white/30"
            >
              Close
            </button>
          </div>
        )}

        {phase === "ready" && report && (
          <div className="space-y-3">
            <div className="rounded-xl border border-mint-400/30 bg-mint-400/[0.07] px-4 py-3 text-sm text-ink-100">
              Your full report is ready. Open it on WhatsApp to save or forward
              it.
            </div>
            <a
              href={report.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-[11px] bg-green-600 py-3 text-center text-sm font-bold text-white transition hover:bg-green-500"
            >
              Open full report on WhatsApp →
            </a>
            <details className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <summary className="cursor-pointer text-xs font-semibold text-ink-100">
                Read report here
              </summary>
              <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[#0c0d19] p-3 text-[11px] leading-relaxed text-ink-100">
                {report.whatsappText}
              </pre>
            </details>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full rounded-[11px] border border-white/15 py-2.5 text-sm text-ink-100 transition hover:border-white/30"
            >
              Print / save as PDF
            </button>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-xs text-rose-300">
            {error}
          </p>
        )}

        {orderId && (
          <p className="mt-4 text-center text-[10px] text-ink-300">
            Preview saved · reference {orderId.slice(0, 8).toUpperCase()}
          </p>
        )}
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-xl border border-ink-500 bg-ink-700 px-4 py-3 text-sm text-ink-50 shadow-toast"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
