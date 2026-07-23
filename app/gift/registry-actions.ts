"use server";

import { revalidatePath } from "next/cache";
import { claimGiftItem } from "@/lib/gift-admin";

export async function claimGift(id: string, name: string): Promise<{ ok: boolean; error?: string }> {
  const r = await claimGiftItem(id, name);
  if (r.ok) {
    revalidatePath("/gift");
    revalidatePath("/admin/gifts");
  }
  return r;
}
