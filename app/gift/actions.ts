"use server";

import { headers } from "next/headers";
import { createContribution, attachCheckout } from "@/lib/fund";
import { createCheckoutSession, paymongoConfigured } from "@/lib/paymongo";

export type StartResult = { ok: true; checkoutUrl: string } | { ok: false; error: string };

const MIN = 20;
const MAX = 100000;

export async function startGift(
  amountPhp: number,
  name?: string,
  message?: string
): Promise<StartResult> {
  if (!paymongoConfigured()) return { ok: false, error: "Online gifting isn't set up yet." };
  const amount = Math.round(amountPhp);
  if (!Number.isFinite(amount) || amount < MIN) {
    return { ok: false, error: `Minimum gift is ₱${MIN}.` };
  }
  if (amount > MAX) return { ok: false, error: `Maximum is ₱${MAX.toLocaleString()}.` };

  try {
    const { id, reference } = await createContribution({ amountPhp: amount, name, message });

    const h = await headers();
    const host = h.get("host");
    const origin = `https://${host}`;

    const session = await createCheckoutSession({
      amountPhp: amount,
      description: "Monetary gift for Amari's Baptism 🎀",
      reference,
      successUrl: `${origin}/gift/thank-you?ref=${reference}`,
      cancelUrl: `${origin}/gift`,
    });
    await attachCheckout(id, session.id);
    return { ok: true, checkoutUrl: session.checkoutUrl };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
