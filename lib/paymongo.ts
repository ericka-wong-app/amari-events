import { createHmac, timingSafeEqual } from "crypto";

const BASE = "https://api.paymongo.com/v1";

export function paymongoConfigured(): boolean {
  return Boolean(process.env.PAYMONGO_SECRET_KEY);
}

function authHeader(): string {
  const key = process.env.PAYMONGO_SECRET_KEY;
  if (!key) throw new Error("PAYMONGO_SECRET_KEY is not configured.");
  // PayMongo uses HTTP Basic auth: secret key as username, empty password.
  return "Basic " + Buffer.from(`${key}:`).toString("base64");
}

export type CheckoutInput = {
  amountPhp: number; // whole pesos
  description: string;
  reference: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
};

export type CheckoutResult = { id: string; checkoutUrl: string };

// Creates a hosted checkout session (GCash / card / Maya). Creating a session
// does NOT charge — the guest pays on PayMongo's hosted page.
export async function createCheckoutSession(input: CheckoutInput): Promise<CheckoutResult> {
  const attributes: Record<string, unknown> = {
    line_items: [
      {
        name: input.description,
        amount: Math.round(input.amountPhp * 100), // centavos
        currency: "PHP",
        quantity: 1,
      },
    ],
    payment_method_types: ["gcash", "card", "paymaya"],
    description: input.description,
    reference_number: input.reference,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    send_email_receipt: false,
    show_line_items: true,
  };
  // PayMongo rejects an empty metadata object — only include it when non-empty.
  if (input.metadata && Object.keys(input.metadata).length > 0) {
    attributes.metadata = input.metadata;
  }
  const res = await fetch(`${BASE}/checkout_sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader() },
    body: JSON.stringify({ data: { attributes } }),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.errors?.[0]?.detail ?? `PayMongo error (${res.status})`;
    throw new Error(msg);
  }
  return { id: json.data.id, checkoutUrl: json.data.attributes.checkout_url };
}

export async function getCheckoutSession(id: string): Promise<unknown> {
  const res = await fetch(`${BASE}/checkout_sessions/${id}`, {
    headers: { Authorization: authHeader() },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.errors?.[0]?.detail ?? "PayMongo error");
  return json.data;
}

// Verify a PayMongo webhook signature. Header format:
// "t=<unix>,te=<test-sig>,li=<live-sig>". Use `li` in live mode.
export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  mode: "live" | "test" = "live"
): boolean {
  const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=") as [string, string])
  );
  const t = parts["t"];
  const provided = mode === "live" ? parts["li"] : parts["te"];
  if (!t || !provided) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
