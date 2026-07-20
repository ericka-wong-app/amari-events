import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORARY: seeds one demo guest so the RSVP flow can be tried before the
// admin exists. Guarded by QR_SIGNING_SECRET. Remove once admin is live.
export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!key || key !== process.env.QR_SIGNING_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const sb = supabaseAdmin();

  const { data: existing } = await sb
    .from("guests")
    .select("id")
    .eq("display_name", "Demo Guest")
    .maybeSingle();
  if (existing) return NextResponse.json({ ok: true, note: "already seeded", id: existing.id });

  const { data: group } = await sb
    .from("groups")
    .insert({ name: "Wong Family (Demo)" })
    .select("id")
    .single();

  const { data: guest, error } = await sb
    .from("guests")
    .insert({
      group_id: group?.id ?? null,
      display_name: "Demo Guest",
      alt_names: ["Demo", "Test", "Tita Demo"],
      max_pax: 3,
      table_number: "1",
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, id: guest?.id, search: "Demo" });
}
