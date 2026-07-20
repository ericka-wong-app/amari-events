import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORARY: seeds the host's raw guest list (ungrouped) so the RSVP works
// before the admin exists. Idempotent by name. Guarded by QR_SIGNING_SECRET.
// Remove once the admin can add/import guests.
const GUESTS = [
  "Lola V",
  "Rhoda",
  "Lolo Ricky",
  "Tito Ton",
  "Tito Gelo",
  "Tita Dana",
  "Ooma",
  "Apoko",
  "Angkol",
  "Auntie",
  "Kuya Paw",
  "Lonching",
];

export async function GET(req: Request) {
  const key = new URL(req.url).searchParams.get("key");
  if (!key || key !== process.env.QR_SIGNING_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const sb = supabaseAdmin();

  const { data: existing } = await sb.from("guests").select("display_name");
  const have = new Set((existing ?? []).map((g) => g.display_name));
  const toAdd = GUESTS.filter((n) => !have.has(n)).map((n) => ({
    display_name: n,
    max_pax: 1,
  }));

  if (toAdd.length === 0) {
    return NextResponse.json({ ok: true, added: 0, note: "all present" });
  }
  const { error } = await sb.from("guests").insert(toAdd);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, added: toAdd.length });
}
