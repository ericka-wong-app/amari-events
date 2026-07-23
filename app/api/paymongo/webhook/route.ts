import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/paymongo";
import { getContributionByReference, markContributionPaid } from "@/lib/fund";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Real-time verification: PayMongo POSTs signed events here when a payment
// settles. We verify the signature, then mark the matching contribution paid.
export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("paymongo-signature");

  if (!verifyWebhookSignature(raw, sig)) {
    return NextResponse.json({ ok: false, error: "invalid signature" }, { status: 401 });
  }

  let event: {
    data?: { attributes?: { type?: string; data?: { attributes?: { reference_number?: string } } } };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: "bad json" }, { status: 400 });
  }

  const type = event.data?.attributes?.type;
  const reference = event.data?.attributes?.data?.attributes?.reference_number;

  if (type === "checkout_session.payment.paid" && reference) {
    try {
      const c = await getContributionByReference(reference);
      if (c && c.status !== "paid") await markContributionPaid(c.id);
    } catch {
      // acknowledge anyway; PayMongo retries on non-2xx
    }
  }

  // Always 200 so PayMongo doesn't keep retrying handled events.
  return NextResponse.json({ ok: true });
}
