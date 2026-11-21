/**
 * Minimal Supabase REST client for server routes.
 *
 * Uses the service-role (server) key when present so writes bypass RLS, and
 * falls back to the publishable key so the app still works while the project
 * is being configured. The publishable key is safe to expose; the service key
 * must only ever live in server env vars (never NEXT_PUBLIC_*).
 */

const SUPABASE_URL = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  ""
).replace(/\/+$/, "");

const SERVER_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  "";

const PUBLIC_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export function supabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && (SERVER_KEY || PUBLIC_KEY));
}

export function supabaseUsesServerKey(): boolean {
  return Boolean(SUPABASE_URL && SERVER_KEY);
}

export type RestResult<T> = { ok: true; data: T } | { ok: false; error: string };

async function rest<T>(
  path: string,
  init: RequestInit = {}
): Promise<RestResult<T>> {
  if (!supabaseConfigured()) {
    return { ok: false, error: "Supabase is not configured" };
  }
  const key = SERVER_KEY || PUBLIC_KEY;
  const headers = new Headers(init.headers);
  headers.set("apikey", key);
  headers.set("Authorization", `Bearer ${key}`);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!headers.has("Prefer")) headers.set("Prefer", "return=representation");

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const message =
        (body && (body.message || body.hint || body.error)) ||
        `Supabase HTTP ${res.status}`;
      return { ok: false, error: String(message) };
    }
    return { ok: true, data: body as T };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Supabase request failed",
    };
  }
}

export type ReportOrderRow = {
  id: string;
  report_type: "horoscope" | "numerology" | "panchang";
  full_name: string;
  birth_date: string | null;
  birth_time: string | null;
  birth_place: string | null;
  language: string;
  gender: string | null;
  contact_email: string | null;
  whatsapp_number: string | null;
  payment_status: "preview" | "pending" | "paid" | "refunded" | "failed";
  coupon_code: string | null;
  name_number: number | null;
  life_path: number | null;
  psychic_number: number | null;
  source: string;
  payment_reference: string | null;
  consented_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CouponRow = {
  code: string;
  label: string;
  discount_percent: number;
  expires_at: string;
  active: boolean;
};

export async function insertLead(
  row: Partial<ReportOrderRow>
): Promise<RestResult<ReportOrderRow[]>> {
  return rest<ReportOrderRow[]>("report_orders", {
    method: "POST",
    body: JSON.stringify(row),
  });
}

export async function insertOrder(
  row: Partial<ReportOrderRow>
): Promise<RestResult<ReportOrderRow[]>> {
  return insertLead(row);
}

/** Newest first, for the owner's payment queue. */
export async function listOrders(limit = 80): Promise<RestResult<ReportOrderRow[]>> {
  return rest<ReportOrderRow[]>(
    `report_orders?select=*&order=created_at.desc&limit=${limit}`
  );
}

export async function getOrder(
  id: string
): Promise<RestResult<ReportOrderRow[]>> {
  const safe = encodeURIComponent(id);
  return rest<ReportOrderRow[]>(
    `report_orders?id=eq.${safe}&select=*&limit=1`
  );
}

export async function updateOrder(
  id: string,
  patch: Partial<ReportOrderRow>
): Promise<RestResult<ReportOrderRow[]>> {
  const safe = encodeURIComponent(id);
  return rest<ReportOrderRow[]>(`report_orders?id=eq.${safe}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function getCoupon(
  code: string
): Promise<RestResult<CouponRow[]>> {
  const safe = encodeURIComponent(code.toUpperCase());
  return rest<CouponRow[]>(
    `coupons?code=eq.${safe}&active=is.true&select=*&limit=1`
  );
}

/** Coupons expire; only return one that is still usable right now. */
/** Stand-in for a payment gateway: the rate is enforced server-side. */
export async function findActiveCoupon(code: string): Promise<CouponRow | null> {
  if (!code) return null;
  const result = await getCoupon(code);
  if (!result.ok || !result.data?.length) return null;
  const coupon = result.data[0];
  if (!coupon.active) return null;
  if (new Date(coupon.expires_at).getTime() < Date.now()) return null;
  return coupon;
}
