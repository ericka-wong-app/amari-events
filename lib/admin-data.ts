import { supabaseAdmin } from "./supabase";

export type AdminGuest = {
  id: string;
  displayName: string;
  altNames: string[];
  maxPax: number;
  tableNumber: string | null;
  groupId: string | null;
  groupName: string | null;
  godparentRole: "Ninong" | "Ninang" | null;
  rsvpStatus: "attending" | "declined" | "pending";
  confirmedPax: number | null;
  checkedIn: boolean;
};

export type AdminStats = {
  invited: number;
  attending: number;
  declined: number;
  pending: number;
  confirmedPax: number;
  checkedIn: number;
  paidTotalPhp: number;
};

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

type Row = {
  id: string;
  display_name: string;
  alt_names: string[] | null;
  max_pax: number;
  table_number: string | null;
  group_id: string | null;
  godparent_role: "Ninong" | "Ninang" | null;
  groups: { name: string } | { name: string }[] | null;
  rsvps: { status: string; confirmed_pax: number | null } | { status: string; confirmed_pax: number | null }[] | null;
  checkins: { checked_in_at: string } | { checked_in_at: string }[] | null;
};

const SELECT =
  "id, display_name, alt_names, max_pax, table_number, group_id, godparent_role, groups(name), rsvps(status, confirmed_pax), checkins(checked_in_at)";

function toGuest(r: Row): AdminGuest {
  const rsvp = one(r.rsvps);
  return {
    id: r.id,
    displayName: r.display_name,
    altNames: r.alt_names ?? [],
    maxPax: r.max_pax,
    tableNumber: r.table_number,
    groupId: r.group_id,
    groupName: one(r.groups)?.name ?? null,
    godparentRole: r.godparent_role,
    rsvpStatus: (rsvp?.status as AdminGuest["rsvpStatus"]) ?? "pending",
    confirmedPax: rsvp?.confirmed_pax ?? null,
    checkedIn: Boolean(one(r.checkins)),
  };
}

export async function listGuests(): Promise<AdminGuest[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("guests").select(SELECT).order("display_name");
  if (error) throw new Error(error.message);
  return ((data ?? []) as Row[]).map(toGuest);
}

export async function getStats(): Promise<AdminStats> {
  const guests = await listGuests();
  const sb = supabaseAdmin();
  const { data: paid } = await sb.from("contributions").select("amount_php").eq("status", "paid");
  const paidTotalPhp = (paid ?? []).reduce((s, r) => s + (r.amount_php ?? 0), 0);
  return {
    invited: guests.length,
    attending: guests.filter((g) => g.rsvpStatus === "attending").length,
    declined: guests.filter((g) => g.rsvpStatus === "declined").length,
    pending: guests.filter((g) => g.rsvpStatus === "pending").length,
    confirmedPax: guests.filter((g) => g.rsvpStatus === "attending").reduce((s, g) => s + (g.confirmedPax ?? 0), 0),
    checkedIn: guests.filter((g) => g.checkedIn).length,
    paidTotalPhp,
  };
}

async function resolveGroupId(groupName: string | null): Promise<string | null> {
  const name = groupName?.trim();
  if (!name) return null;
  const sb = supabaseAdmin();
  const { data: existing } = await sb.from("groups").select("id").ilike("name", name).maybeSingle();
  if (existing) return existing.id;
  const { data: created, error } = await sb.from("groups").insert({ name }).select("id").single();
  if (error) throw new Error(error.message);
  return created.id;
}

export async function createGuest(displayName: string): Promise<void> {
  const name = displayName.trim();
  if (!name) throw new Error("Name is required.");
  const sb = supabaseAdmin();
  const { error } = await sb.from("guests").insert({ display_name: name, max_pax: 1 });
  if (error) throw new Error(error.message);
}

export async function updateGuest(
  id: string,
  fields: {
    displayName: string;
    altNames: string[];
    maxPax: number;
    tableNumber: string | null;
    groupName: string | null;
    godparentRole: "Ninong" | "Ninang" | null;
  }
): Promise<void> {
  const sb = supabaseAdmin();
  const group_id = await resolveGroupId(fields.groupName);
  const { error } = await sb
    .from("guests")
    .update({
      display_name: fields.displayName.trim(),
      alt_names: fields.altNames.map((n) => n.trim()).filter(Boolean),
      max_pax: Math.max(1, fields.maxPax),
      table_number: fields.tableNumber?.trim() || null,
      group_id,
      godparent_role: fields.godparentRole,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteGuest(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("guests").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
