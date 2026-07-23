"use server";

import { requireAdmin, addAdmin, removeAdmin } from "@/lib/admin";

type Res = { ok: true } | { ok: false; error: string };

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
