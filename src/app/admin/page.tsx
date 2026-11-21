"use client";

import { useCallback, useEffect, useState } from "react";

type AdminOrder = {
  id: string;
  reportType: string;
  fullName: string;
  birthDate: string | null;
  languageLabel: string;
  paymentStatus: string;
  paymentReference: string | null;
  amount: number;
  createdAt: string;
};

/**
 * Owner-only payment queue.
 *
 * Customers pay by UPI / bank transfer, tell us the transaction reference from
 * their report page, and we mark the order paid here after checking our own
 * account. There is no public link to this page and no way in without the
 * ADMIN_TOKEN set in the Vercel environment.
 */
export default function AdminPage() {
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const saved = window.sessionStorage.getItem("adminToken");
    if (saved) setToken(saved);
    fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "admin-enabled" }),
    })
      .then((r) => r.json())
      .then((d) => setEnabled(Boolean(d?.enabled)))
      .catch(() => setEnabled(null));
  }, []);

  const load = useCallback(async (value: string) => {
    setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "admin-list", adminToken: value }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not load orders.");
        setOrders(null);
        return;
      }
      setOrders(data.orders as AdminOrder[]);
      window.sessionStorage.setItem("adminToken", value);
    } catch {
      setError("Network error while loading orders.");
    }
  }, []);

  useEffect(() => {
    if (token) void load(token);
  }, [token, load]);

  async function unlock(orderId: string) {
    setBusyId(orderId);
    setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "unlock", orderId, adminToken: token }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Could not unlock that order.");
        return;
      }
      await load(token);
    } catch {
      setError("Network error while unlocking.");
    } finally {
      setBusyId("");
    }
  }

  const pending = (orders ?? []).filter((o) => o.paymentStatus !== "paid");

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10">
      <h1 className="font-serif text-2xl font-bold text-ink-50">Payment queue</h1>
      <p className="mt-1 text-sm text-ink-300">
        Check the payment in your bank or UPI app, then unlock the report. The
        customer&apos;s page updates on its own within 20 seconds.
      </p>

      {enabled === false && (
        <p className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          ADMIN_TOKEN is not set on this deployment, so unlocking is disabled.
          Add it to the Vercel environment variables and redeploy.
        </p>
      )}

      <div className="mt-5 flex gap-2">
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value.trim())}
          placeholder="Admin token"
          aria-label="Admin token"
          className="flex-1 rounded-[10px] border border-ink-500 bg-[#10121f] px-3.5 py-2.5 text-sm text-ink-50 outline-none focus:border-gold-300"
        />
        <button
          type="button"
          onClick={() => void load(token)}
          disabled={!token}
          className="rounded-[10px] bg-gold-cta px-4 text-sm font-bold text-[#20180e] disabled:opacity-60"
        >
          Load
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

      {orders && (
        <p className="mt-5 text-xs uppercase tracking-widest text-ink-400">
          {pending.length} waiting · {orders.length} total
        </p>
      )}

      <div className="mt-3 space-y-3">
        {(orders ?? []).map((order) => {
          const paid = order.paymentStatus === "paid";
          return (
            <div
              key={order.id}
              className="rounded-[16px] border border-white/10 bg-white/[0.03] px-4 py-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-ink-50">
                  {order.fullName}
                  <span className="ml-2 text-xs font-normal text-ink-300">
                    {order.reportType} · {order.languageLabel}
                  </span>
                </p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    paid
                      ? "bg-mint-400/15 text-mint-400"
                      : "bg-gold-300/15 text-gold-200"
                  }`}
                >
                  {paid ? "Unlocked" : "Awaiting payment"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-ink-400">
                Ref {order.id.slice(0, 8).toUpperCase()} · ₹{order.amount}
                {order.birthDate ? ` · ${order.birthDate}` : ""}
              </p>
              {order.paymentReference && (
                <p className="mt-1 text-[12px] text-ink-200">
                  Their reference:{" "}
                  <strong className="text-gold-200">{order.paymentReference}</strong>
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                <a
                  href={`/report/${order.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[9px] border border-white/15 px-3 py-1.5 text-xs text-ink-100 hover:border-white/30"
                >
                  View report
                </a>
                {!paid && (
                  <button
                    type="button"
                    onClick={() => void unlock(order.id)}
                    disabled={busyId === order.id || !token}
                    className="rounded-[9px] bg-gold-cta px-3 py-1.5 text-xs font-bold text-[#20180e] disabled:opacity-60"
                  >
                    {busyId === order.id ? "Unlocking…" : "Payment received — unlock"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {orders && orders.length === 0 && (
        <p className="mt-6 text-sm text-ink-300">No orders yet.</p>
      )}
    </main>
  );
}
