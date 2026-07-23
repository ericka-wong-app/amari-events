import { supabaseAdmin } from "./supabase";

// The GROUP is the invite unit: it holds pax, table, and RSVP.
// Members are the individual people in the group (each can log in).

export type Member = {
  id: string;
  displayName: string;
  altNames: string[];
  godparentRole: "Ninong" | "Ninang" | null;
  isOnline: boolean;
  checkedIn: boolean;
};

export type Attendance = "both" | "reception" | "ceremony" | null;

export type Group = {
  id: string;
  name: string;
  maxPax: number;
  tableNumber: string | null;
  rsvpStatus: "attending" | "declined" | "pending";
  confirmedPax: number | null;
  attendance: Attendance;
  members: Member[];
};

export type AdminStats = {
  groups: number;
  attending: number;
  declined: number;
  pending: number;
  confirmedPax: number;
  inPersonPax: number;
  onlinePax: number;
  people: number;
  inPersonListed: number;
  onlineListed: number;
  paidTotalPhp: number;
};

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

type MemberRow = {
  id: string;
  display_name: string;
  alt_names: string[] | null;
  godparent_role: "Ninong" | "Ninang" | null;
  is_online: boolean | null;
  checkins: { checked_in_at: string } | { checked_in_at: string }[] | null;
};
type GroupRow = {
  id: string;
  name: string;
  max_pax: number;
  table_number: string | null;
  rsvp_status: string;
  confirmed_pax: number | null;
  attendance: string | null;
  guests: MemberRow[] | null;
};

const SELECT =
  "id, name, max_pax, table_number, rsvp_status, confirmed_pax, attendance, guests(id, display_name, alt_names, godparent_role, is_online, checkins(checked_in_at))";

function toGroup(r: GroupRow): Group {
  return {
    id: r.id,
    name: r.name,
    maxPax: r.max_pax,
    tableNumber: r.table_number,
    rsvpStatus: (r.rsvp_status as Group["rsvpStatus"]) ?? "pending",
    confirmedPax: r.confirmed_pax,
    attendance: (r.attendance as Group["attendance"]) ?? null,
    members: (r.guests ?? [])
      .map((m) => ({
        id: m.id,
        displayName: m.display_name,
        altNames: m.alt_names ?? [],
        godparentRole: m.godparent_role,
        isOnline: Boolean(m.is_online),
        checkedIn: Boolean(one(m.checkins)),
      }))
      .sort((a, b) => a.displayName.localeCompare(b.displayName)),
  };
}

export async function listGroups(): Promise<Group[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("groups").select(SELECT).order("name");
  if (error) throw new Error(error.message);
  return ((data ?? []) as GroupRow[]).map(toGroup);
}

export async function getStats(): Promise<AdminStats> {
  const groups = await listGroups();
  const sb = supabaseAdmin();
  const { data: paid } = await sb.from("contributions").select("amount_php").eq("status", "paid");
  const paidTotalPhp = (paid ?? []).reduce((s, r) => s + (r.amount_php ?? 0), 0);

  const attending = groups.filter((g) => g.rsvpStatus === "attending");
  const confirmedPax = attending.reduce((s, g) => s + (g.confirmedPax ?? 0), 0);
  // Online = online members within attending groups (capped at that group's headcount).
  const onlinePax = attending.reduce(
    (s, g) => s + Math.min(g.confirmedPax ?? 0, g.members.filter((m) => m.isOnline).length),
    0
  );
  const inPersonPax = Math.max(0, confirmedPax - onlinePax);

  const allMembers = groups.flatMap((g) => g.members);

  return {
    groups: groups.length,
    attending: attending.length,
    declined: groups.filter((g) => g.rsvpStatus === "declined").length,
    pending: groups.filter((g) => g.rsvpStatus === "pending").length,
    confirmedPax,
    inPersonPax,
    onlinePax,
    people: allMembers.length,
    inPersonListed: allMembers.filter((m) => !m.isOnline).length,
    onlineListed: allMembers.filter((m) => m.isOnline).length,
    paidTotalPhp,
  };
}

// ---- Groups ----
export async function createGroup(name: string, maxPax: number): Promise<string> {
  const n = name.trim();
  if (!n) throw new Error("Group name is required.");
  const sb = supabaseAdmin();
  const { data, error } = await sb.from("groups").insert({ name: n, max_pax: Math.max(1, maxPax) }).select("id").single();
  if (error) throw new Error(error.message);
  return data.id;
}

export async function updateGroup(
  id: string,
  fields: { name: string; maxPax: number; tableNumber: string | null }
): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("groups")
    .update({
      name: fields.name.trim(),
      max_pax: Math.max(1, fields.maxPax),
      table_number: fields.tableNumber?.trim() || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteGroup(id: string): Promise<void> {
  const sb = supabaseAdmin();
  // remove members first (guests reference the group)
  await sb.from("guests").delete().eq("group_id", id);
  const { error } = await sb.from("groups").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ---- Members ----
export async function addMember(groupId: string, displayName: string): Promise<void> {
  const name = displayName.trim();
  if (!name) throw new Error("Name is required.");
  const sb = supabaseAdmin();
  const { error } = await sb.from("guests").insert({ group_id: groupId, display_name: name, max_pax: 1 });
  if (error) throw new Error(error.message);
}

export async function updateMember(
  id: string,
  fields: { displayName: string; altNames: string[]; godparentRole: "Ninong" | "Ninang" | null; isOnline: boolean }
): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("guests")
    .update({
      display_name: fields.displayName.trim(),
      alt_names: fields.altNames.map((n) => n.trim()).filter(Boolean),
      godparent_role: fields.godparentRole,
      is_online: fields.isOnline,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteMember(id: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("guests").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// Create a whole invite at once: a group + its people.
export async function createInvite(
  name: string,
  maxPax: number,
  tableNumber: string | null,
  memberNames: string[]
): Promise<void> {
  const n = name.trim();
  if (!n) throw new Error("Invite name is required.");
  const sb = supabaseAdmin();
  const { data: g, error } = await sb
    .from("groups")
    .insert({ name: n, max_pax: Math.max(1, maxPax), table_number: tableNumber?.trim() || null })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const members = memberNames
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => ({ group_id: g.id, display_name: x, max_pax: 1 }));
  if (members.length > 0) {
    const { error: e2 } = await sb.from("guests").insert(members);
    if (e2) throw new Error(e2.message);
  }
}

export async function setGodparentRole(memberId: string, role: "Ninong" | "Ninang" | null): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("guests").update({ godparent_role: role }).eq("id", memberId);
  if (error) throw new Error(error.message);
}

export async function setMemberOnline(memberId: string, isOnline: boolean): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("guests").update({ is_online: isOnline }).eq("id", memberId);
  if (error) throw new Error(error.message);
}

// Host manually sets an invite's RSVP (e.g. a guest told them in person).
export async function setGroupRsvpAdmin(
  groupId: string,
  status: "attending" | "declined" | "pending",
  confirmedPax: number,
  attendance: "both" | "reception" | null
): Promise<void> {
  const sb = supabaseAdmin();
  const row =
    status === "attending"
      ? { rsvp_status: "attending", confirmed_pax: Math.max(1, confirmedPax), attendance: attendance ?? "both", responded_at: new Date().toISOString() }
      : status === "declined"
        ? { rsvp_status: "declined", confirmed_pax: 0, attendance: null, responded_at: new Date().toISOString() }
        : { rsvp_status: "pending", confirmed_pax: null, attendance: null, responded_at: null };
  const { error } = await sb.from("groups").update(row).eq("id", groupId);
  if (error) throw new Error(error.message);
}

export type FlatMember = {
  id: string;
  displayName: string;
  groupName: string | null;
  godparentRole: "Ninong" | "Ninang" | null;
};

export async function listMembersFlat(): Promise<FlatMember[]> {
  const sb = supabaseAdmin();
  const { data, error } = await sb
    .from("guests")
    .select("id, display_name, godparent_role, groups(name)")
    .order("display_name");
  if (error) throw new Error(error.message);
  return ((data ?? []) as { id: string; display_name: string; godparent_role: "Ninong" | "Ninang" | null; groups: { name: string } | { name: string }[] | null }[]).map((r) => ({
    id: r.id,
    displayName: r.display_name,
    groupName: one(r.groups)?.name ?? null,
    godparentRole: r.godparent_role,
  }));
}
