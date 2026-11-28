import Link from "next/link";

const SERVICES = [
  {
    href: "/result",
    icon: "✳",
    title: "Name numerology",
    body: "Chaldean name number, life path and corrected spellings.",
    meta: "Free tool",
    accent: "gold",
  },
  {
    href: "/horoscope",
    icon: "☾",
    title: "Detailed horoscope",
    body: "Name + birth details into a full report with dasha dates.",
    meta: "Full report",
    accent: "iris",
  },
  {
    href: "/panchang",
    icon: "☀",
    title: "Aaj ka panchang",
    body: "Tithi, nakshatra, muhurta, choghadiya and hora timings.",
    meta: "Daily · Free",
    accent: "gold",
  },
  {
    href: "/matchmaking",
    icon: "♡",
    title: "Matchmaking",
    body: "A simple compatibility preview using names and birth days.",
    meta: "Quick preview",
    accent: "iris",
  },
  {
    href: "/navagraha",
    icon: "☉",
    title: "Navagraha",
    body: "Your ruling graha with simple, practical remedies.",
    meta: "Planets",
    accent: "gold",
  },
  {
    href: "/consult",
    icon: "✧",
    title: "Consult astrologer",
    body: "Ask our team about astrology guidance on WhatsApp.",
    meta: "Experts",
    accent: "iris",
  },
] as const;

export default function OtherServices() {
  return (
    <section
      id="services"
      className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-16 sm:px-7"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-eyebrow text-gold-300">
            More from Jyotish One
          </p>
          <h2 className="mt-1.5 font-serif text-2xl text-ink-50 sm:text-3xl">
            Explore all services
          </h2>
        </div>
        <a
          href="https://wa.me/919008831075?text=Hi%2C%20I%20want%20to%20know%20more%20about%20your%20reports"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-ink-200 underline-offset-4 transition hover:text-gold-200 hover:underline"
        >
          Ask on WhatsApp →
        </a>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="card-hover group relative overflow-hidden rounded-[14px] border border-white/[0.08] bg-white/[0.03] p-4 hover:border-gold-300/40 hover:bg-white/[0.05]"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                aria-hidden="true"
                className={`text-xl ${
                  s.accent === "gold" ? "text-gold-300" : "text-iris-300"
                }`}
              >
                {s.icon}
              </span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-ink-200">
                {s.meta}
              </span>
            </div>
            <p className="mt-3 font-serif text-lg text-ink-50">{s.title}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-200">
              {s.body}
            </p>
            <p className="mt-3 text-xs font-semibold text-gold-300/90 transition group-hover:text-gold-200">
              Open →
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
