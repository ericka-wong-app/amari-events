import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORARY diagnostic: runs the exact contribution insert and reports the raw
// result so we can see why writes fail while reads succeed. Guarded. Remove after.
export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get("key") !== process.env.QR_SIGNING_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const sb = supabaseAdmin();
  const urlMasked = (process.env.SUPABASE_URL ?? "").replace(/^https:\/\/([a-z0-9]{6}).*/, "https://$1…");

  const sel = await sb.from("contributions").select("*", { count: "exact", head: true });
  const ins = await sb
    .from("contributions")
    .insert({ amount_php: 1, reference: `diag-${Date.now()}`, status: "pending" })
    .select("id")
    .maybeSingle();

  let deleted = false;
  if (ins.data?.id) {
    const del = await sb.from("contributions").delete().eq("id", ins.data.id);
    deleted = !del.error;
  }

  return NextResponse.json({
    supabaseUrl: urlMasked,
    select: { error: sel.error?.message ?? null, count: sel.count ?? null },
    insert: { error: ins.error?.message ?? null, id: ins.data?.id ?? null, deleted },
  });
}
