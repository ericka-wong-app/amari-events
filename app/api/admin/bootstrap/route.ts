import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashSecret } from "@/lib/crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TEMPORARY: creates/updates an admin account (password hashed at rest).
// Guarded by QR_SIGNING_SECRET; called once to set up the host's login.
// POST body: { key, username, password }. Remove after use.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    key?: string;
    username?: string;
    password?: string;
  };
  if (body.key !== process.env.QR_SIGNING_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const username = (body.username ?? "").trim();
  const password = body.password ?? "";
  if (!username || password.length < 4) {
    return NextResponse.json({ ok: false, error: "username + password (min 4) required" }, { status: 400 });
  }

  const sb = supabaseAdmin();
  const { error } = await sb
    .from("admins")
    .upsert({ username, password_hash: hashSecret(password) }, { onConflict: "username" });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, username });
}
