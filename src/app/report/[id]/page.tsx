import Link from "next/link";
import { notFound } from "next/navigation";
import ReportView from "@/components/report/ReportView";
import { languageName } from "@/lib/premium";
import { getOrder, supabaseConfigured } from "@/lib/supabaseRest";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your report",
  robots: { index: false, follow: false },
};

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!/^[0-9a-fA-F-]{36}$/.test(id) || !supabaseConfigured()) {
    notFound();
  }

  const found = await getOrder(id);
  const order = found.ok ? found.data?.[0] : null;
  if (!order) notFound();

  const paid = order.payment_status === "paid";

  return (
    <main className="min-h-screen pb-20">
      <div className="mx-auto max-w-3xl px-5 pt-8 sm:px-7">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
          <Link href="/" className="text-xs text-ink-300 transition hover:text-gold-200">
            ← Jyotish One
          </Link>
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
              paid
                ? "bg-mint-400/15 text-mint-400"
                : "bg-gold-300/15 text-gold-200"
            }`}
          >
            {paid ? "Paid · unlocked" : `Payment ${order.payment_status}`}
          </span>
        </div>

        <div className="mt-5 rounded-[18px] border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-eyebrow text-gold-300">
            {order.report_type} report
          </p>
          <h1 className="mt-1.5 font-serif text-2xl text-ink-50 sm:text-3xl">
            {order.full_name}
          </h1>
          <p className="mt-1 text-xs text-ink-200">
            {order.birth_date ? `Born ${order.birth_date}` : "Daily reading"}
            {order.birth_time ? ` · ${order.birth_time.slice(0, 5)}` : ""}
            {order.birth_place ? ` · ${order.birth_place}` : ""}
            {` · ${languageName(order.language)}`}
          </p>
          {order.coupon_code && (
            <p className="mt-1 text-[11px] text-ink-300">
              Coupon applied: {order.coupon_code}
            </p>
          )}
        </div>

        <ReportView
          orderId={order.id}
          paid={paid}
          reportType={order.report_type}
          reference={order.id.slice(0, 8).toUpperCase()}
          languageLabel={languageName(order.language)}
        />
      </div>
    </main>
  );
}
