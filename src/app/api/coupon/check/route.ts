import { NextRequest, NextResponse } from "next/server";
import { findActiveCoupon } from "@/lib/supabaseRest";

export const runtime = "nodejs";

/**
 * Guest-safe coupon validation. Never returns the list of coupons — only
 * whether the single code the customer typed is currently usable.
 */
export async function POST(req: NextRequest) {
  let body: { code?: string };
  try {
    body = (await req.json()) as { code?: string };
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const code = String(body.code ?? "").trim().toUpperCase().slice(0, 32);
  if (!code) {
    return NextResponse.json({ ok: false, error: "Enter a coupon code." }, { status: 400 });
  }

  const coupon = await findActiveCoupon(code);
  if (!coupon) {
    return NextResponse.json(
      { ok: false, valid: false, error: "That code is not valid or has expired." },
      { status: 200 }
    );
  }

  return NextResponse.json({
    ok: true,
    valid: true,
    coupon: {
      code: coupon.code,
      label: coupon.label,
      discountPercent: coupon.discount_percent,
      expiresAt: coupon.expires_at,
    },
  });
}
