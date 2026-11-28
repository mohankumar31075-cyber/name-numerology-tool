"use client";

import Link from "next/link";
import { useState } from "react";
import { WHATSAPP_NUMBER } from "@/lib/site";

const NAV = [
  { href: "/#reports", label: "Reports" },
  { href: "/#explore", label: "Explore" },
  { href: "/#how", label: "How it works" },
  { href: "/navagraha", label: "Navagraha" },
  { href: "/panchang", label: "Panchang" },
  { href: "/matchmaking", label: "Matchmaking" },
  { href: "/consult", label: "Consult" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-5 sm:px-7">
        <div className="flex h-[68px] items-center justify-between gap-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <span
              className="text-lg text-gold-300 transition group-hover:text-gold-200"
              aria-hidden="true"
            >
              ✦
            </span>
            <span className="font-serif text-lg font-bold tracking-wide text-ink-50">
              Jyotish <span className="text-gold-300">One</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-[13px] text-ink-100 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-gold-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/#form"
              className="hidden rounded-full border border-white/15 px-3.5 py-1.5 text-xs text-ink-50 transition hover:border-gold-300/60 hover:text-gold-200 sm:inline-flex"
            >
              Get your report&nbsp;→
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Close menu" : "Open menu"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-ink-100 transition hover:border-gold-300/60 hover:text-gold-200 lg:hidden"
            >
              <span aria-hidden="true">{open ? "✕" : "☰"}</span>
            </button>
          </div>
        </div>

        {open && (
          <nav
            id="mobile-nav"
            className="grid gap-1 border-t border-white/10 py-3 text-sm text-ink-100 lg:hidden"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-2 transition hover:bg-white/5 hover:text-gold-200"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                "Hi, I want a report"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 rounded-lg bg-green-600/90 px-2 py-2 text-center font-semibold text-white"
            >
              WhatsApp us
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
