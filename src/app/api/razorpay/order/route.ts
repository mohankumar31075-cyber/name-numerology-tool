import { NextRequest, NextResponse } from "next/server";

/**
 * Create Razorpay order.
 * Set env: RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
 * Without keys, returns demo mode so free coupons still work on client.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const name = String(body.name || "Customer");
    const contact = String(body.contact || "");
    const email = String(body.email || "");

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({
        demo: true,
        message: "Razorpay keys not configured. Use coupon FREE100 for free unlock, or add RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET in Vercel env.",
        keyId: keyId || null,
      });
    }

    const amountPaise = Math.round(amount * 100);
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt: `name_${Date.now()}`,
        notes: { customer_name: name, contact, email },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.error?.description || "Order failed" }, { status: 400 });
    }

    return NextResponse.json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
