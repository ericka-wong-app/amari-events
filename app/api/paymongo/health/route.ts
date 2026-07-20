import { NextResponse } from "next/server";
import { paymongoConfigured, createCheckoutSession } from "@/lib/paymongo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Verifies the PayMongo secret key works by creating a throwaway checkout
// session (creating a session does NOT charge anyone). Guarded.
export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("key") !== process.env.QR_SIGNING_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!paymongoConfigured()) {
    return NextResponse.json({ ok: false, stage: "env" }, { status: 503 });
  }
  try {
    const origin = url.origin;
    const s = await createCheckoutSession({
      amountPhp: 20,
      description: "PayMongo connectivity test (not a real charge)",
      reference: `healthcheck-${Date.now()}`,
      successUrl: `${origin}/gift/thank-you`,
      cancelUrl: `${origin}/`,
    });
    return NextResponse.json({ ok: true, sessionId: s.id, hasCheckoutUrl: Boolean(s.checkoutUrl) });
  } catch (e) {
    return NextResponse.json({ ok: false, stage: "api", error: (e as Error).message }, { status: 500 });
  }
}
