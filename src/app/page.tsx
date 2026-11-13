import NameForm from "@/components/NameForm";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-16">
        <div className="order-2 lg:order-1">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-600">
            Free Numerology Calculator
          </p>
          <h1 className="mb-4 font-serif text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Check your Name for <span className="text-brand-800">Free</span>
          </h1>
          <p className="mb-6 text-lg text-gray-600">
            Is your Name blocking your{" "}
            <span className="rounded bg-accent-400/30 px-1.5 font-semibold text-gray-900">Overnight Success?</span>
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2"><span className="text-brand-600">✓</span> Name number matched with birth number</li>
            <li className="flex items-center gap-2"><span className="text-brand-600">✓</span> Instant Chaldean analysis</li>
            <li className="flex items-center gap-2"><span className="text-brand-600">✓</span> Corrected spellings via WhatsApp</li>
          </ul>
        </div>
        <div className="order-1 lg:order-2">
          <NameForm />
        </div>
      </section>

      <section className="border-t border-brand-100 bg-white/80 py-12">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-6 text-center font-serif text-2xl font-bold text-gray-900">All services</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <a href="/" className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Free tool</p>
              <p className="mt-1 font-serif text-xl font-bold text-gray-900">Name Numerology</p>
              <p className="mt-1 text-sm text-gray-600">Chaldean name check & corrected spellings.</p>
            </a>
            <a href="/navagraha" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-brand-300">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Planets</p>
              <p className="mt-1 font-serif text-xl font-bold text-gray-900">Navagraha</p>
              <p className="mt-1 text-sm text-gray-600">Ruling graha & simple remedies.</p>
            </a>
            <a href="/matchmaking" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-brand-300">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Marriage</p>
              <p className="mt-1 font-serif text-xl font-bold text-gray-900">Matchmaking</p>
              <p className="mt-1 text-sm text-gray-600">Kundli Milan style compatibility.</p>
            </a>
            <a href="/horoscope" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-brand-300">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Daily</p>
              <p className="mt-1 font-serif text-xl font-bold text-gray-900">Horoscope</p>
              <p className="mt-1 text-sm text-gray-600">Sun-sign daily guidance.</p>
            </a>
            <a href="/consult" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:border-brand-300 sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Experts</p>
              <p className="mt-1 font-serif text-xl font-bold text-gray-900">Consult Astrologer</p>
              <p className="mt-1 text-sm text-gray-600">Chat with experts on WhatsApp.</p>
            </a>
          </div>
        </div>
      </section>

      <ScrollToTopButton />
    </div>
  );
}
