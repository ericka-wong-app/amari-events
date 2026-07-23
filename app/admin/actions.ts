"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin, createAdminSession, clearAdminSession, isAdmin } from "@/lib/admin";
import {
  createGroup,
  updateGroup,
  deleteGroup,
  addMember,
  updateMember,
  deleteMember,
} from "@/lib/admin-data";

export async function adminLogin(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (!(await verifyAdmin(username, password))) {
    return { ok: false, error: "Invalid username or password." };
  }
  await createAdminSession();
  return { ok: true };
}

export async function adminLogout(): Promise<void> {
  await clearAdminSession();
}

type Res = { ok: boolean; error?: string };

function wrap(fn: () => Promise<void>): Promise<Res> {
  return (async () => {
    try {
      if (!(await isAdmin())) throw new Error("Not authorized.");
      await fn();
      revalidatePath("/admin/guests");
      revalidatePath("/admin");
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  })();
}

export async function newGroup(name: string, maxPax: number): Promise<Res> {
  return wrap(async () => { await createGroup(name, maxPax); });
}
export async function editGroup(id: string, fields: { name: string; maxPax: number; tableNumber: string | null }): Promise<Res> {
  return wrap(() => updateGroup(id, fields));
}
export async function delGroup(id: string): Promise<Res> {
  return wrap(() => deleteGroup(id));
}
export async function newMember(groupId: string, name: string): Promise<Res> {
  return wrap(() => addMember(groupId, name));
}
export async function editMember(id: string, fields: { displayName: string; altNames: string[]; godparentRole: "Ninong" | "Ninang" | null }): Promise<Res> {
  return wrap(() => updateMember(id, fields));
}
export async function delMember(id: string): Promise<Res> {
  return wrap(() => deleteMember(id));
}
