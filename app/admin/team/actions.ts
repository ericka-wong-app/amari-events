"use server";

import { requireAdmin, addAdmin, removeAdmin } from "@/lib/admin";
import { createHostGuest, deleteHostGuest } from "@/lib/admin-data";
import { makeInviteToken } from "@/lib/invite";

type Res = { ok: true } | { ok: false; error: string };

export async function addHostGuest(name: string): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  await requireAdmin();
  try {
    const id = await createHostGuest(name);
    return { ok: true, token: makeInviteToken(id) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function removeHostGuest(id: string): Promise<Res> {
  await requireAdmin();
  try {
    await deleteHostGuest(id);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function createAdmin(username: string, password: string, role: string): Promise<Res> {
  await requireAdmin();
  try {
    await addAdmin(username, password, role);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function deleteAdmin(id: string): Promise<Res> {
  await requireAdmin();
  try {
    await removeAdmin(id);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
