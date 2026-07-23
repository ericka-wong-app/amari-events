import { signPayload, verifyPayload } from "./crypto";

// A shareable invite link carries a signed member id so the recipient can go
// straight to setting their PIN — no name search needed. Signed so links can't
// be forged or enumerated.
function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET is not configured.");
  return s;
}

export function makeInviteToken(memberId: string): string {
  return signPayload({ inv: memberId }, secret());
}

export function readInviteToken(token: string | null | undefined): string | null {
  return verifyPayload<{ inv: string }>(token, secret())?.inv ?? null;
}
