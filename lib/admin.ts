import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signPayload, verifyPayload, verifySecret } from "./crypto";
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
