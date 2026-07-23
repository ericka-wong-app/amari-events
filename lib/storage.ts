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

// --- Community album media (photos + short videos) ---
// Uploaded via a signed URL straight from the browser to Supabase, so large
// videos don't hit Vercel's ~4.5MB request-body limit.
const COMMUNITY_BUCKET = "community";
// Supabase's default per-file cap is 50MB; keep in sync with the client guard.
export const COMMUNITY_MAX_BYTES = 50 * 1024 * 1024;
export const COMMUNITY_ALLOWED = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
];

let communityEnsured = false;
async function ensureCommunityBucket(): Promise<void> {
  if (communityEnsured) return;
  const sb = supabaseAdmin();
  const { data: buckets } = await sb.storage.listBuckets();
  const exists = (buckets ?? []).some((b) => b.name === COMMUNITY_BUCKET);
  if (!exists) {
    const { error } = await sb.storage.createBucket(COMMUNITY_BUCKET, {
      public: true,
      fileSizeLimit: COMMUNITY_MAX_BYTES,
      allowedMimeTypes: COMMUNITY_ALLOWED,
    });
    if (error && !/already exists/i.test(error.message)) {
      throw new Error(`Could not set up the album storage: ${error.message}`);
    }
  }
  communityEnsured = true;
}

function extFor(contentType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
  };
  return map[contentType] ?? "bin";
}

export async function createCommunityUploadUrl(
  contentType: string
): Promise<{ uploadUrl: string; token: string; path: string; publicUrl: string; type: "image" | "video" }> {
  if (!COMMUNITY_ALLOWED.includes(contentType)) throw new Error("Please upload a photo or a short video.");
  await ensureCommunityBucket();
  const sb = supabaseAdmin();
  const path = `${randomUUID()}.${extFor(contentType)}`;
  const { data, error } = await sb.storage.from(COMMUNITY_BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? "Could not start the upload.");
  const publicUrl = sb.storage.from(COMMUNITY_BUCKET).getPublicUrl(path).data.publicUrl;
  return {
    uploadUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    publicUrl,
    type: contentType.startsWith("video/") ? "video" : "image",
  };
}
