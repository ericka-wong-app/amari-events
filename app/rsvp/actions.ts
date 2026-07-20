"use server";

import {
  searchGuests,
  getAuthStatus,
  setPinAndSecurity,
  verifyPin,
  resetPinWithAnswer,
  getGuestCard,
  setRsvp,
  type SearchHit,
  type GuestCard,
} from "@/lib/guests";
import { createGuestSession, getGuestSession, clearGuestSession } from "@/lib/session";
import { passQrDataUrl } from "@/lib/qr";

export type Pass = { card: GuestCard; qrDataUrl: string };
type Result = { ok: true; pass: Pass } | { ok: false; error: string };

const PIN_RE = /^\d{4}$/;

async function buildPass(guestId: string): Promise<Pass | null> {
  const card = await getGuestCard(guestId);
  if (!card) return null;
  return { card, qrDataUrl: await passQrDataUrl(guestId) };
}

export async function search(query: string): Promise<SearchHit[]> {
  return searchGuests(query);
}

export async function getGuest(id: string): Promise<{
  displayName: string;
  groupName: string | null;
  maxPax: number;
  hasPin: boolean;
  securityQuestion: string | null;
} | null> {
  const card = await getGuestCard(id);
  if (!card) return null;
  const auth = await getAuthStatus(id);
  return {
    displayName: card.displayName,
    groupName: card.groupName,
    maxPax: card.maxPax,
    hasPin: auth.hasPin,
    securityQuestion: auth.securityQuestion,
  };
}

export async function setPin(
  id: string,
  pin: string,
  question: string,
  answer: string
): Promise<Result> {
  if (!PIN_RE.test(pin)) return { ok: false, error: "PIN must be exactly 4 digits." };
  if (!question.trim()) return { ok: false, error: "Please choose a security question." };
  if (answer.trim().length < 2) return { ok: false, error: "Please enter a security answer." };
  if ((await getAuthStatus(id)).hasPin) {
    return { ok: false, error: "A PIN already exists for this guest. Please log in." };
  }
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

export async function resetPin(
  id: string,
  answer: string,
  newPin: string
): Promise<Result> {
  if (!PIN_RE.test(newPin)) return { ok: false, error: "New PIN must be 4 digits." };
  if (!(await resetPinWithAnswer(id, answer, newPin))) {
    return { ok: false, error: "That answer doesn't match. Please try again." };
  }
  await createGuestSession(id);
  const pass = await buildPass(id);
  return pass ? { ok: true, pass } : { ok: false, error: "Guest not found." };
}

export async function submitRsvp(
  status: "attending" | "declined",
  confirmedPax: number
): Promise<Result> {
  const guestId = await getGuestSession();
  if (!guestId) return { ok: false, error: "Your session expired. Please log in again." };
  const card = await getGuestCard(guestId);
  if (!card) return { ok: false, error: "Guest not found." };
  const pax = status === "attending" ? Math.min(Math.max(1, confirmedPax), card.maxPax) : 0;
  await setRsvp(guestId, status, pax);
  const pass = await buildPass(guestId);
  return pass ? { ok: true, pass } : { ok: false, error: "Guest not found." };
}

export async function myPass(): Promise<Pass | null> {
  const guestId = await getGuestSession();
  if (!guestId) return null;
  return buildPass(guestId);
}

export async function logout(): Promise<void> {
  await clearGuestSession();
}
