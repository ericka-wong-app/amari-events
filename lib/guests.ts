import { supabaseAdmin } from "./supabase";
import { hashSecret, verifySecret, normalizeAnswer } from "./crypto";

export type SearchHit = { id: string; displayName: string; groupName: string | null };
export type AuthStatus = { hasPin: boolean; securityQuestion: string | null };
export type Attendance = "both" | "reception" | "ceremony" | null;

// Each PERSON has their own RSVP + QR. The group is context (who you're with).
export type GodparentRole = "Ninong" | "Ninang" | null;
export type MemberPass = {
  memberId: string;
  memberName: string;
  isOnline: boolean;
  godparentRole: GodparentRole;
  rsvpStatus: "attending" | "declined" | "pending";
  attendance: Attendance;
  group: { name: string | null; tableNumber: string | null; members: string[] };
};

function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

type MemberRow = {
  id: string;
  display_name: string;
  alt_names: string[] | null;
  group_id: string | null;
  groups: { name: string } | { name: string }[] | null;
};

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
  for (const row of (data ?? []) as MemberRow[]) {
    const names = [row.display_name, ...(row.alt_names ?? [])];
    if (names.some((n) => n.toLowerCase().includes(q))) {
      hits.push({ id: row.id, displayName: row.display_name, groupName: one(row.groups)?.name ?? null });
    }
  }
  return hits.slice(0, 12);
}

// --- Per-person auth ---
export async function getAuthStatus(memberId: string): Promise<AuthStatus> {
  const sb = supabaseAdmin();
  const { data } = await sb.from("guest_auth").select("pin_hash, security_question").eq("guest_id", memberId).maybeSingle();
  return { hasPin: Boolean(data?.pin_hash), securityQuestion: data?.security_question ?? null };
}
export async function setPinAndSecurity(memberId: string, pin: string, question: string, answer: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("guest_auth").upsert({
    guest_id: memberId,
    pin_hash: hashSecret(pin),
    security_question: question,
    security_answer_hash: hashSecret(normalizeAnswer(answer)),
    updated_at: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}
export async function verifyPin(memberId: string, pin: string): Promise<boolean> {
  const sb = supabaseAdmin();
  const { data } = await sb.from("guest_auth").select("pin_hash").eq("guest_id", memberId).maybeSingle();
  return verifySecret(pin, data?.pin_hash);
}
export async function resetPinWithAnswer(memberId: string, answer: string, newPin: string): Promise<boolean> {
  const sb = supabaseAdmin();
  const { data } = await sb.from("guest_auth").select("security_answer_hash").eq("guest_id", memberId).maybeSingle();
  if (!verifySecret(normalizeAnswer(answer), data?.security_answer_hash)) return false;
  const { error } = await sb.from("guest_auth").update({ pin_hash: hashSecret(newPin), updated_at: new Date().toISOString() }).eq("guest_id", memberId);
  if (error) throw new Error(error.message);
  return true;
}

// --- Per-person pass ---
export async function getMemberPass(memberId: string): Promise<MemberPass | null> {
  const sb = supabaseAdmin();
  const { data: m } = await sb
    .from("guests")
    .select("id, display_name, group_id, is_online, godparent_role, rsvp_status, attendance, groups(name, table_number)")
    .eq("id", memberId)
    .maybeSingle();
  if (!m) return null;
  const g = one(m.groups as { name: string; table_number: string | null } | { name: string; table_number: string | null }[] | null);
  let members: string[] = [];
  if (m.group_id) {
    const { data: mem } = await sb.from("guests").select("display_name").eq("group_id", m.group_id).order("display_name");
    members = (mem ?? []).map((x) => x.display_name);
  }
  const role = m.godparent_role === "Ninong" || m.godparent_role === "Ninang" ? m.godparent_role : null;
  return {
    memberId: m.id,
    memberName: m.display_name,
    isOnline: Boolean(m.is_online),
    godparentRole: role,
    rsvpStatus: (m.rsvp_status as MemberPass["rsvpStatus"]) ?? "pending",
    attendance: (m.attendance as Attendance) ?? null,
    group: { name: g?.name ?? null, tableNumber: g?.table_number ?? null, members },
  };
}

export async function setMemberRsvp(
  memberId: string,
  status: "attending" | "declined",
  attendance: Exclude<Attendance, null>
): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("guests")
    .update({
      rsvp_status: status,
      attendance: status === "attending" ? attendance : null,
      rsvp_at: new Date().toISOString(),
    })
    .eq("id", memberId);
  if (error) throw new Error(error.message);
}

// --- Group roster (a logged-in member can see & help their group) ---
export type GroupMemberView = {
  id: string;
  name: string;
  isOnline: boolean;
  godparentRole: GodparentRole;
  rsvpStatus: "attending" | "declined" | "pending";
  attendance: Attendance;
};

type GroupMemberRow = {
  id: string;
  display_name: string;
  is_online: boolean | null;
  godparent_role: string | null;
  rsvp_status: string | null;
  attendance: string | null;
  group_id: string | null;
};

function toGroupMemberView(r: GroupMemberRow): GroupMemberView {
  const role = r.godparent_role === "Ninong" || r.godparent_role === "Ninang" ? r.godparent_role : null;
  return {
    id: r.id,
    name: r.display_name,
    isOnline: Boolean(r.is_online),
    godparentRole: role,
    rsvpStatus: (r.rsvp_status as GroupMemberView["rsvpStatus"]) ?? "pending",
    attendance: (r.attendance as Attendance) ?? null,
  };
}

const GROUP_MEMBER_COLS = "id, display_name, is_online, godparent_role, rsvp_status, attendance, group_id";

export async function getGroupOfMember(
  memberId: string
): Promise<{ groupName: string | null; members: GroupMemberView[] } | null> {
  const sb = supabaseAdmin();
  const { data: me } = await sb
    .from("guests")
    .select("group_id, groups(name)")
    .eq("id", memberId)
    .maybeSingle();
  if (!me) return null;
  const groupName = one(me.groups as { name: string } | { name: string }[] | null)?.name ?? null;

  const q = sb.from("guests").select(GROUP_MEMBER_COLS);
  const { data } = me.group_id
    ? await q.eq("group_id", me.group_id).order("display_name")
    : await q.eq("id", memberId);
  return { groupName, members: ((data ?? []) as GroupMemberRow[]).map(toGroupMemberView) };
}

// Security: only let a logged-in member act on people in their own group.
export async function membersInSameGroup(callerId: string, targetId: string): Promise<boolean> {
  if (callerId === targetId) return true;
  const sb = supabaseAdmin();
  const { data } = await sb.from("guests").select("id, group_id").in("id", [callerId, targetId]);
  if (!data || data.length < 2) return false;
  const caller = data.find((x) => x.id === callerId);
  const target = data.find((x) => x.id === targetId);
  return Boolean(caller?.group_id && caller.group_id === target?.group_id);
}

// Non-online people in the caller's group (for "RSVP for everyone").
export async function groupInPersonMemberIds(memberId: string): Promise<string[]> {
  const sb = supabaseAdmin();
  const { data: me } = await sb.from("guests").select("group_id").eq("id", memberId).maybeSingle();
  if (!me?.group_id) return [memberId];
  const { data } = await sb.from("guests").select("id, is_online").eq("group_id", me.group_id);
  return ((data ?? []) as { id: string; is_online: boolean | null }[])
    .filter((m) => !m.is_online)
    .map((m) => m.id);
}
