import { randomUUID } from "crypto";
import { supabaseAdmin } from "./supabase";

export type Contribution = {
  id: string;
  reference: string;
  amountPhp: number;
  name: string | null;
  status: "pending" | "paid" | "failed";
  checkoutId: string | null;
};

export async function createContribution(input: {
  amountPhp: number;
  name?: string;
  message?: string;
}): Promise<{ id: string; reference: string }> {
  const reference = randomUUID();
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("contributions")
    .insert({
      amount_php: input.amountPhp,
      name: input.name?.trim() || null,
      message: input.message?.trim() || null,
      reference,
      status: "pending",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: data.id, reference };
}

export async function attachCheckout(contributionId: string, checkoutId: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("contributions").update({ checkout_id: checkoutId }).eq("id", contributionId);
  if (error) throw new Error(error.message);
}

export async function getContributionByReference(reference: string): Promise<Contribution | null> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("contributions")
    .select("id, reference, amount_php, name, status, checkout_id")
    .eq("reference", reference)
    .maybeSingle();
  if (!data) return null;
  return {
    id: data.id,
    reference: data.reference,
    amountPhp: data.amount_php,
    name: data.name,
    status: data.status,
    checkoutId: data.checkout_id,
  };
}

export async function markContributionPaid(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("contributions")
    .update({ status: "paid", paid_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// Total pesos actually paid (drives a funding bar later).
export async function getPaidTotal(): Promise<number> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("contributions").select("amount_php").eq("status", "paid");
  if (error) throw new Error(error.message);
  return (data ?? []).reduce((sum, r) => sum + (r.amount_php ?? 0), 0);
}
