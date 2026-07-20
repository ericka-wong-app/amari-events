import QRCode from "qrcode";
import { signPayload, verifyPayload } from "./crypto";

function secret(): string {
  const s = process.env.QR_SIGNING_SECRET;
  if (!s) throw new Error("QR_SIGNING_SECRET is not configured.");
  return s;
}

// A guest's QR encodes a signed token so it can't be forged at the door.
export function guestPassToken(guestId: string): string {
  return signPayload({ gid: guestId }, secret());
}

export function verifyGuestPassToken(token: string): string | null {
  const payload = verifyPayload<{ gid: string }>(token, secret());
  return payload?.gid ?? null;
}

export async function passQrDataUrl(guestId: string): Promise<string> {
  const token = guestPassToken(guestId);
  return QRCode.toDataURL(`AMARI:${token}`, {
    margin: 1,
    width: 320,
    color: { dark: "#5b4a4d", light: "#ffffff" },
  });
}
