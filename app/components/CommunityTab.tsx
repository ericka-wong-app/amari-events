"use client";
import { useRef, useState, useTransition } from "react";
import * as api from "../community/actions";
import type { Post } from "@/lib/community";

const REACTIONS = ["❤️", "🥰", "👏", "🙏", "🎉"];
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "video/mp4", "video/quicktime", "video/webm"];
const MAX_MB = 50;
const MAX_BYTES = MAX_MB * 1024 * 1024;

function readDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(v.duration); };
    v.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Couldn't read that video.")); };
    v.src = url;
  });
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const s = Math.max(0, Math.round((Date.now() - then) / 1000));
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

export default function CommunityTab({
  initialPosts,
  loggedIn,
  viewerGuestId,
  onLoginNeeded,
}: {
  initialPosts: Post[];
  loggedIn: boolean;
  viewerGuestId: string | null;
  onLoginNeeded: () => void;
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null); setFileType(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(null);
    if (!ALLOWED.includes(f.type)) { setErr("Please choose a photo or a short video."); return; }
    if (f.size > MAX_BYTES) {
      setErr(`That file is ${(f.size / 1024 / 1024).toFixed(0)}MB — the max is ${MAX_MB}MB. Try a shorter clip, or record in a lower resolution (720p/1080p).`);
      return;
    }
    if (f.type.startsWith("video/")) {
      const dur = await readDuration(f).catch(() => null);
      if (dur != null && dur > 31) { setErr("Videos must be 30 seconds or less. 🎬"); return; }
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setFileType(f.type.startsWith("video/") ? "video" : "image");
  }

  function post() {
    setErr(null);
    setBusy(true);
    start(async () => {
      try {
        let mediaUrl: string | null = null;
        let mediaType: "image" | "video" | null = null;
        if (file) {
          const up = await api.startMediaUpload(file.type);
          if (!up.ok) { setErr(up.error); return; }
          const put = await fetch(up.uploadUrl, { method: "PUT", headers: { "content-type": file.type }, body: file });
          if (!put.ok) {
            setErr(put.status === 413 ? `That file is too large (max ${MAX_MB}MB). Try a shorter or lower-resolution clip.` : "Upload failed — please try again.");
            return;
          }
          mediaUrl = up.publicUrl; mediaType = up.type;
        }
        const r = await api.createPost(body, mediaUrl, mediaType);
        if (r.ok) { setPosts(r.posts); setBody(""); clearFile(); }
        else setErr(r.error);
      } catch {
        setErr("Something went wrong. Please try again.");
      } finally {
        setBusy(false);
      }
    });
  }

  return (
    <div className="mx-auto max-w-xl px-5 py-8">
      <div className="text-center">
        <p className="text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-rose-deep/70">Shared album</p>
        <h2 className="mt-1 font-script text-4xl text-rose-deep">Amari&apos;s Baptism Album</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
          Share your photos, short videos, and messages from the day — so everyone, near or far, can celebrate together. 💕
        </p>
      </div>

      {loggedIn ? (
        <div className="anim-fade-up mt-6 rounded-[24px] border border-blush-2 bg-white/80 p-4 shadow-[0_18px_44px_-30px_rgba(183,110,125,0.6)]">
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={2}
            placeholder="Share a moment, a message, or a prayer…"
            className="w-full resize-none rounded-2xl border border-blush-2 bg-white px-4 py-3 text-sm outline-none focus:border-rose" />
          {preview && (
            <div className="relative mt-2 overflow-hidden rounded-2xl border border-blush-2">
              {fileType === "video"
                ? <video src={preview} className="max-h-64 w-full bg-black object-contain" controls />
                // eslint-disable-next-line @next/next/no-img-element
                : <img src={preview} alt="" className="max-h-64 w-full object-contain" />}
              <button onClick={clearFile} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-sm font-bold text-rose-deep shadow">×</button>
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => inputRef.current?.click()}
              className="rounded-full border border-blush-2 bg-white px-4 py-2 text-sm font-semibold text-rose-deep">
              📷 Photo / video
            </button>
            <input ref={inputRef} type="file" accept="image/*,video/*" onChange={onFile} className="hidden" />
            <button onClick={post} disabled={busy || pending || (!body.trim() && !file)}
              className="hover-lift ml-auto rounded-full bg-rose px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_26px_-14px_rgba(183,110,125,0.9)] disabled:opacity-60">
              {busy ? "Posting…" : "Share"}
            </button>
          </div>
          <p className="mt-1.5 text-[0.68rem] text-ink-soft">Videos up to 30 seconds. Everyone invited can see &amp; download.</p>
          {err && <p className="mt-2 text-sm text-rose-deep">{err}</p>}
        </div>
      ) : (
        <div className="anim-fade-up mt-6 rounded-[24px] border border-blush-2 bg-white/70 px-5 py-6 text-center shadow-[0_18px_44px_-30px_rgba(183,110,125,0.6)]">
          <p className="text-sm text-ink">Log in to share your own photos, videos &amp; messages.</p>
          <button onClick={onLoginNeeded} className="hover-lift mt-3 rounded-full bg-rose px-6 py-2.5 text-sm font-semibold text-white">Log in to join</button>
          <p className="mt-2 text-xs text-ink-soft">You can still browse and download everything below.</p>
        </div>
      )}

      <div className="mt-8 space-y-5">
        {posts.length === 0 && (
          <p className="rounded-2xl border border-dashed border-blush-2 bg-white/50 px-5 py-8 text-center text-sm text-ink-soft">
            No posts yet — be the first to share a moment from Amari&apos;s special day! 🎀
          </p>
        )}
        {posts.map((p) => (
          <PostCard key={p.id} post={p} viewerGuestId={viewerGuestId} loggedIn={loggedIn} onLoginNeeded={onLoginNeeded} setPosts={setPosts} />
        ))}
      </div>
    </div>
  );
}

function PostCard({
  post, viewerGuestId, loggedIn, onLoginNeeded, setPosts,
}: {
  post: Post; viewerGuestId: string | null; loggedIn: boolean; onLoginNeeded: () => void; setPosts: (p: Post[]) => void;
}) {
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const mine = viewerGuestId != null && post.guestId === viewerGuestId;

  function run(fn: () => Promise<{ ok: true; posts: Post[] } | { ok: false; error: string }>) {
    setErr(null);
    start(async () => { const r = await fn(); if (r.ok) setPosts(r.posts); else setErr(r.error); });
  }
  const react = (emoji: string) => loggedIn ? run(() => api.react(post.id, emoji)) : onLoginNeeded();
  const addComment = () => { if (!draft.trim()) return; run(() => api.comment(post.id, draft)); setDraft(""); };

  return (
    <article className="anim-fade-up overflow-hidden rounded-[24px] border border-blush-2 bg-white/85 shadow-[0_18px_44px_-30px_rgba(183,110,125,0.6)]">
      <div className="flex items-center justify-between px-5 pt-4">
        <div>
          <p className="text-sm font-semibold text-ink">{post.authorName}</p>
          <p className="text-[0.68rem] text-ink-soft">{timeAgo(post.createdAt)}</p>
        </div>
        {mine && <button onClick={() => run(() => api.removePost(post.id))} disabled={pending} className="text-xs text-ink-soft underline">Delete</button>}
      </div>

      {post.body && <p className="whitespace-pre-wrap px-5 pt-3 text-sm leading-relaxed text-ink">{post.body}</p>}

      {post.mediaUrl && (
        <div className="relative mt-3 bg-black/5">
          {post.mediaType === "video"
            ? <video src={post.mediaUrl} className="max-h-[70vh] w-full bg-black object-contain" controls playsInline />
            // eslint-disable-next-line @next/next/no-img-element
            : <img src={post.mediaUrl} alt={`Shared by ${post.authorName}`} className="max-h-[70vh] w-full object-contain" />}
          <a href={`${post.mediaUrl}?download`} className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-rose-deep shadow">
            ⬇ Download
          </a>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 px-5 py-3">
        {REACTIONS.map((emoji) => {
          const count = post.reactions.find((r) => r.emoji === emoji)?.count ?? 0;
          const active = post.myReaction === emoji;
          return (
            <button key={emoji} onClick={() => react(emoji)} disabled={pending}
              className={`rounded-full border px-2.5 py-1 text-sm transition ${active ? "border-rose bg-blush/70" : "border-blush-2 bg-white"}`}>
              {emoji}{count > 0 && <span className="ml-1 text-xs font-semibold text-ink-soft">{count}</span>}
            </button>
          );
        })}
        <button onClick={() => setShowComments((s) => !s)} className="ml-auto text-xs font-semibold text-rose-deep">
          💬 {post.comments.length > 0 ? post.comments.length : ""} {post.comments.length === 1 ? "comment" : "comments"}
        </button>
      </div>

      {(showComments || post.comments.length > 0) && (
        <div className="border-t border-blush-2/60 px-5 py-3">
          <div className="space-y-2">
            {post.comments.map((c) => {
              const cmine = viewerGuestId != null && c.guestId === viewerGuestId;
              return (
                <div key={c.id} className="flex items-start justify-between gap-2 text-sm">
                  <p className="text-ink"><span className="font-semibold">{c.authorName}</span> <span className="text-ink-soft">· {timeAgo(c.createdAt)}</span><br />{c.body}</p>
                  {cmine && <button onClick={() => run(() => api.removeComment(c.id))} className="text-[0.68rem] text-ink-soft underline">delete</button>}
                </div>
              );
            })}
            {post.comments.length === 0 && <p className="text-xs text-ink-soft">No comments yet.</p>}
          </div>
          {loggedIn ? (
            <div className="mt-3 flex items-center gap-2">
              <input value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addComment(); }}
                placeholder="Add a comment…"
                className="w-full rounded-full border border-blush-2 bg-white px-3.5 py-2 text-sm outline-none focus:border-rose" />
              <button onClick={addComment} disabled={pending || !draft.trim()} className="rounded-full bg-rose px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Send</button>
            </div>
          ) : (
            <button onClick={onLoginNeeded} className="mt-3 text-xs font-semibold text-rose-deep underline">Log in to comment</button>
          )}
          {err && <p className="mt-2 text-sm text-rose-deep">{err}</p>}
        </div>
      )}
    </article>
  );
}
