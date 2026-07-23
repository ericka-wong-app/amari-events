import { supabaseAdmin } from "./supabase";

export const REACTIONS = ["❤️", "🥰", "👏", "🙏", "🎉"] as const;
export type MediaType = "image" | "video";

export type ReactionSummary = { emoji: string; count: number };
export type Comment = { id: string; authorName: string; body: string; createdAt: string; guestId: string | null };
export type Post = {
  id: string;
  guestId: string | null;
  authorName: string;
  body: string | null;
  mediaUrl: string | null;
  mediaType: MediaType | null;
  createdAt: string;
  reactions: ReactionSummary[];
  totalReactions: number;
  comments: Comment[];
  myReaction: string | null;
};

type PostRow = {
  id: string;
  guest_id: string | null;
  author_name: string;
  body: string | null;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
};
type ReactionRow = { post_id: string; guest_id: string; emoji: string };
type CommentRow = { id: string; post_id: string; guest_id: string | null; author_name: string; body: string; created_at: string };

export async function listPosts(viewerGuestId: string | null): Promise<Post[]> {
  const sb = supabaseAdmin();
  const { data: posts, error } = await sb
    .from("posts")
    .select("id, guest_id, author_name, body, media_url, media_type, created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw new Error(error.message);
  const rows = (posts ?? []) as PostRow[];
  if (rows.length === 0) return [];
  const ids = rows.map((p) => p.id);

  const { data: reactions } = await sb.from("post_reactions").select("post_id, guest_id, emoji").in("post_id", ids);
  const { data: comments } = await sb
    .from("post_comments")
    .select("id, post_id, guest_id, author_name, body, created_at")
    .in("post_id", ids)
    .order("created_at");
  const rRows = (reactions ?? []) as ReactionRow[];
  const cRows = (comments ?? []) as CommentRow[];

  return rows.map((p) => {
    const rs = rRows.filter((r) => r.post_id === p.id);
    const byEmoji = new Map<string, number>();
    for (const r of rs) byEmoji.set(r.emoji, (byEmoji.get(r.emoji) ?? 0) + 1);
    return {
      id: p.id,
      guestId: p.guest_id,
      authorName: p.author_name,
      body: p.body,
      mediaUrl: p.media_url,
      mediaType: (p.media_type as MediaType | null) ?? null,
      createdAt: p.created_at,
      reactions: [...byEmoji.entries()].map(([emoji, count]) => ({ emoji, count })).sort((a, b) => b.count - a.count),
      totalReactions: rs.length,
      comments: cRows
        .filter((c) => c.post_id === p.id)
        .map((c) => ({ id: c.id, authorName: c.author_name, body: c.body, createdAt: c.created_at, guestId: c.guest_id })),
      myReaction: viewerGuestId ? rs.find((r) => r.guest_id === viewerGuestId)?.emoji ?? null : null,
    };
  });
}

export async function createPost(
  guestId: string | null,
  authorName: string,
  body: string,
  mediaUrl: string | null,
  mediaType: MediaType | null
): Promise<void> {
  const text = body.trim();
  if (!text && !mediaUrl) throw new Error("Add a photo, a video, or a message.");
  if (text.length > 800) throw new Error("Message is a little long — keep it under 800 characters.");
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("posts")
    .insert({ guest_id: guestId, author_name: authorName, body: text || null, media_url: mediaUrl, media_type: mediaType });
  if (error) throw new Error(error.message);
}

export async function toggleReaction(guestId: string, postId: string, emoji: string): Promise<void> {
  const sb = supabaseAdmin();
  const { data: existing } = await sb
    .from("post_reactions")
    .select("id, emoji")
    .eq("post_id", postId)
    .eq("guest_id", guestId)
    .maybeSingle();
  if (existing) {
    if (existing.emoji === emoji) {
      await sb.from("post_reactions").delete().eq("id", existing.id);
      return;
    }
    const { error } = await sb.from("post_reactions").update({ emoji }).eq("id", existing.id);
    if (error) throw new Error(error.message);
    return;
  }
  const { error } = await sb.from("post_reactions").insert({ post_id: postId, guest_id: guestId, emoji });
  if (error) throw new Error(error.message);
}

export async function addComment(guestId: string, authorName: string, postId: string, body: string): Promise<void> {
  const text = body.trim();
  if (!text) throw new Error("Write a comment first.");
  if (text.length > 400) throw new Error("Comment is too long.");
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("post_comments")
    .insert({ post_id: postId, guest_id: guestId, author_name: authorName, body: text });
  if (error) throw new Error(error.message);
}

export async function postOwner(postId: string): Promise<string | null> {
  const sb = supabaseAdmin();
  const { data } = await sb.from("posts").select("guest_id").eq("id", postId).maybeSingle();
  return data?.guest_id ?? null;
}
export async function commentOwner(commentId: string): Promise<string | null> {
  const sb = supabaseAdmin();
  const { data } = await sb.from("post_comments").select("guest_id").eq("id", commentId).maybeSingle();
  return data?.guest_id ?? null;
}
export async function deletePost(postId: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("posts").delete().eq("id", postId);
  if (error) throw new Error(error.message);
}
export async function deleteComment(commentId: string): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("post_comments").delete().eq("id", commentId);
  if (error) throw new Error(error.message);
}
