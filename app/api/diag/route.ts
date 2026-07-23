import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORARY: read recent contributions to confirm a payment registered.
// Guarded. Remove after debugging.
export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get("key") !== process.env.QR_SIGNING_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("contributions")
    .select("amount_php, name, message, status, checkout_id, created_at, paid_at")
    .order("created_at", { ascending: false })
    .limit(8);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  const paidTotal = (data ?? [])
    .filter((c) => c.status === "paid")
    .reduce((s, c) => s + (c.amount_php ?? 0), 0);

  return NextResponse.json({
    ok: true,
    webhookConfigured: Boolean(process.env.PAYMONGO_WEBHOOK_SECRET),
    count: data?.length ?? 0,
    paidTotal,
    contributions: data,
  });
}
