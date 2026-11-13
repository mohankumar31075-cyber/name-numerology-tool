"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Name" },
  { href: "/navagraha", label: "Navagraha" },
  { href: "/matchmaking", label: "Matchmaking" },
  { href: "/horoscope", label: "Horoscope" },
  { href: "/consult", label: "Consult" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-brand-100 bg-white/95 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-900 text-xs font-bold text-white shadow">
            AS
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">Astro Services</p>
            <p className="text-[10px] text-brand-700">Name · Kundli · Consult</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-0.5 rounded-full bg-brand-50 p-0.5">
          {tabs.map((t) => {
            const active =
              t.href === "/"
                ? pathname === "/" || pathname.startsWith("/result")
                : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-full px-2.5 py-1.5 text-xs font-medium transition sm:px-3 sm:text-sm ${
                  active ? "bg-brand-700 text-white shadow" : "text-brand-800 hover:bg-brand-100"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        <a
          href="https://wa.me/919008831075?text=Hi%2C%20I%20want%20to%20talk%20to%20an%20astrologer"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow sm:inline-flex"
        >
          WhatsApp
        </a>
      </div>
    </header>
  );
}
