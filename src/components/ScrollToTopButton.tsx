"use client";

export default function ScrollToTopButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-maroon-900 shadow-lg transition hover:bg-maroon-50"
    >
      {children}
    </button>
  );
}
