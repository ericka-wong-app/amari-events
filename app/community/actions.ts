"use server";

import { getGuestSession } from "@/lib/session";
import { getMemberPass } from "@/lib/guests";
import { isAdmin } from "@/lib/admin";
import { createCommunityUploadUrl } from "@/lib/storage";
import * as db from "@/lib/community";
import type { MediaType, Post } from "@/lib/community";

type Fail = { ok: false; error: string };
type FeedOk = { ok: true; posts: Post[] };

export async function loadFeed(): Promise<Post[]> {
  const gid = await getGuestSession();
  try {
    return await db.listPosts(gid);
  } catch {
    return [];
  }
}

async function refreshed(): Promise<Post[]> {
  return db.listPosts(await getGuestSession());
}

export async function startMediaUpload(
  contentType: string
): Promise<{ ok: true; uploadUrl: string; publicUrl: string; type: MediaType } | Fail> {
  const gid = await getGuestSession();
  const admin = await isAdmin();
  if (!gid && !admin) return { ok: false, error: "Please log in to share to the album." };
  try {
    const r = await createCommunityUploadUrl(contentType);
    return { ok: true, uploadUrl: r.uploadUrl, publicUrl: r.publicUrl, type: r.type };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function createPost(
  body: string,
  mediaUrl: string | null,
  mediaType: MediaType | null
): Promise<FeedOk | Fail> {
  const gid = await getGuestSession();
  if (!gid) return { ok: false, error: "Please log in to post." };
  const mp = await getMemberPass(gid);
  if (!mp) return { ok: false, error: "Please log in again." };
  try {
    await db.createPost(gid, mp.memberName, body, mediaUrl, mediaType);
    return { ok: true, posts: await refreshed() };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// Parents / host post to the album (e.g. photos of Amari) from the admin side.
export async function createParentPost(
  authorName: string,
  body: string,
  mediaUrl: string | null,
  mediaType: MediaType | null
): Promise<FeedOk | Fail> {
  if (!(await isAdmin())) return { ok: false, error: "Not allowed." };
  try {
    await db.createPost(null, authorName.trim() || "Amari's Parents", body, mediaUrl, mediaType);
    return { ok: true, posts: await refreshed() };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function react(postId: string, emoji: string): Promise<FeedOk | Fail> {
  const gid = await getGuestSession();
  if (!gid) return { ok: false, error: "Log in to react." };
  try {
    await db.toggleReaction(gid, postId, emoji);
    return { ok: true, posts: await refreshed() };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function comment(postId: string, body: string): Promise<FeedOk | Fail> {
  const gid = await getGuestSession();
  if (!gid) return { ok: false, error: "Log in to comment." };
  const mp = await getMemberPass(gid);
  if (!mp) return { ok: false, error: "Please log in again." };
  try {
    await db.addComment(gid, mp.memberName, postId, body);
    return { ok: true, posts: await refreshed() };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function removePost(postId: string): Promise<FeedOk | Fail> {
  const gid = await getGuestSession();
  if (!(await isAdmin())) {
    if (!gid) return { ok: false, error: "Not allowed." };
    if ((await db.postOwner(postId)) !== gid) return { ok: false, error: "You can only delete your own post." };
  }
  try {
    await db.deletePost(postId);
    return { ok: true, posts: await refreshed() };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function removeComment(commentId: string): Promise<FeedOk | Fail> {
  const gid = await getGuestSession();
  if (!(await isAdmin())) {
    if (!gid) return { ok: false, error: "Not allowed." };
    if ((await db.commentOwner(commentId)) !== gid) return { ok: false, error: "You can only delete your own comment." };
  }
  try {
    await db.deleteComment(commentId);
    return { ok: true, posts: await refreshed() };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
