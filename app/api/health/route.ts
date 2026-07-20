import { NextResponse } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Lightweight connectivity check: confirms env vars + DB + schema are reachable.
export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, stage: "env" }, { status: 503 });
  }
  try {
    const sb = supabaseAdmin();
    const { count, error } = await sb
      .from("guests")
      .select("*", { count: "exact", head: true });
    if (error) {
      return NextResponse.json({ ok: false, stage: "query", error: error.message }, { status: 500 });
    }
    // best-effort: null means the contributions table hasn't been created yet
    const c = await sb.from("contributions").select("*", { count: "exact", head: true });
    const contributions = c.error ? null : c.count ?? 0;
    return NextResponse.json({ ok: true, guests: count ?? 0, contributions });
  } catch (e) {
    return NextResponse.json({ ok: false, stage: "init", error: (e as Error).message }, { status: 500 });
  }
}
