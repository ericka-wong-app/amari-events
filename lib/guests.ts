import { supabaseAdmin } from "./supabase";
import { hashSecret, verifySecret, normalizeAnswer } from "./crypto";

export type SearchHit = { id: string; displayName: string; groupName: string | null };

export type GuestCard = {
  id: string;
  displayName: string;
  groupName: string | null;
  maxPax: number;
  tableNumber: string | null;
  rsvp: { status: "attending" | "declined" | "pending"; confirmedPax: number | null };
};

export type AuthStatus = { hasPin: boolean; securityQuestion: string | null };

type GuestRow = {
  id: string;
  display_name: string;
  alt_names: string[] | null;
  group_id: string | null;
  groups: { name: string } | { name: string }[] | null;
};

function groupName(g: GuestRow["groups"]): string | null {
  if (!g) return null;
  return Array.isArray(g) ? (g[0]?.name ?? null) : g.name;
}

// Guest lists for a baptism are small; fetch and filter in memory so nicknames
// / alternate spellings match case-insensitively without brittle SQL.
export async function searchGuests(query: string): Promise<SearchHit[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("guests")
    .select("id, display_name, alt_names, group_id, groups(name)")
    .order("display_name");
  if (error) throw new Error(error.message);

  const hits: SearchHit[] = [];
  for (const row of (data ?? []) as GuestRow[]) {
    const names = [row.display_name, ...(row.alt_names ?? [])];
    if (names.some((n) => n.toLowerCase().includes(q))) {
      hits.push({ id: row.id, displayName: row.display_name, groupName: groupName(row.groups) });
    }
  }
  return hits.slice(0, 12);
}

export async function getAuthStatus(guestId: string): Promise<AuthStatus> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("guest_auth")
    .select("pin_hash, security_question")
    .eq("guest_id", guestId)
    .maybeSingle();
  return {
    hasPin: Boolean(data?.pin_hash),
    securityQuestion: data?.security_question ?? null,
  };
}

export async function setPinAndSecurity(
  guestId: string,
  pin: string,
  question: string,
  answer: string
): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("guest_auth").upsert({
    guest_id: guestId,
    pin_hash: hashSecret(pin),
    security_question: question,
    security_answer_hash: hashSecret(normalizeAnswer(answer)),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function verifyPin(guestId: string, pin: string): Promise<boolean> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("guest_auth")
    .select("pin_hash")
    .eq("guest_id", guestId)
    .maybeSingle();
  return verifySecret(pin, data?.pin_hash);
}

export async function resetPinWithAnswer(
  guestId: string,
  answer: string,
  newPin: string
): Promise<boolean> {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from("guest_auth")
    .select("security_answer_hash")
    .eq("guest_id", guestId)
    .maybeSingle();
  if (!verifySecret(normalizeAnswer(answer), data?.security_answer_hash)) return false;
  const { error } = await sb
    .from("guest_auth")
    .update({ pin_hash: hashSecret(newPin), updated_at: new Date().toISOString() })
    .eq("guest_id", guestId);
  if (error) throw new Error(error.message);
  return true;
}

export async function getGuestCard(guestId: string): Promise<GuestCard | null> {
  const sb = supabaseAdmin();
  const { data: g } = await sb
    .from("guests")
    .select("id, display_name, max_pax, table_number, group_id, groups(name)")
    .eq("id", guestId)
    .maybeSingle();
  if (!g) return null;
  const { data: r } = await sb
    .from("rsvps")
    .select("status, confirmed_pax")
    .eq("guest_id", guestId)
    .maybeSingle();
  return {
    id: g.id,
    displayName: g.display_name,
    groupName: groupName(g.groups as GuestRow["groups"]),
    maxPax: g.max_pax,
    tableNumber: g.table_number ?? null,
    rsvp: {
      status: (r?.status as GuestCard["rsvp"]["status"]) ?? "pending",
      confirmedPax: r?.confirmed_pax ?? null,
    },
  };
}

export async function setRsvp(
  guestId: string,
  status: "attending" | "declined",
  confirmedPax: number
): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("rsvps").upsert({
    guest_id: guestId,
    status,
    confirmed_pax: status === "attending" ? confirmedPax : 0,
    responded_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}
