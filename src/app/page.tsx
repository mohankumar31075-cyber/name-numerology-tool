import NameForm from "@/components/NameForm";
import ScrollToTopButton from "@/components/ScrollToTopButton";
import SiteHeader from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

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

      <ScrollToTopButton />
    </div>
  );
}
