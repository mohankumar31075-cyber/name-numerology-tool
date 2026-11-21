"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { analyzeName, generateCorrectedNames, type FullAnalysis } from "@/lib/chaldean";
import { buildLifeTimeline } from "@/lib/horoscope";
import { langLabel } from "@/lib/i18n";
import Link from "next/link";

const COUPONS: Record<string, { type: "flat" | "percent" | "free"; value: number; label: string }> = {
  FREE100: { type: "free", value: 100, label: "100% OFF" },
  NAMEFREE: { type: "free", value: 100, label: "Free Report" },
  OFF20: { type: "percent", value: 20, label: "20% OFF" },
  OFF30: { type: "percent", value: 30, label: "30% OFF" },
};
const BASE_PRICE = 299;

function ResultContent() {
  const searchParams = useSearchParams();
  const [showPay, setShowPay] = useState(false);
  const [wa, setWa] = useState("");
  const [email, setEmail] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const lang = searchParams.get("lang") || "en";
  const tob = searchParams.get("tob") || "";

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
        <h1 className="mb-4 text-2xl font-bold">Missing details</h1>
        <Link href="/" className="inline-flex rounded-xl bg-brand-700 px-6 py-3 font-semibold text-white">← Back</Link>
      </div>
    );
  }

  const { name, destiny, lifePath, soulUrge, personality, subconscious, compatibility, nameMeaning, lifePathMeaning, fullName, day, month, year, correctedTease, targetVibration } = analysis;
  const timeline = buildLifeTimeline(day, month, year, lifePath.lifePath);
  const correctedOptions = generateCorrectedNames(fullName, targetVibration || 6);

  const subtotal = BASE_PRICE;
  let discount = 0;
  let isFree = false;
  const applied = couponApplied ? COUPONS[couponApplied] : null;
  if (applied) {
    if (applied.type === "free") { isFree = true; discount = subtotal; }
    else if (applied.type === "flat") discount = Math.min(applied.value, subtotal);
    else discount = Math.round((subtotal * applied.value) / 100);
  }
  const total = Math.max(0, subtotal - discount);

  const orderMsg = encodeURIComponent(`Hi, I want the full Name + Horoscope report.\n\nName: ${fullName}\nDOB: ${day}/${month}/${year}${tob ? `\nTOB: ${tob}` : ""}\nLanguage: ${langLabel(lang)}\nName Number: ${name.nameNumber}\nLife Path: ${lifePath.lifePath}\nWhatsApp: ${wa || "—"}\nEmail: ${email || "—"}\nCoupon: ${couponApplied || "none"}\nTotal: ₹${total}${isFree ? " (FREE)" : ""}\n\nPlease send payment QR and deliver report in ${langLabel(lang)}.`);
  const whatsappUrl = `https://wa.me/919008831075?text=${orderMsg}`;

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (!code) { setCouponError("Enter coupon"); return; }
    if (!COUPONS[code]) { setCouponError("Invalid"); setCouponApplied(null); return; }
    setCouponApplied(code); setCouponError("");
  }

  function handlePay() {
    if (wa.length < 10) { alert("Enter valid 10-digit WhatsApp number"); return; }
    setUnlocked(true); setShowPay(false);
    setTimeout(() => window.open(whatsappUrl, "_blank"), 300);
  }

  return (
    <div className="min-h-screen bg-[#f6f8ff] pb-28 text-gray-900">
      <header className="border-b border-brand-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm text-gray-600">← Back</Link>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">{unlocked ? "Unlocked" : "Preview"} · {langLabel(lang)}</span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-5 rounded-2xl border bg-white p-5 text-center shadow-sm">
          <h1 className="font-serif text-2xl font-bold">{fullName.toUpperCase()}</h1>
          <p className="text-sm text-gray-500">Born {day}/{month}/{year}{tob ? ` · ${tob}` : ""} · {analysis.gender}</p>
        </div>

        {compatibility.hasIssue && (
          <div className="mb-5 rounded-full bg-red-600 px-4 py-2 text-center text-sm font-semibold text-white">1 ISSUE FOUND IN YOUR NAME</div>
        )}

        <section className="mb-8 rounded-2xl border border-brand-100 bg-white p-5 shadow-sm">
          <h2 className="font-serif text-xl font-bold">Your life path story</h2>
          <p className="text-xs text-gray-500">Age ~{timeline.age} · Life Path {timeline.lifePath}</p>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs font-semibold uppercase text-gray-400">Past</p><p className="mt-1">{timeline.past}</p></div>
            <div className="rounded-xl bg-brand-50 p-3"><p className="text-xs font-semibold uppercase text-brand-600">Present</p><p className="mt-1">{timeline.present}</p></div>
            <div className="rounded-xl bg-emerald-50 p-3"><p className="text-xs font-semibold uppercase text-emerald-700">Future</p><p className="mt-1">{timeline.future}</p></div>
          </div>
          <div className="mt-4 space-y-1">
            {timeline.phases.map((p) => (
              <div key={p.key} className="flex justify-between text-xs">
                <span>{p.title.en} ({p.ageRange})</span>
                <span className={p.status === "present" ? "font-bold text-brand-700" : "text-gray-400"}>{p.status}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-gray-400">{timeline.disclaimer}</p>
        </section>

        <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
          <div className="mb-3 flex justify-between text-sm"><span>Current Name</span><span className="font-bold text-red-600">{compatibility.currentStrength}%</span></div>
          <div className="mb-3 h-2 rounded-full bg-red-100"><div className="h-full rounded-full bg-red-500" style={{ width: `${compatibility.currentStrength}%` }} /></div>
          <div className="mb-1 flex justify-between text-sm"><span>Corrected Name</span><span className="font-bold text-emerald-600">{compatibility.correctedStrength}%</span></div>
          <div className="h-2 rounded-full bg-emerald-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${compatibility.correctedStrength}%` }} /></div>
        </div>

        <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
          {!unlocked ? (
            <>
              <p className="font-serif text-2xl font-bold">{correctedTease.visibleStart}<span className="blur-[5px]">{correctedTease.blurred}</span></p>
              <button onClick={() => setShowPay(true)} className="mt-4 w-full rounded-xl bg-brand-700 py-3.5 text-sm font-semibold text-white">🔒 Unlock Corrected Name</button>
            </>
          ) : (
            <div className="space-y-2 text-left">
              {correctedOptions.map((opt, i) => (
                <div key={i} className="rounded-xl border bg-white p-3"><p className="font-bold">{opt.spelling}</p><p className="text-xs">Number {opt.nameNumber}</p></div>
              ))}
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-2 flex justify-center rounded-xl bg-green-600 py-3 text-sm font-semibold text-white">WhatsApp report · {langLabel(lang)}</a>
            </div>
          )}
        </div>

        <section className="mb-8 space-y-2">
          <h2 className="font-serif text-xl font-bold">Core numbers</h2>
          {[
            ["Life Path", lifePath.lifePath, lifePathMeaning.short],
            ["Name Destiny", destiny.destiny, "Full name"],
            ["Personality", personality.personality, "Outer self"],
            ["Soul Urge", soulUrge.soulUrge, "Inner desire"],
            ["Subconscious", subconscious, "Under pressure"],
          ].map(([label, value, desc]) => (
            <div key={String(label)} className="flex justify-between rounded-xl bg-brand-50 px-4 py-3">
              <div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-gray-500">{desc}</p></div>
              <span className="text-xl font-bold text-brand-800">{value}</span>
            </div>
          ))}
          <p className="text-sm">Planet: <strong>{nameMeaning.planet}</strong> · Day: <strong>{nameMeaning.luckyDay}</strong></p>
        </section>

        {!unlocked && (
          <button onClick={() => setShowPay(true)} className="mb-6 w-full rounded-xl bg-brand-700 py-3.5 text-sm font-semibold text-white">Get report ₹{BASE_PRICE} · {langLabel(lang)}</button>
        )}
      </main>

      {showPay && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="w-full max-w-lg rounded-t-3xl bg-white p-5 sm:rounded-3xl">
            <div className="mb-3 flex justify-between"><h3 className="font-bold">Checkout</h3><button onClick={() => setShowPay(false)}>✕</button></div>
            <p className="mb-2 text-xs">Language: <strong>{langLabel(lang)}</strong></p>
            <input type="tel" value={wa} onChange={(e) => setWa(e.target.value)} placeholder="WhatsApp number *" className="mb-3 w-full rounded-xl border px-4 py-3 text-sm" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email optional" className="mb-3 w-full rounded-xl border px-4 py-3 text-sm" />
            <div className="mb-3 flex gap-2">
              <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon FREE100" className="flex-1 rounded-xl border px-4 py-3 text-sm uppercase" />
              <button type="button" onClick={applyCoupon} className="rounded-xl bg-gray-900 px-4 text-white text-sm">Apply</button>
            </div>
            {couponError && <p className="text-xs text-red-600">{couponError}</p>}
            {applied && <p className="text-xs text-emerald-700">✓ {applied.label}</p>}
            <p className="mb-3 font-bold">Total: {isFree || total === 0 ? "FREE" : `₹${total}`}</p>
            <button type="button" onClick={handlePay} className="w-full rounded-xl bg-green-600 py-3.5 text-sm font-semibold text-white">Unlock & WhatsApp →</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#f6f8ff] text-gray-700">Loading...</div>}>
      <ResultContent />
    </Suspense>
  );
}
