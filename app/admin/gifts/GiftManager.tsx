"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Fund, GiftItem, GiftItemInput, AdminContribution } from "@/lib/gift-admin";
import { saveFund, addItem, saveItem, removeItem, releaseItem } from "./actions";

const input = "w-full rounded-lg border border-blush-2 bg-white px-3 py-2 text-sm outline-none focus:border-rose";
const label = "block text-[0.62rem] font-semibold uppercase tracking-wide text-ink-soft";
const STORES = ["Shopee", "Lazada", "TikTok Shop", "Amazon", "Other"];

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || "Upload failed");
  return j.url as string;
}

export default function GiftManager({
  fund,
  items,
  contributions,
  paidTotal,
}: {
  fund: Fund;
  items: GiftItem[];
  contributions: AdminContribution[];
  paidTotal: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  // fund fields
  const [item, setItem] = useState(fund.item);
  const [goal, setGoal] = useState(fund.goalPhp);
  const [blurb, setBlurb] = useState(fund.blurb);

  const refresh = () => router.refresh();

  return (
    <div className="space-y-6">
      {/* Monetary fund */}
      <section className="rounded-2xl border border-blush-2 bg-white px-5 py-5">
        <h2 className="font-display text-xl italic text-rose-deep">Monetary fund (progress bar)</h2>
        <p className="mt-1 text-sm text-ink-soft">Raised so far: <strong className="text-rose-deep">₱{paidTotal.toLocaleString()}</strong></p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><span className={label}>We&apos;re raising for…</span><input value={item} onChange={(e) => setItem(e.target.value)} className={input} /></div>
          <div><span className={label}>Goal (₱)</span><input type="number" min={0} value={goal} onChange={(e) => setGoal(Number(e.target.value))} className={input} /></div>
          <div className="sm:col-span-2"><span className={label}>Blurb</span><input value={blurb} onChange={(e) => setBlurb(e.target.value)} className={input} /></div>
        </div>
        <button disabled={pending} onClick={() => { setMsg(null); start(async () => { const r = await saveFund({ item, goalPhp: goal, blurb }); if (r.ok) refresh(); else setMsg(r.error ?? "Failed"); }); }}
          className="mt-3 rounded-lg bg-rose px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">Save fund</button>
      </section>

      {/* Registry items */}
      <section className="rounded-2xl border border-blush-2 bg-white px-5 py-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl italic text-rose-deep">Gift registry ({items.length})</h2>
          {!adding && <button onClick={() => { setAdding(true); setEditing(null); }} className="rounded-lg bg-rose px-4 py-1.5 text-sm font-semibold text-white">+ Add item</button>}
        </div>

        {adding && (
          <ItemForm pending={pending}
            onCancel={() => setAdding(false)}
            onSubmit={(f) => start(async () => { const r = await addItem(f); if (r.ok) { setAdding(false); refresh(); } else setMsg(r.error ?? "Failed"); })}
          />
        )}

        <div className="mt-4 space-y-2">
          {items.map((it) =>
            editing === it.id ? (
              <ItemForm key={it.id} initial={it} pending={pending}
                onCancel={() => setEditing(null)}
                onSubmit={(f) => start(async () => { const r = await saveItem(it.id, f); if (r.ok) { setEditing(null); refresh(); } else setMsg(r.error ?? "Failed"); })}
                onDelete={() => start(async () => { if (!confirm(`Delete "${it.title}"?`)) return; const r = await removeItem(it.id); if (r.ok) { setEditing(null); refresh(); } else setMsg(r.error ?? "Failed"); })}
              />
            ) : (
              <div key={it.id} className="flex items-center gap-3 rounded-xl border border-blush-2 px-3 py-2">
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover" />
                ) : (
                  <div className="grid h-12 w-12 place-items-center rounded-lg bg-blush text-[0.6rem] font-semibold text-ink-soft">IMG</div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{it.title}</p>
                  <p className="truncate text-xs text-ink-soft">
                    {it.pricePhp ? `₱${it.pricePhp.toLocaleString()} · ` : ""}{it.store ?? "—"}
                    {it.claimedBy ? ` · 🔒 claimed by ${it.claimedBy}` : " · available"}
                  </p>
                </div>
                {it.claimedBy && <button onClick={() => start(async () => { await releaseItem(it.id); refresh(); })} className="text-xs text-ink-soft underline">release</button>}
                <button onClick={() => { setEditing(it.id); setAdding(false); }} className="text-xs text-rose-deep">edit ›</button>
              </div>
            )
          )}
          {items.length === 0 && !adding && <p className="text-sm text-ink-soft">No registry items yet. Add one with a photo + your affiliate link.</p>}
        </div>
      </section>

      {msg && <p className="text-sm text-rose-deep">{msg}</p>}

      {/* Contributions */}
      <section className="rounded-2xl border border-blush-2 bg-white px-5 py-5">
        <h2 className="font-display text-xl italic text-rose-deep">Monetary gifts received ({contributions.length})</h2>
        <div className="mt-3 space-y-1 text-sm">
          {contributions.map((c, i) => (
            <div key={i} className="flex items-center justify-between border-b border-blush-2/60 py-1.5">
              <span className="text-ink">{c.name || "Anonymous"}{c.message ? <span className="text-ink-soft"> — “{c.message}”</span> : null}</span>
              <span className="font-semibold text-rose-deep">₱{c.amountPhp.toLocaleString()}</span>
            </div>
          ))}
          {contributions.length === 0 && <p className="text-ink-soft">No paid gifts yet.</p>}
        </div>
      </section>
    </div>
  );
}

function ItemForm({
  initial, pending, onSubmit, onCancel, onDelete,
}: {
  initial?: GiftItem; pending: boolean;
  onSubmit: (f: GiftItemInput) => void; onCancel: () => void; onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [price, setPrice] = useState<number | "">(initial?.pricePhp ?? "");
  const [store, setStore] = useState(initial?.store ?? "Shopee");
  const [url, setUrl] = useState(initial?.affiliateUrl ?? "");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr(null);
    setUploading(true);
    try {
      setImageUrl(await uploadImage(file));
    } catch (ex) {
      setErr((ex as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mt-3 rounded-xl border-2 border-rose/40 bg-white px-4 py-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2"><span className={label}>Item name</span><input value={title} onChange={(e) => setTitle(e.target.value)} className={input} placeholder="e.g. Baby stroller" /></div>
        <div><span className={label}>Price (₱, optional)</span><input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))} className={input} /></div>
        <div><span className={label}>Store</span><select value={store} onChange={(e) => setStore(e.target.value)} className={input}>{STORES.map((s) => <option key={s}>{s}</option>)}</select></div>
        <div className="sm:col-span-2"><span className={label}>Affiliate link (TikTok / Shopee / Lazada)</span><input value={url} onChange={(e) => setUrl(e.target.value)} className={input} placeholder="https://…" /></div>
        <div className="sm:col-span-2">
          <span className={label}>Photo (PNG or JPEG)</span>
          <div className="mt-1 flex items-center gap-3">
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-lg bg-blush text-[0.6rem] font-semibold text-ink-soft">IMG</div>
            )}
            <input type="file" accept="image/png,image/jpeg" onChange={onFile} className="text-sm" />
            {uploading && <span className="text-xs text-ink-soft">uploading…</span>}
          </div>
        </div>
      </div>
      {err && <p className="mt-2 text-sm text-rose-deep">{err}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <button disabled={pending || uploading || !title.trim()}
          onClick={() => onSubmit({ title, pricePhp: price === "" ? null : Number(price), store, affiliateUrl: url || null, imageUrl, sort: initial?.sort ?? 0 })}
          className="rounded-lg bg-rose px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">Save</button>
        <button onClick={onCancel} className="rounded-lg border border-blush-2 bg-white px-4 py-2 text-sm font-semibold text-ink-soft">Cancel</button>
        {onDelete && <button onClick={onDelete} disabled={pending} className="ml-auto rounded-lg border border-rose/40 px-4 py-2 text-sm font-semibold text-rose-deep">Delete</button>}
      </div>
    </div>
  );
}
