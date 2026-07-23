import { randomUUID } from "crypto";
import { supabaseAdmin } from "./supabase";

const BUCKET = "gift-images";
export const MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED = ["image/png", "image/jpeg"];

let ensured = false;
async function ensureBucket(): Promise<void> {
  if (ensured) return;
  const sb = supabaseAdmin();
  const { data } = await sb.storage.getBucket(BUCKET);
  if (!data) {
    await sb.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: MAX_BYTES,
      allowedMimeTypes: ALLOWED,
    });
  }
  ensured = true;
}

export async function uploadGiftImage(file: File): Promise<string> {
  if (!ALLOWED.includes(file.type)) throw new Error("Please upload a PNG or JPEG image.");
  if (file.size > MAX_BYTES) throw new Error("Image is too large (max 5MB).");
  await ensureBucket();

  const sb = supabaseAdmin();
  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `${randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await sb.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}
