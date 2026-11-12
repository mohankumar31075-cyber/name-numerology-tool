"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { analyzeName, type FullAnalysis } from "@/lib/chaldean";
import Link from "next/link";

const COUPONS: Record<string, { type: "flat" | "percent" | "free"; value: number; label: string }> = {
  FREE100: { type: "free", value: 100, label: "100% OFF — Free Report" },
  NAMEFREE: { type: "free", value: 100, label: "Free Name Report" },
  SAVE100: { type: "flat", value: 100, label: "₹100 OFF" },
  SAVE150: { type: "flat", value: 150, label: "₹150 OFF" },
  SAVE200: { type: "flat", value: 200, label: "₹200 OFF" },
  HALF50: { type: "percent", value: 50, label: "50% OFF" },
  WELCOME: { type: "flat", value: 99, label: "₹99 OFF Welcome" },
  TEST0: { type: "free", value: 100, label: "Test Free Access" },
};

const BASE_PRICE = 299;
const ADDON_FINANCE = 149;
const ADDON_LAL = 99;
const ADDON_MOBILE = 79;

function ResultContent() {
  const searchParams = useSearchParams();
  const [showPay, setShowPay] = useState(false);
  const [wa, setWa] = useState("");
  const [email, setEmail] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponError, setCouponError] = useState("");
  const [addonFinance, setAddonFinance] = useState(false);
  const [addonLal, setAddonLal] = useState(false);
  const [addonMobile, setAddonMobile] = useState(false);

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
        <Link href="/" className="inline-flex rounded-xl bg-maroon-800 px-6 py-3 font-semibold text-white">← Back to Form</Link>
      </div>
    );
  }

  const { name, destiny, lifePath, soulUrge, personality, subconscious, compatibility, nameMeaning, lifePathMeaning, fullName, day, month, year, correctedTease } = analysis;

  const subtotal = BASE_PRICE + (addonFinance ? ADDON_FINANCE : 0) + (addonLal ? ADDON_LAL : 0) + (addonMobile ? ADDON_MOBILE : 0);
  let discount = 0;
  let isFree = false;
  const applied = couponApplied ? COUPONS[couponApplied] : null;
  if (applied) {
    if (applied.type === "free") { isFree = true; discount = subtotal; }
    else if (applied.type === "flat") discount = Math.min(applied.value, subtotal);
    else discount = Math.round((subtotal * applied.value) / 100);
  }
  const total = Math.max(0, subtotal - discount);

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (!code) { setCouponError("Enter a coupon code"); return; }
    if (!COUPONS[code]) { setCouponError("Invalid coupon code"); setCouponApplied(null); return; }
    setCouponApplied(code);
    setCouponError("");
  }

  const whatsappNumber = "919008831075";
  const orderMsg = encodeURIComponent(`Hi, I want the Name Correction Report.\n\nName: ${fullName}\nDOB: ${day}/${month}/${year}\nName Number: ${name.nameNumber}\nLife Path: ${lifePath.lifePath}\nWhatsApp: ${wa || "—"}\nEmail: ${email || "—"}\nCoupon: ${couponApplied || "none"}\nAdd-ons: Finance=${addonFinance}, Lal Kitab=${addonLal}, Mobile=${addonMobile}\nTotal: ₹${total}${isFree ? " (FREE)" : ""}`);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${orderMsg}`;

  const coreNumbers = [
    { label: "Your Life Path Number", value: lifePath.lifePath, desc: lifePathMeaning.short, color: "from-amber-400 to-orange-500", bg: "bg-amber-50" },
    { label: "Your Name Destiny Number", value: destiny.destiny, desc: destiny.destiny === 11 || destiny.destiny === 22 ? "Master number energy." : "Destiny vibration from your full name.", color: "from-blue-400 to-indigo-500", bg: "bg-blue-50" },
    { label: "Your Personality Number", value: personality.personality, desc: "How others perceive you.", color: "from-emerald-400 to-teal-500", bg: "bg-emerald-50" },
    { label: "Your Soul Urge Number", value: soulUrge.soulUrge, desc: "Your inner desires and motivations.", color: "from-pink-400 to-rose-500", bg: "bg-pink-50" },
    { label: "Your Subconscious Self Number", value: subconscious, desc: "Instinctive response under pressure.", color: "from-violet-400 to-purple-500", bg: "bg-violet-50" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/50 via-white to-maroon-50/30 pb-28">
      <header className="border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link href="/" className="text-sm font-medium text-gray-600">← Back</Link>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Free Preview</span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Free Preview For</p>
          <h1 className="mt-1 font-serif text-2xl font-bold tracking-wide text-gray-900">{fullName.toUpperCase()}</h1>
          <p className="mt-1 text-sm text-gray-500">Born {day}/{month}/{year} · {analysis.gender}</p>
        </div>

        {compatibility.hasIssue && (
          <div className="mb-5 flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow">
            <span>!</span><span>1 ISSUE FOUND IN YOUR NAME</span>
          </div>
        )}

        {compatibility.hasIssue && (
          <p className="mb-5 text-center font-serif text-lg font-semibold leading-snug text-gray-900">
            {fullName.toUpperCase()} is vibrating at <span className="text-maroon-800">{name.nameNumber}</span> — and it&apos;s working against your money luck
          </p>
        )}

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-gray-700">Current Name — Weak</span>
              <span className="font-bold text-red-600">{compatibility.currentStrength}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-red-100">
              <div className="h-full rounded-full bg-red-500" style={{ width: `${compatibility.currentStrength}%` }} />
            </div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-gray-700">Corrected Name — Strong</span>
              <span className="font-bold text-emerald-600">{compatibility.correctedStrength}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-emerald-100">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${compatibility.correctedStrength}%` }} />
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50 to-white p-5 text-center shadow-sm">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-amber-700">Your Corrected Spelling Is Ready</p>
          <p className="font-serif text-2xl font-bold tracking-wide text-gray-900">
            {correctedTease.visibleStart}<span className="mx-0.5 blur-[5px] select-none">{correctedTease.blurred}</span>{correctedTease.visibleEnd ? ` ${correctedTease.visibleEnd}` : ""}
          </p>
          <p className="mt-2 text-sm text-emerald-700">New vibration <strong>{correctedTease.targetVibration}</strong> ✓ {correctedTease.targetTitle}</p>
          <button onClick={() => setShowPay(true)} className="mt-4 w-full rounded-xl bg-maroon-800 py-3.5 text-sm font-semibold text-white shadow-lg">🔒 Unlock My Corrected Name</button>
        </div>

        <section className="mb-8">
          <h2 className="mb-1 font-serif text-xl font-bold text-gray-900">Your Core Numbers</h2>
          <p className="mb-4 text-sm text-gray-500">Five key numbers derived from your name and birth date.</p>
          <div className="space-y-2.5">
            {coreNumbers.map((item) => (
              <div key={item.label} className={`flex items-center gap-3 rounded-2xl ${item.bg} p-3.5`}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-lg font-bold text-white shadow`}>{item.value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-gray-100 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">⭐ Ruling Planet</p><p className="mt-0.5 text-sm font-semibold text-gray-900">{nameMeaning.planet}</p></div>
            <div className="rounded-xl border border-gray-100 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">✨ Lucky Day</p><p className="mt-0.5 text-sm font-semibold text-gray-900">{nameMeaning.luckyDay}</p></div>
            <div className="rounded-xl border border-gray-100 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">🎨 Lucky Colours</p><p className="mt-0.5 text-sm font-semibold text-gray-900">{nameMeaning.luckyColours}</p></div>
            <div className="rounded-xl border border-gray-100 bg-white p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600">🔢 Lucky Numbers</p><p className="mt-0.5 text-sm font-semibold text-gray-900">{nameMeaning.luckyNumbers}</p></div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-1 font-serif text-xl font-bold text-gray-900">Your Name Number</h2>
          <p className="mb-4 text-sm text-gray-500">Every letter has a Chaldean value. Here&apos;s how yours adds up.</p>
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wide text-gray-400">Full Name</p>
            <p className="mb-4 text-center font-serif text-lg font-bold tracking-widest text-gray-900">{fullName.toUpperCase()}</p>
            <div className="mb-4 flex flex-wrap justify-center gap-1.5">
              {name.letterBreakdown.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-maroon-800 text-sm font-bold text-white">{item.letter}</div>
                  <span className="mt-0.5 text-[10px] font-medium text-maroon-700">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl bg-amber-50 px-3 py-3 text-center">
              <p className="text-xs text-gray-700">{name.letterBreakdown.map((i) => i.value).join(" + ")} = <strong>{name.compound}</strong></p>
              <p className="mt-1 text-xs text-gray-500">↓ Reduced to single digit</p>
              <div className="mx-auto mt-2 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500 text-xl font-bold text-white shadow">{name.nameNumber}</div>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="mb-1 font-serif text-xl font-bold text-gray-900">Your Name Number Analysis</h2>
          <p className="mb-4 text-sm text-gray-500">What number {name.nameNumber} means for you.</p>
          <div className="mb-3 overflow-hidden rounded-2xl bg-gradient-to-r from-maroon-800 to-maroon-950 p-4 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-2xl font-bold">{name.nameNumber}</div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-maroon-200">Name Number</p>
                <p className="text-lg font-bold">{nameMeaning.title}</p>
                <p className="text-xs text-maroon-100">{nameMeaning.short}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-emerald-100 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-emerald-800">Your Strengths</h3>
              <ul className="space-y-1.5">{nameMeaning.strengths.map((s) => (<li key={s} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-emerald-500">✓</span>{s}</li>))}</ul>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-rose-800">Common Challenges</h3>
              <ul className="space-y-1.5">{nameMeaning.challenges.map((c) => (<li key={c} className="flex items-start gap-2 text-sm text-gray-700"><span className="text-rose-500">✗</span>{c}</li>))}</ul>
            </div>
          </div>
        </section>

        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-md">
          <p className="text-sm text-gray-600">Full report, prepared for you</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">₹{BASE_PRICE}</span>
            <span className="text-lg text-gray-400 line-through">₹499</span>
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">MAX ₹299</span>
          </div>
          <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-700">
            {["Corrected name options", "Core numbers analysis", "Lo Shu grid reading", "Lucky numbers & colours", "Lucky mobile number", "Personalised remedies", "Career & money outlook", "PDF + WhatsApp delivery"].map((f) => (
              <li key={f} className="flex items-center gap-2"><span className="text-emerald-500">✓</span>{f}</li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">Have a coupon? Apply at checkout — codes like <strong>FREE100</strong> unlock the report free.</p>
          <button onClick={() => setShowPay(true)} className="mt-4 w-full rounded-xl bg-maroon-800 py-3.5 text-sm font-semibold text-white shadow-lg">Get My Corrected Name — ₹{BASE_PRICE} →</button>
        </div>

        <p className="text-center text-xs text-gray-400">Free preview uses traditional Chaldean numerology for guidance only.</p>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto flex max-w-lg gap-2">
          <Link href="/" className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-200 text-gray-600">←</Link>
          <button onClick={() => setShowPay(true)} className="flex-1 rounded-xl bg-maroon-800 text-sm font-semibold text-white shadow-lg">Get My Corrected Name — ₹{BASE_PRICE} →</button>
        </div>
      </div>

      {showPay && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-gray-900">Enter your Details</h3>
              <button onClick={() => setShowPay(false)} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">✕</button>
            </div>
            <label className="mb-1 block text-sm font-medium text-gray-700">WhatsApp Number * (For Report Delivery)</label>
            <input type="tel" value={wa} onChange={(e) => setWa(e.target.value)} placeholder="10-digit mobile number" className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-maroon-400" />
            <label className="mb-1 block text-sm font-medium text-gray-700">Email (optional)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mb-4 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-maroon-400" />
            <label className="mb-1 block text-sm font-medium text-gray-700">Coupon Code</label>
            <div className="mb-2 flex gap-2">
              <input type="text" value={coupon} onChange={(e) => { setCoupon(e.target.value); setCouponError(""); }} placeholder="e.g. FREE100" className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm uppercase outline-none focus:border-maroon-400" />
              <button type="button" onClick={applyCoupon} className="rounded-xl bg-gray-900 px-4 text-sm font-semibold text-white">Apply</button>
            </div>
            {couponError && <p className="mb-2 text-xs text-red-600">{couponError}</p>}
            {applied && <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">✓ {applied.label} applied</p>}
            <div className="mb-4 space-y-2">
              {[
                { label: "Add Finance & Career Report", old: 299, price: ADDON_FINANCE, checked: addonFinance, set: setAddonFinance },
                { label: "Add Lal Kitab Report", old: 199, price: ADDON_LAL, checked: addonLal, set: setAddonLal },
                { label: "Add Mobile Numerology Report", old: 149, price: ADDON_MOBILE, checked: addonMobile, set: setAddonMobile },
              ].map((a) => (
                <label key={a.label} className="flex cursor-pointer items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                  <input type="checkbox" checked={a.checked} onChange={(e) => a.set(e.target.checked)} className="mt-1" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{a.label}</p>
                    <p className="text-sm text-maroon-800"><span className="text-gray-400 line-through">₹{a.old}</span> <strong>₹{a.price}</strong></p>
                  </div>
                </label>
              ))}
            </div>
            <div className="mb-4 rounded-xl bg-gray-50 px-4 py-3 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal}</span></div>
              {discount > 0 && <div className="flex justify-between text-emerald-700"><span>Discount</span><span>-₹{discount}</span></div>}
              <div className="mt-1 flex justify-between text-base font-bold text-gray-900"><span>Total</span><span>{isFree || total === 0 ? "FREE" : `₹${total}`}</span></div>
            </div>
            <a href={wa.length >= 10 ? whatsappUrl : undefined} onClick={(e) => { if (wa.length < 10) { e.preventDefault(); alert("Please enter a valid 10-digit WhatsApp number"); } }} className="flex w-full items-center justify-center rounded-xl bg-maroon-800 py-3.5 text-sm font-semibold text-white shadow-lg">
              {isFree || total === 0 ? "Get Free Report on WhatsApp →" : `Proceed to Pay ₹${total}/- →`}
            </a>
            <p className="mt-3 text-center text-[11px] text-gray-400">Report delivered on WhatsApp · Coupon codes supported</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p className="text-gray-500">Loading your analysis...</p></div>}>
      <ResultContent />
    </Suspense>
  );
}
