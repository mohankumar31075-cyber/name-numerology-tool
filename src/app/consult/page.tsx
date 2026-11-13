"use client";

const WA = "919008831075";

const ASTROLOGERS = [
  { name: "Astro Ravi", exp: 12, skills: "Vedic · Name · Career", rate: 9, rating: 4.9, langs: "Hindi, English" },
  { name: "Astro Priya", exp: 8, skills: "Matchmaking · Love", rate: 7, rating: 4.8, langs: "Hindi, English" },
  { name: "Astro Mohan", exp: 15, skills: "Navagraha · Remedies", rate: 11, rating: 5.0, langs: "Hindi, Tamil" },
  { name: "Astro Sunita", exp: 10, skills: "Numerology · Lal Kitab", rate: 8, rating: 4.7, langs: "Hindi, English" },
  { name: "Astro Ankit", exp: 6, skills: "Horoscope · Tarot", rate: 6, rating: 4.6, langs: "Hindi, English" },
  { name: "Astro Kavya", exp: 9, skills: "Vastu · Marriage", rate: 10, rating: 4.9, langs: "Hindi, Telugu" },
];

export default function ConsultPage() {
  function wa(name: string) {
    const msg = encodeURIComponent(
      `Hi, I want to consult with ${name} on Astro Services.\nPlease share available time and payment QR / UPI link.`
    );
    return `https://wa.me/${WA}?text=${msg}`;
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Talk to experts</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-gray-900">Consult an Astrologer</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-600">
            Choose an expert. Chat starts on WhatsApp — we send payment QR / UPI after you message.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ASTROLOGERS.map((a) => (
            <div key={a.name} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-800">
                  {a.name.split(" ").pop()?.[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{a.name}</p>
                    <span className="h-2 w-2 rounded-full bg-green-500" title="Online" />
                  </div>
                  <p className="text-xs text-gray-500">Exp. {a.exp} years · {a.langs}</p>
                  <p className="mt-1 text-xs text-brand-700">{a.skills}</p>
                  <p className="mt-1 text-sm font-semibold text-amber-600">★ {a.rating}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <p className="text-sm text-gray-600">
                  from <span className="font-bold text-gray-900">₹{a.rate * 10}</span>
                </p>
                <a href={wa(a.name)} target="_blank" rel="noopener noreferrer" className="rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-green-700">
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
