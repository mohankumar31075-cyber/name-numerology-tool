import NameForm from "@/components/NameForm";
import ScrollToTopButton from "@/components/ScrollToTopButton";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-maroon-700 to-maroon-900 text-sm font-bold text-white">
              NN
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Name Numerology</p>
              <p className="text-xs text-maroon-700">Free Chaldean Analysis</p>
            </div>
          </div>
          <a
            href="#how-it-works"
            className="hidden text-sm font-medium text-gray-600 hover:text-maroon-800 sm:block"
          >
            How it works
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div className="order-2 lg:order-1">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-maroon-600">
            Free Numerology Calculator
          </p>
          <h1 className="mb-4 font-serif text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
            Check your Name for{" "}
            <span className="text-maroon-800">Free</span>
          </h1>
          <p className="mb-6 text-lg text-gray-600">
            Is your Name blocking your{" "}
            <span className="rounded bg-gold-400/90 px-1.5 py-0.5 font-semibold text-gray-900">
              Overnight Success?
            </span>
          </p>
          <p className="mb-8 text-base text-gray-600">
            Your Name Holds Power — Unlock It for{" "}
            <span className="rounded bg-gold-400/90 px-1.5 py-0.5 font-semibold text-gray-900">
              Wealth & Growth!
            </span>
          </p>

          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span>
              Name number matched with your birth number
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span>
              Instant Chaldean numerology analysis
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">✓</span>
              Clear compatibility score & guidance
            </li>
          </ul>
        </div>

        <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
          <NameForm />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-white py-8">
        <div className="mx-auto grid max-w-4xl grid-cols-3 gap-4 px-4 text-center">
          <div>
            <p className="text-2xl font-bold text-maroon-800 sm:text-3xl">Instant</p>
            <p className="text-xs text-gray-500 sm:text-sm">Free Analysis</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-maroon-800 sm:text-3xl">Chaldean</p>
            <p className="text-xs text-gray-500 sm:text-sm">Authentic Method</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-maroon-800 sm:text-3xl">Private</p>
            <p className="text-xs text-gray-500 sm:text-sm">No Data Stored</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <h2 className="mb-10 text-center font-serif text-3xl font-bold text-gray-900">
          How Name Analysis Works
        </h2>
        <div className="grid gap-8 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Enter Details",
              desc: "Share the name you use daily and your date of birth. Takes under 30 seconds.",
            },
            {
              step: "2",
              title: "Chaldean Calculation",
              desc: "We convert every letter using the traditional Chaldean chart and match it with your birth numbers.",
            },
            {
              step: "3",
              title: "Get Clarity",
              desc: "See your name number, compatibility score, and clear next steps — including full report option.",
            },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-maroon-100 text-lg font-bold text-maroon-800">
                {item.step}
              </div>
              <h3 className="mb-2 font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-maroon-900 py-12 text-center text-white">
        <h2 className="mb-3 font-serif text-2xl font-bold sm:text-3xl">
          Ready to discover what your name hides?
        </h2>
        <p className="mb-6 text-maroon-100">
          Free instant analysis. Detailed personalised report available afterwards.
        </p>
        <ScrollToTopButton>
          Check My Name Free →
        </ScrollToTopButton>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white py-8 text-center text-sm text-gray-500">
        <p>© {new Date().getFullYear()} Name Numerology Tool. For educational & guidance purposes.</p>
        <p className="mt-1 text-xs">
          Numerology is interpretive. Results are not a substitute for professional advice.
        </p>
      </footer>
    </div>
  );
}
