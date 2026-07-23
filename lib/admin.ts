import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signPayload, verifyPayload, verifySecret, hashSecret } from "./crypto";
import { supabaseAdmin } from "./supabase";

const COOKIE = "amari_admin";
const MAX_AGE = 60 * 60 * 12; // 12h

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not configured.");
  return s;
}

// Admin credentials live (hashed) in the `admins` table. Login matches the
// username case-insensitively and verifies the password against its hash.
export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  const u = username.trim();
  if (!u || !password) return false;
  const sb = supabaseAdmin();
  const { data } = await sb.from("admins").select("password_hash").ilike("username", u).maybeSingle();
  return verifySecret(password, data?.password_hash);
}

export async function createAdminSession(): Promise<void> {
  const token = signPayload({ admin: true, iat: Date.now() }, secret());
  const store = await cookies();
  store.set(COOKIE, token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: MAX_AGE });
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const payload = verifyPayload<{ admin?: boolean }>(store.get(COOKIE)?.value, secret());
  return payload?.admin === true;
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

// --- Co-admins (the host can invite the father / another ninang to help) ---
export type AdminUser = { id: string; username: string; role: string | null; createdAt: string };

export async function listAdmins(): Promise<AdminUser[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("admins").select("id, username, role, created_at").order("created_at");
  if (error) throw new Error(error.message);
  return ((data ?? []) as { id: string; username: string; role: string | null; created_at: string }[]).map((r) => ({
    id: r.id,
    username: r.username,
    role: r.role,
    createdAt: r.created_at,
  }));
}

export async function addAdmin(username: string, password: string, role: string): Promise<void> {
  const u = username.trim();
  if (!u) throw new Error("Username (email) is required.");
  if (password.length < 6) throw new Error("Password must be at least 6 characters.");
  const sb = supabaseAdmin();
  const { data: existing } = await sb.from("admins").select("id").ilike("username", u).maybeSingle();
  if (existing) throw new Error("An admin with that username already exists.");
  const { error } = await sb.from("admins").insert({
    username: u,
    password_hash: hashSecret(password),
    role: role.trim() || null,
  });
  if (error) throw new Error(error.message);
}

export async function removeAdmin(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { count } = await sb.from("admins").select("id", { count: "exact", head: true });
  if ((count ?? 0) <= 1) throw new Error("You can't remove the last admin.");
  const { error } = await sb.from("admins").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
