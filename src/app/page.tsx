import HomeExperience from "@/components/home/HomeExperience";
import OtherServices from "@/components/home/OtherServices";
import { whatsappUrl } from "@/lib/site";

const FEATURES = [
  {
    icon: "✧",
    title: "Useful, not overwhelming",
    body: "Clear sections turn complex chart details into an easy-to-read personal report.",
  },
  {
    icon: "⌁",
    title: "Built around your details",
    body: "Birth date, time and location power your chart. Full horoscope reports are currently in English.",
  },
  {
    icon: "⇩",
    title: "Delivered your way",
    body: "Preview on screen, then open your report page and download the PDF.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Pick a reading",
    body: "Birth horoscope, name numerology or today's panchang.",
  },
  {
    n: "02",
    title: "Add your details",
    body: "Name, birth date, time and place. Nothing is shared publicly.",
  },
  {
    n: "03",
    title: "Read your free preview",
    body: "Real numbers from the Chaldean and panchang engines, instantly.",
  },
  {
    n: "04",
    title: "Unlock the full report",
    body: "View your report online and download its PDF.",
  },
];

export default function HomePage() {
  return (
    <main>
      <HomeExperience />

      <section id="how" className="scroll-mt-24 px-5 pb-16 sm:px-7">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-serif text-2xl text-ink-50 sm:text-[2rem]">
            Ancient systems. One clear experience.
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-ink-200">
            Start with a quick preview; choose when you&apos;re ready for the
            full report.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-[14px] border border-ink-500/70 bg-white/[0.03] p-5"
              >
                <span aria-hidden="true" className="text-lg text-gold-300">
                  {f.icon}
                </span>
                <p className="mt-2 font-semibold text-ink-50">{f.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-200">
                  {f.body}
                </p>
              </div>
            ))}
          </div>

          <ol className="mt-4 grid gap-3 rounded-[14px] border border-ink-500/70 bg-white/[0.02] p-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-3">
                <span className="font-serif text-lg text-gold-300/80">
                  {s.n}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-50">{s.title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-ink-200">
                    {s.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <OtherServices />

      <section className="px-5 pb-16 sm:px-7">
        <div className="mx-auto max-w-4xl rounded-[18px] border border-gold-300/25 bg-gradient-to-br from-gold-300/[0.08] to-transparent px-6 py-8 text-center">
          <p className="text-[11px] font-bold uppercase tracking-eyebrow text-gold-300">
            Prefer to talk first?
          </p>
          <h2 className="mt-2 font-serif text-2xl text-ink-50 sm:text-3xl">
            Ask your question on WhatsApp
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-ink-200">
            Share your name and birth details once and our team will guide you
            to the right reading — in your language.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <a
              href={whatsappUrl(
                "Hi, I'd like help choosing a report on Jyotish One."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-[11px] bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-500"
            >
              Chat on WhatsApp
            </a>
            <a
              href="#form"
              className="rounded-[11px] border border-white/15 px-5 py-2.5 text-sm font-semibold text-ink-50 transition hover:border-gold-300/60 hover:text-gold-200"
            >
              Start free preview
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-5 py-6 text-[12px] text-ink-300 sm:px-7">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>
            ✦ Jyotish One · A personal guide to traditional astrology and
            numerology.
          </span>
          <span>
            For reflection and cultural interest; not professional, medical,
            legal, or financial advice.
          </span>
        </div>
      </footer>
    </main>
  );
}
