import NameForm from "@/components/NameForm";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div className="order-2 lg:order-1">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-brand-600">
            Free Numerology Calculator
          </p>
          <h1 className="mb-4 font-serif text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Check your Name for <span className="text-brand-800">Free</span>
          </h1>
          <p className="mb-6 text-lg text-gray-600">
            Is your Name blocking your <span className="rounded bg-accent-400/30 px-1.5 font-semibold text-gray-900">Overnight Success?</span>
          </p>
          <p className="mb-6 text-gray-600">
            Your Name Holds Power — Unlock It for <span className="rounded bg-accent-400/30 px-1.5 font-semibold text-gray-900">Wealth & Growth!</span>
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center gap-2"><span className="text-brand-600">✓</span> Name number matched with your birth number</li>
            <li className="flex items-center gap-2"><span className="text-brand-600">✓</span> Instant Chaldean numerology analysis</li>
            <li className="flex items-center gap-2"><span className="text-brand-600">✓</span> Clear compatibility score & guidance</li>
          </ul>
        </div>
        <div className="order-1 lg:order-2">
          <NameForm />
        </div>
      </section>

      <section className="border-t border-brand-100 bg-white/60 py-12">
        <div className="mx-auto grid max-w-4xl gap-6 px-4 text-center sm:grid-cols-3">
          <div>
            <p className="font-serif text-xl font-bold text-brand-800">Instant</p>
            <p className="text-sm text-gray-500">Free Analysis</p>
          </div>
          <div>
            <p className="font-serif text-xl font-bold text-brand-800">Chaldean</p>
            <p className="text-sm text-gray-500">Authentic Method</p>
          </div>
          <div>
            <p className="font-serif text-xl font-bold text-brand-800">Private</p>
            <p className="text-sm text-gray-500">No Data Stored</p>
          </div>
        </div>
      </section>

      <section className="border-t border-brand-100 bg-white/80 py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center font-serif text-2xl font-bold text-gray-900">Our tools</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <a href="/" className="rounded-2xl border-2 border-brand-200 bg-brand-50 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Active</p>
              <p className="mt-1 font-serif text-xl font-bold text-gray-900">Name Numerology</p>
              <p className="mt-1 text-sm text-gray-600">Chaldean name check, core numbers & corrected spellings.</p>
            </a>
            <a href="/navagraha" className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand-300">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">New</p>
              <p className="mt-1 font-serif text-xl font-bold text-gray-900">Navagraha</p>
              <p className="mt-1 text-sm text-gray-600">Nine planets, ruling graha from birth day & remedies.</p>
            </a>
          </div>
        </div>
      </section>

      <ScrollToTopButton />
    </div>
  );
}
