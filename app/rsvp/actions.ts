"use server";

import {
  searchGuests,
  getAuthStatus,
  setPinAndSecurity,
  verifyPin,
  resetPinWithAnswer,
  getMemberPass,
  setMemberRsvp,
  getGroupOfMember,
  membersInSameGroup,
  groupInPersonMemberIds,
  type SearchHit,
  type MemberPass,
  type GroupMemberView,
  type GodparentRole,
} from "@/lib/guests";
import { createGuestSession, getGuestSession, clearGuestSession } from "@/lib/session";
import { passQrDataUrl } from "@/lib/qr";
import { makeInviteToken, readInviteToken } from "@/lib/invite";

export type Pass = { pass: MemberPass; qrDataUrl: string };
type Result = { ok: true; pass: Pass } | { ok: false; error: string };

const PIN_RE = /^\d{4}$/;

async function buildPass(memberId: string): Promise<Pass | null> {
  const mp = await getMemberPass(memberId);
  if (!mp) return null;
  return { pass: mp, qrDataUrl: await passQrDataUrl(memberId) };
}

export async function search(query: string): Promise<SearchHit[]> {
  return searchGuests(query);
}

export type GuestIntro = {
  id: string;
  displayName: string;
  groupName: string | null;
  isOnline: boolean;
  godparentRole: GodparentRole;
  hasPin: boolean;
  securityQuestion: string | null;
};

export async function getGuest(id: string): Promise<Omit<GuestIntro, "id"> | null> {
  const mp = await getMemberPass(id);
  if (!mp) return null;
  const auth = await getAuthStatus(id);
  return { displayName: mp.memberName, groupName: mp.group.name, isOnline: mp.isOnline, godparentRole: mp.godparentRole, hasPin: auth.hasPin, securityQuestion: auth.securityQuestion };
}

// Resolve a shared invite link straight to the person (no name search needed).
export async function getInvite(token: string): Promise<GuestIntro | null> {
  const id = readInviteToken(token);
  if (!id) return null;
  const g = await getGuest(id);
  return g ? { id, ...g } : null;
}

export type GroupMemberRsvp = GroupMemberView & { inviteToken: string };
export type MyGroup = { groupName: string | null; meId: string; members: GroupMemberRsvp[] };

export async function myGroup(): Promise<MyGroup | null> {
  const meId = await getGuestSession();
  if (!meId) return null;
  const g = await getGroupOfMember(meId);
  if (!g) return null;
  return {
    groupName: g.groupName,
    meId,
    members: g.members.map((m) => ({ ...m, inviteToken: makeInviteToken(m.id) })),
  };
}

// A logged-in member can RSVP for anyone in their own group.
export async function submitRsvpFor(
  targetId: string,
  status: "attending" | "declined",
  attendance: "both" | "reception"
): Promise<{ ok: true; group: MyGroup } | { ok: false; error: string }> {
  const meId = await getGuestSession();
  if (!meId) return { ok: false, error: "Your session expired. Please log in again." };
  if (!(await membersInSameGroup(meId, targetId))) return { ok: false, error: "That guest isn't in your group." };
  await setMemberRsvp(targetId, status, attendance);
  const group = await myGroup();
  return group ? { ok: true, group } : { ok: false, error: "Something went wrong." };
}

// RSVP everyone in the group at once (in-person members only).
export async function submitRsvpAll(
  status: "attending" | "declined",
  attendance: "both" | "reception"
): Promise<{ ok: true; group: MyGroup } | { ok: false; error: string }> {
  const meId = await getGuestSession();
  if (!meId) return { ok: false, error: "Your session expired. Please log in again." };
  const ids = await groupInPersonMemberIds(meId);
  for (const id of ids) await setMemberRsvp(id, status, attendance);
  const group = await myGroup();
  return group ? { ok: true, group } : { ok: false, error: "Something went wrong." };
}

export async function setPin(id: string, pin: string, question: string, answer: string): Promise<Result> {
  if (!PIN_RE.test(pin)) return { ok: false, error: "PIN must be exactly 4 digits." };
  if (!question.trim()) return { ok: false, error: "Please choose a security question." };
  if (answer.trim().length < 2) return { ok: false, error: "Please enter a security answer." };
  if ((await getAuthStatus(id)).hasPin) return { ok: false, error: "A PIN already exists. Please log in." };
  await setPinAndSecurity(id, pin, question.trim(), answer);
  await createGuestSession(id);
  const pass = await buildPass(id);
  return pass ? { ok: true, pass } : { ok: false, error: "Guest not found." };
}

export async function login(id: string, pin: string): Promise<Result> {
  if (!PIN_RE.test(pin)) return { ok: false, error: "PIN must be 4 digits." };
  if (!(await verifyPin(id, pin))) return { ok: false, error: "Incorrect PIN." };
  await createGuestSession(id);
  const pass = await buildPass(id);
  return pass ? { ok: true, pass } : { ok: false, error: "Guest not found." };
}

export async function resetPin(id: string, answer: string, newPin: string): Promise<Result> {
  if (!PIN_RE.test(newPin)) return { ok: false, error: "New PIN must be 4 digits." };
  if (!(await resetPinWithAnswer(id, answer, newPin))) return { ok: false, error: "That answer doesn't match." };
  await createGuestSession(id);
  const pass = await buildPass(id);
  return pass ? { ok: true, pass } : { ok: false, error: "Guest not found." };
}

export async function submitRsvp(
  status: "attending" | "declined",
  attendance: "both" | "reception"
): Promise<Result> {
  const memberId = await getGuestSession();
  if (!memberId) return { ok: false, error: "Your session expired. Please log in again." };
  await setMemberRsvp(memberId, status, attendance);
  const pass = await buildPass(memberId);
  return pass ? { ok: true, pass } : { ok: false, error: "Guest not found." };
}

export async function myPass(): Promise<Pass | null> {
  const memberId = await getGuestSession();
  if (!memberId) return null;
  return buildPass(memberId);
}

export async function logout(): Promise<void> {
  await clearGuestSession();
}
