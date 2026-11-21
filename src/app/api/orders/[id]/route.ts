import { NextRequest, NextResponse } from "next/server";
import { getOrder, supabaseConfigured } from "@/lib/supabaseRest";

export const runtime = "nodejs";

/** GET /api/orders/[id] — public status for the customer's own order link. */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!/^[0-9a-fA-F-]{36}$/.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid order id" }, { status: 400 });
  }
  if (!supabaseConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Orders are not configured yet." },
      { status: 503 }
    );
  }

  const found = await getOrder(id);
  if (!found.ok) {
    return NextResponse.json({ ok: false, error: found.error }, { status: 500 });
  }
  const order = found.data?.[0];
  if (!order) {
    return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    order: {
      id: order.id,
      reportType: order.report_type,
      fullName: order.full_name,
      birthDate: order.birth_date,
      birthPlace: order.birth_place,
      language: order.language,
      paymentStatus: order.payment_status,
      couponCode: order.coupon_code,
      createdAt: order.created_at,
    },
  });
}
