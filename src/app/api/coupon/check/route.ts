import { NextRequest, NextResponse } from "next/server";
import { resolveCoupon } from "@/lib/supabaseRest";

export const runtime = "nodejs";
export const maxDuration = 20;

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

  const lookup = await resolveCoupon(code);

  /* A database hiccup is not the customer's mistake. Say so, and let the UI
     invite another try instead of claiming the code is dead. */
  if (lookup.status === "error") {
    return NextResponse.json(
      {
        ok: false,
        valid: false,
        retry: true,
        error: "We could not check that code just now. Please try again.",
      },
      { status: 200 }
    );
  }

  if (lookup.status === "invalid") {
    return NextResponse.json(
      {
        ok: false,
        valid: false,
        reason: lookup.reason,
        error:
          lookup.reason === "expired"
            ? "That code has expired."
            : "That code is not valid or has expired.",
      },
      { status: 200 }
    );
  }

  return NextResponse.json({
    ok: true,
    valid: true,
    coupon: {
      code: lookup.coupon.code,
      label: lookup.coupon.label,
      discountPercent: lookup.coupon.discount_percent,
      expiresAt: lookup.coupon.expires_at,
    },
  });
}
