"use server";

import {
  searchGuests,
  getAuthStatus,
  setPinAndSecurity,
  verifyPin,
  resetPinWithAnswer,
  getGroupPass,
  getGroupIdForMember,
  setGroupRsvp,
  type SearchHit,
  type GroupPass,
} from "@/lib/guests";
import { createGuestSession, getGuestSession, clearGuestSession } from "@/lib/session";
import { passQrDataUrl } from "@/lib/qr";

export type Pass = { pass: GroupPass; qrDataUrl: string };
type Result = { ok: true; pass: Pass } | { ok: false; error: string };

const PIN_RE = /^\d{4}$/;

async function buildPass(memberId: string): Promise<Pass | null> {
  const gp = await getGroupPass(memberId);
  if (!gp) return null;
  return { pass: gp, qrDataUrl: await passQrDataUrl(gp.group.id) };
}

export async function search(query: string): Promise<SearchHit[]> {
  return searchGuests(query);
}

export async function getGuest(id: string): Promise<{
  displayName: string;
  groupName: string | null;
  hasPin: boolean;
  securityQuestion: string | null;
} | null> {
  const gp = await getGroupPass(id);
  if (!gp) return null;
  const auth = await getAuthStatus(id);
  return { displayName: gp.memberName, groupName: gp.group.name, hasPin: auth.hasPin, securityQuestion: auth.securityQuestion };
}

export async function setPin(id: string, pin: string, question: string, answer: string): Promise<Result> {
  if (!PIN_RE.test(pin)) return { ok: false, error: "PIN must be exactly 4 digits." };
  if (!question.trim()) return { ok: false, error: "Please choose a security question." };
  if (answer.trim().length < 2) return { ok: false, error: "Please enter a security answer." };
  if ((await getAuthStatus(id)).hasPin) return { ok: false, error: "A PIN already exists. Please log in." };
  await setPinAndSecurity(id, pin, question.trim(), answer);
  await createGuestSession(id);
  const pass = await buildPass(id);
  return pass ? { ok: true, pass } : { ok: false, error: "Invite not found." };
}

export async function login(id: string, pin: string): Promise<Result> {
  if (!PIN_RE.test(pin)) return { ok: false, error: "PIN must be 4 digits." };
  if (!(await verifyPin(id, pin))) return { ok: false, error: "Incorrect PIN." };
  await createGuestSession(id);
  const pass = await buildPass(id);
  return pass ? { ok: true, pass } : { ok: false, error: "Invite not found." };
}

export async function resetPin(id: string, answer: string, newPin: string): Promise<Result> {
  if (!PIN_RE.test(newPin)) return { ok: false, error: "New PIN must be 4 digits." };
  if (!(await resetPinWithAnswer(id, answer, newPin))) return { ok: false, error: "That answer doesn't match." };
  await createGuestSession(id);
  const pass = await buildPass(id);
  return pass ? { ok: true, pass } : { ok: false, error: "Invite not found." };
}

export async function submitRsvp(
  status: "attending" | "declined",
  confirmedPax: number,
  attendance: "both" | "reception"
): Promise<Result> {
  const memberId = await getGuestSession();
  if (!memberId) return { ok: false, error: "Your session expired. Please log in again." };
  const groupId = await getGroupIdForMember(memberId);
  if (!groupId) return { ok: false, error: "Invite not found." };
  const gp = await getGroupPass(memberId);
  const maxPax = gp?.group.maxPax ?? 1;
  const pax = status === "attending" ? Math.min(Math.max(1, confirmedPax), maxPax) : 0;
  await setGroupRsvp(groupId, status, pax, attendance);
  const pass = await buildPass(memberId);
  return pass ? { ok: true, pass } : { ok: false, error: "Invite not found." };
}

export async function myPass(): Promise<Pass | null> {
  const memberId = await getGuestSession();
  if (!memberId) return null;
  return buildPass(memberId);
}

export async function logout(): Promise<void> {
  await clearGuestSession();
}
