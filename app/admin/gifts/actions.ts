"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";
import {
  updateFund,
  createGiftItem,
  updateGiftItem,
  deleteGiftItem,
  unclaimGiftItem,
  type Fund,
  type GiftItemInput,
} from "@/lib/gift-admin";

async function guard(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Not authorized.");
}

type Res = { ok: boolean; error?: string };

function wrap(fn: () => Promise<void>): Promise<Res> {
  return (async () => {
    try {
      await guard();
      await fn();
      revalidatePath("/admin/gifts");
      revalidatePath("/gift");
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  })();
}

export async function saveFund(f: Fund): Promise<Res> {
  return wrap(() => updateFund(f));
}
export async function addItem(f: GiftItemInput): Promise<Res> {
  return wrap(() => createGiftItem(f));
}
export async function saveItem(id: string, f: GiftItemInput): Promise<Res> {
  return wrap(() => updateGiftItem(id, f));
}
export async function removeItem(id: string): Promise<Res> {
  return wrap(() => deleteGiftItem(id));
}
export async function releaseItem(id: string): Promise<Res> {
  return wrap(() => unclaimGiftItem(id));
}
