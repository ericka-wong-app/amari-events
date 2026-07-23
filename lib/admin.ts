import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { timingSafeEqual } from "crypto";
import { signPayload, verifyPayload } from "./crypto";

const COOKIE = "amari_admin";
const MAX_AGE = 60 * 60 * 12; // 12h

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not configured.");
  return s;
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD);
}

function safeEq(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function verifyAdminCreds(username: string, password: string): boolean {
  const U = process.env.ADMIN_USERNAME ?? "";
  const P = process.env.ADMIN_PASSWORD ?? "";
  if (!U || !P) return false;
  // evaluate both to keep timing steady
  const u = safeEq(username, U);
  const p = safeEq(password, P);
  return u && p;
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
