import { cookies } from "next/headers";
import { signPayload, verifyPayload } from "./crypto";

const COOKIE = "amari_guest";
const MAX_AGE = 60 * 60 * 24 * 60; // 60 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not configured.");
  return s;
}

export async function createGuestSession(guestId: string): Promise<void> {
  const token = signPayload({ gid: guestId, iat: Date.now() }, secret());
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getGuestSession(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  const payload = verifyPayload<{ gid: string }>(token, secret());
  return payload?.gid ?? null;
}

export async function clearGuestSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
