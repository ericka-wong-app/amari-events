import { supabaseAdmin } from "./supabase";
import { hashSecret, verifySecret, normalizeAnswer } from "./crypto";

export type SearchHit = { id: string; displayName: string; groupName: string | null };
export type AuthStatus = { hasPin: boolean; securityQuestion: string | null };
export type Attendance = "both" | "reception" | "ceremony" | null;

export type GroupPass = {
  memberId: string;
  memberName: string;
  group: {
    id: string;
    name: string;
    maxPax: number;
    tableNumber: string | null;
    attendance: Attendance;
    rsvpStatus: "attending" | "declined" | "pending";
    confirmedPax: number | null;
    isOnline: boolean;
    members: string[];
  };
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

// Members are searchable by their own name or nicknames.
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

// --- Per-member auth (each person logs in individually) ---
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

// --- Group pass (pax, table, RSVP all live on the group) ---
export async function getGroupPass(memberId: string): Promise<GroupPass | null> {
  const sb = supabaseAdmin();
  const { data: m } = await sb.from("guests").select("id, display_name, group_id").eq("id", memberId).maybeSingle();
  if (!m || !m.group_id) return null;
  const { data: g } = await sb
    .from("groups")
    .select("id, name, max_pax, table_number, attendance, rsvp_status, confirmed_pax, is_online")
    .eq("id", m.group_id)
    .maybeSingle();
  if (!g) return null;
  const { data: mem } = await sb.from("guests").select("display_name").eq("group_id", g.id).order("display_name");
  return {
    memberId: m.id,
    memberName: m.display_name,
    group: {
      id: g.id,
      name: g.name,
      maxPax: g.max_pax,
      tableNumber: g.table_number ?? null,
      attendance: (g.attendance as Attendance) ?? null,
      rsvpStatus: (g.rsvp_status as GroupPass["group"]["rsvpStatus"]) ?? "pending",
      confirmedPax: g.confirmed_pax ?? null,
      isOnline: Boolean(g.is_online),
      members: (mem ?? []).map((x) => x.display_name),
    },
  };
}

export async function getGroupIdForMember(memberId: string): Promise<string | null> {
  const sb = supabaseAdmin();
  const { data } = await sb.from("guests").select("group_id").eq("id", memberId).maybeSingle();
  return data?.group_id ?? null;
}

export async function setGroupRsvp(
  groupId: string,
  status: "attending" | "declined",
  confirmedPax: number,
  attendance: Exclude<Attendance, null>
): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("groups")
    .update({
      rsvp_status: status,
      confirmed_pax: status === "attending" ? confirmedPax : 0,
      attendance: status === "attending" ? attendance : null,
      responded_at: new Date().toISOString(),
    })
    .eq("id", groupId);
  if (error) throw new Error(error.message);
}
