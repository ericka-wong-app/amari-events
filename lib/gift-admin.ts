import { supabaseAdmin } from "./supabase";

export type Fund = { item: string; goalPhp: number; blurb: string; imageUrl: string | null };
export const FUND_DEFAULT: Fund = {
  item: "a special gift for baby Amari",
  goalPhp: 20000,
  blurb: "Chip in any amount — every peso brings us closer. 🎀",
  imageUrl: null,
};

export async function getFund(): Promise<Fund> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb.from("fund").select("item, goal_php, blurb, image_url").limit(1).maybeSingle();
    if (error || !data) return FUND_DEFAULT;
    return {
      item: data.item ?? FUND_DEFAULT.item,
      goalPhp: data.goal_php ?? 0,
      blurb: data.blurb ?? "",
      imageUrl: data.image_url ?? null,
    };
  } catch {
    return FUND_DEFAULT;
  }
}

export async function updateFund(f: Fund): Promise<void> {
  const sb = supabaseAdmin();
  const { data } = await sb.from("fund").select("id").limit(1).maybeSingle();
  const row = {
    item: f.item.trim(),
    goal_php: Math.max(0, Math.round(f.goalPhp)),
    blurb: f.blurb.trim(),
    image_url: f.imageUrl?.trim() || null,
  };
  const { error } = data?.id
    ? await sb.from("fund").update(row).eq("id", data.id)
    : await sb.from("fund").insert(row);
  if (error) throw new Error(error.message);
}

export async function claimGiftItem(id: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const claimer = name.trim();
  if (!claimer) return { ok: false, error: "Please enter your name to claim." };
  const sb = supabaseAdmin();
  const { data: existing } = await sb.from("gift_items").select("claimed_by").eq("id", id).maybeSingle();
  if (existing?.claimed_by) return { ok: false, error: "Sorry, this gift was just claimed by someone else." };
  const { error } = await sb
    .from("gift_items")
    .update({ claimed_by: claimer, claimed_at: new Date().toISOString() })
    .eq("id", id)
    .is("claimed_by", null);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type GiftItem = {
  id: string;
  title: string;
  imageUrl: string | null;
  pricePhp: number | null;
  store: string | null;
  affiliateUrl: string | null;
  sort: number;
  claimedBy: string | null;
  claimedAt: string | null;
};

type GiftRow = {
  id: string;
  title: string;
  image_url: string | null;
  price_php: number | null;
  store: string | null;
  affiliate_url: string | null;
  sort: number;
  claimed_by: string | null;
  claimed_at: string | null;
};

function toItem(r: GiftRow): GiftItem {
  return {
    id: r.id,
    title: r.title,
    imageUrl: r.image_url,
    pricePhp: r.price_php,
    store: r.store,
    affiliateUrl: r.affiliate_url,
    sort: r.sort,
    claimedBy: r.claimed_by,
    claimedAt: r.claimed_at,
  };
}

export type GiftItemInput = {
  title: string;
  imageUrl: string | null;
  pricePhp: number | null;
  store: string | null;
  affiliateUrl: string | null;
  sort: number;
};

function toRow(f: GiftItemInput) {
  return {
    title: f.title.trim(),
    image_url: f.imageUrl?.trim() || null,
    price_php: f.pricePhp && f.pricePhp > 0 ? Math.round(f.pricePhp) : null,
    store: f.store?.trim() || null,
    affiliate_url: f.affiliateUrl?.trim() || null,
    sort: Math.round(f.sort) || 0,
  };
}

export async function listGiftItems(): Promise<GiftItem[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("gift_items").select("*").order("sort").order("created_at");
  if (error) throw new Error(error.message);
  return ((data ?? []) as GiftRow[]).map(toItem);
}

export async function createGiftItem(f: GiftItemInput): Promise<void> {
  if (!f.title.trim()) throw new Error("Item name is required.");
  const sb = supabaseAdmin();
  const { error } = await sb.from("gift_items").insert(toRow(f));
  if (error) throw new Error(error.message);
}

export async function updateGiftItem(id: string, f: GiftItemInput): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("gift_items").update(toRow(f)).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteGiftItem(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("gift_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function unclaimGiftItem(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("gift_items")
    .update({ claimed_by: null, claimed_guest_id: null, claimed_at: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export type AdminContribution = {
  amountPhp: number;
  name: string | null;
  message: string | null;
  createdAt: string;
};

export async function listPaidContributions(): Promise<AdminContribution[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("contributions")
    .select("amount_php, name, message, created_at")
    .eq("status", "paid")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    amountPhp: r.amount_php,
    name: r.name,
    message: r.message,
    createdAt: r.created_at,
  }));
}
