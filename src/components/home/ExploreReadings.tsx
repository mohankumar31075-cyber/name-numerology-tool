"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { numberReading, type NumberReading } from "@/lib/numberReadings";
import { whatsappUrl } from "@/lib/site";

const topics = [
  { icon: "☾", title: "Birth Kundli", text: "Explore your birth chart and planetary placements.", href: "/horoscope#form", action: "Start a preview", tag: "Birth chart" },
  { icon: "✳", title: "Name correction", text: "Explore your name number and spelling suggestions.", href: "/result", action: "Explore name numerology", tag: "Name numerology" },
  { icon: "♡", title: "Love & compatibility", text: "Try a simple name and birth-day compatibility preview.", href: "/matchmaking", action: "Explore compatibility", tag: "Preview" },
  { icon: "↗", title: "Career guidance", text: "Ask us about career-focused astrology guidance.", href: whatsappUrl("Hello, I would like to know about career astrology guidance. Please share details and availability."), action: "Ask on WhatsApp", tag: "Enquire", external: true },
  { icon: "⌁", title: "Mobile number", text: "Discover the digit-sum theme of your mobile number.", href: "#number-explorer", action: "Try number explorer", tag: "Free preview" },
  { icon: "◈", title: "Vehicle number", text: "Explore a digit-sum reading for your registration.", href: "#number-explorer", action: "Try number explorer", tag: "Free preview" },
];

export default function ExploreReadings() {
  const [kind, setKind] = useState<"mobile" | "vehicle">("mobile");
  const [value, setValue] = useState("");
  const [result, setResult] = useState<NumberReading | null>(null);
  const [error, setError] = useState("");
  function changeKind(next: "mobile" | "vehicle") { setKind(next); setValue(""); setResult(null); setError(""); }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = numberReading(value, kind);
    if (!next) {
      setResult(null);
      setError(kind === "mobile" ? "Enter a mobile number with 10–15 digits. Spaces, brackets, + and hyphens are allowed." : "Enter a registration using English letters, numbers, spaces or hyphens, including at least one digit.");
      return;
    }
    setError(""); setResult(next);
  }

  return <section id="explore" className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-16 sm:px-7">
    <div className="mb-6 max-w-xl">
      <p className="text-[11px] font-bold uppercase tracking-eyebrow text-gold-300">Find your reading</p>
      <h2 className="mt-2 font-serif text-2xl text-ink-50 sm:text-3xl">What would you like to explore?</h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-200">Choose a topic to start a preview or ask our team for details.</p>
    </div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map(topic => <Link key={topic.title} href={topic.href} target={topic.external ? "_blank" : undefined} rel={topic.external ? "noopener noreferrer" : undefined} onClick={topic.title === "Mobile number" ? () => changeKind("mobile") : topic.title === "Vehicle number" ? () => changeKind("vehicle") : undefined} className="card-hover group flex min-h-[180px] flex-col rounded-[16px] border border-white/10 bg-white/[0.03] p-5 hover:border-gold-300/40 hover:bg-white/[0.05]">
        <div className="flex items-center justify-between gap-2"><span className="text-2xl text-gold-300" aria-hidden="true">{topic.icon}</span><span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-ink-200">{topic.tag}</span></div>
        <h3 className="mt-3 font-serif text-lg text-ink-50">{topic.title}</h3><p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-200">{topic.text}</p><span className="mt-4 text-xs font-semibold text-gold-300 group-hover:text-gold-200">{topic.action} →</span>
      </Link>)}
    </div>
    <div id="number-explorer" className="mt-6 scroll-mt-24 rounded-[18px] border border-gold-300/25 bg-gradient-to-br from-gold-300/[0.08] to-white/[0.02] p-5 sm:p-7">
      <div className="grid gap-6 md:grid-cols-2 md:items-start">
        <div><p className="text-[11px] font-bold uppercase tracking-eyebrow text-gold-300">A quick, free reading</p><h3 className="mt-2 font-serif text-2xl text-ink-50">Number explorer</h3><p className="mt-2 text-sm leading-relaxed text-ink-200">Add the digits of a mobile number or vehicle registration and explore its traditional numerology theme.</p><p className="mt-3 text-xs leading-relaxed text-ink-300">Calculated in your browser; this tool does not send or save your number. For reflection, not a prediction or safety assessment.</p></div>
        <div>
          <div role="group" aria-label="Number type" className="mb-4 flex gap-2">{(["mobile", "vehicle"] as const).map(option => <button key={option} type="button" onClick={() => changeKind(option)} aria-pressed={kind === option} className={`rounded-full border px-4 py-2 text-xs font-semibold ${kind === option ? "border-gold-300/60 bg-gold-300/10 text-gold-200" : "border-white/15 text-ink-200"}`}>{option === "mobile" ? "Mobile number" : "Vehicle number"}</button>)}</div>
          <form onSubmit={submit} noValidate>
            <label htmlFor="number-reading" className="mb-1.5 block text-xs text-ink-100">{kind === "mobile" ? "Mobile number" : "Vehicle registration"}</label>
            <div className="flex flex-col gap-2 sm:flex-row"><input id="number-reading" value={value} onChange={e => {setValue(e.target.value); setError(""); setResult(null);}} inputMode={kind === "mobile" ? "tel" : "text"} maxLength={32} autoComplete="off" placeholder={kind === "mobile" ? "e.g. 98765 43210" : "e.g. KA 01 AB 1234"} aria-describedby="number-method" className="min-w-0 flex-1 rounded-[10px] border border-ink-500 bg-[#10121f] px-3.5 py-3 text-sm text-ink-50 outline-none focus:border-gold-300"/><button type="submit" className="rounded-[10px] bg-gold-cta px-5 py-3 text-sm font-bold text-[#20180e] hover:brightness-105">Explore number →</button></div>
            <p id="number-method" className="mt-2 text-[11px] leading-relaxed text-ink-300">{kind === "mobile" ? "All entered digits, including any country code, are counted." : "Only the digits in the registration are counted; letters are not included."}</p>
          </form>
          {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
          {result && <div role="status" className="mt-4 rounded-xl border border-gold-300/25 bg-ink-950/40 p-4"><p className="text-xs text-ink-200">Digit sum {result.sum} → <strong className="text-gold-300">{result.number}</strong></p><p className="mt-1 text-sm font-semibold text-ink-50">{result.theme}</p><p className="mt-1 text-xs leading-relaxed text-ink-300">A simple digit-sum interpretation, not a personalised compatibility report.</p></div>}
        </div>
      </div>
    </div>
  </section>;
}
