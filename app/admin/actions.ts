"use server";

import { revalidatePath } from "next/cache";
import { verifyAdmin, createAdminSession, clearAdminSession, isAdmin } from "@/lib/admin";
import { createGuest, updateGuest, deleteGuest, type AdminGuest } from "@/lib/admin-data";

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

async function guard(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Not authorized.");
}

export async function addGuest(displayName: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await guard();
    await createGuest(displayName);
    revalidatePath("/admin/guests");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function saveGuest(
  id: string,
  fields: Pick<AdminGuest, "displayName" | "altNames" | "maxPax" | "tableNumber" | "godparentRole"> & {
    groupName: string | null;
  }
): Promise<{ ok: boolean; error?: string }> {
  try {
    await guard();
    await updateGuest(id, fields);
    revalidatePath("/admin/guests");
    revalidatePath("/godparents");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function removeGuest(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await guard();
    await deleteGuest(id);
    revalidatePath("/admin/guests");
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
