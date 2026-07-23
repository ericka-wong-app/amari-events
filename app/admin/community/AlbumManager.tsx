"use client";
import { useRef, useState, useTransition } from "react";
import * as api from "../../community/actions";
import type { Post } from "@/lib/community";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "video/mp4", "video/quicktime", "video/webm"];

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

export default function AlbumManager({ posts: initial }: { posts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initial);
  const [author, setAuthor] = useState("Amari's Parents");
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function clearFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null); setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(null);
    if (!ALLOWED.includes(f.type)) { setErr("Please choose a photo or a short video."); return; }
    if (f.type.startsWith("video/")) {
      const dur = await readDuration(f).catch(() => null);
      if (dur != null && dur > 31) { setErr("Videos must be 30 seconds or less."); return; }
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function share() {
    setErr(null); setBusy(true);
    start(async () => {
      try {
        let mediaUrl: string | null = null;
        let mediaType: "image" | "video" | null = null;
        if (file) {
          const up = await api.startMediaUpload(file.type);
          if (!up.ok) { setErr(up.error); return; }
          const put = await fetch(up.uploadUrl, { method: "PUT", headers: { "content-type": file.type }, body: file });
          if (!put.ok) { setErr("Upload failed — please try again."); return; }
          mediaUrl = up.publicUrl; mediaType = up.type;
        }
        const r = await api.createParentPost(author, caption, mediaUrl, mediaType);
        if (r.ok) { setPosts(r.posts); setCaption(""); clearFile(); } else setErr(r.error);
      } catch { setErr("Something went wrong. Please try again."); }
      finally { setBusy(false); }
    });
  }

  function del(id: string) {
    if (!confirm("Delete this post from the album?")) return;
    start(async () => { const r = await api.removePost(id); if (r.ok) setPosts(r.posts); else setErr(r.error); });
  }

  const inputCls = "w-full rounded-lg border border-blush-2 bg-white px-3 py-2 text-sm outline-none focus:border-rose";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blush-2 bg-white px-5 py-5">
        <h2 className="font-display text-xl italic text-rose-deep">Post to the album</h2>
        <p className="mt-1 text-sm text-ink-soft">Share photos or short videos of Amari for everyone to browse, comment on, and download.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div><span className="block text-[0.62rem] font-semibold uppercase tracking-wide text-ink-soft">Posted as</span><input value={author} onChange={(e) => setAuthor(e.target.value)} className={inputCls} /></div>
        </div>
        <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={2} placeholder="Caption (optional)…" className={`${inputCls} mt-3 resize-none`} />
        {preview && (
          <div className="relative mt-3 inline-block overflow-hidden rounded-xl border border-blush-2">
            {file?.type.startsWith("video/")
              ? <video src={preview} className="max-h-52 bg-black" controls />
              // eslint-disable-next-line @next/next/no-img-element
              : <img src={preview} alt="" className="max-h-52" />}
            <button onClick={clearFile} className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-white/90 text-xs font-bold text-rose-deep shadow">×</button>
          </div>
        )}
        <div className="mt-3 flex items-center gap-2">
          <button onClick={() => inputRef.current?.click()} className="rounded-lg border border-blush-2 bg-white px-4 py-2 text-sm font-semibold text-rose-deep">📷 Choose photo / video</button>
          <input ref={inputRef} type="file" accept="image/*,video/*" onChange={onFile} className="hidden" />
          <button onClick={share} disabled={busy || pending || (!caption.trim() && !file)} className="ml-auto rounded-lg bg-rose px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">{busy ? "Posting…" : "Post to album"}</button>
        </div>
        {err && <p className="mt-2 text-sm text-rose-deep">{err}</p>}
      </section>

      <section className="rounded-2xl border border-blush-2 bg-white px-5 py-5">
        <h2 className="font-display text-xl italic text-rose-deep">All posts ({posts.length})</h2>
        <div className="mt-3 space-y-2">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-3 rounded-xl border border-blush-2 px-3 py-2">
              {p.mediaUrl ? (
                p.mediaType === "video"
                  ? <video src={p.mediaUrl} className="h-14 w-14 rounded-lg bg-black object-cover" />
                  // eslint-disable-next-line @next/next/no-img-element
                  : <img src={p.mediaUrl} alt="" className="h-14 w-14 rounded-lg object-cover" />
              ) : (
                <div className="grid h-14 w-14 place-items-center rounded-lg bg-blush text-[0.55rem] font-semibold text-ink-soft">TEXT</div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{p.authorName}</p>
                <p className="truncate text-xs text-ink-soft">{p.body || "—"} · ❤ {p.totalReactions} · 💬 {p.comments.length}</p>
              </div>
              <button onClick={() => del(p.id)} disabled={pending} className="rounded-lg border border-rose/40 px-3 py-1.5 text-xs font-semibold text-rose-deep">Delete</button>
            </div>
          ))}
          {posts.length === 0 && <p className="text-sm text-ink-soft">No posts yet.</p>}
        </div>
      </section>
    </div>
  );
}
