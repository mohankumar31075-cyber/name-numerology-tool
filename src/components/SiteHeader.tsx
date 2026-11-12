"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Name Numerology" },
  { href: "/navagraha", label: "Navagraha" },
];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-brand-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-900 text-sm font-bold text-white shadow">
            AS
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Astro Services</p>
            <p className="text-xs text-brand-700">Name · Navagraha · Reports</p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 rounded-full bg-brand-50 p-1">
          {tabs.map((t) => {
            const active = t.href === "/" ? pathname === "/" || pathname.startsWith("/result") : pathname.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  active ? "bg-brand-700 text-white shadow" : "text-brand-800 hover:bg-brand-100"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
