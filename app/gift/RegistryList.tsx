"use client";
import { useState, useTransition } from "react";
import type { GiftItem } from "@/lib/gift-admin";
import { claimGift } from "./registry-actions";
import { useRouter } from "next/navigation";

export default function RegistryList({ items }: { items: GiftItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mx-auto w-full max-w-md rounded-[26px] border border-blush-2 bg-white/70 px-5 py-6 text-center shadow-[0_18px_44px_-28px_rgba(183,110,125,0.6)]">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-rose-deep/75">Gift registry</p>
      <h3 className="mt-1 font-display text-2xl italic text-rose-deep">Or pick a gift</h3>
      <p className="mt-1 text-sm text-ink-soft">Claim one so no one gifts the same thing 💕</p>
      <div className="mt-4 space-y-3">
        {items.map((it) => <ItemCard key={it.id} item={it} />)}
      </div>
    </div>
  );
}

function ItemCard({ item }: { item: GiftItem }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [claiming, setClaiming] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const claimed = Boolean(item.claimedBy);

  function submit() {
    if (!name.trim()) return;
    setError(null);
    start(async () => {
      const r = await claimGift(item.id, name);
      if (r.ok) { setClaiming(false); router.refresh(); } else setError(r.error ?? "Failed");
    });
  }

  return (
    <div className={`flex gap-3 rounded-2xl border border-blush-2 p-3 text-left ${claimed ? "opacity-70" : "bg-white/60"}`}>
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt={item.title} className="h-20 w-20 flex-none rounded-xl object-cover" />
      ) : (
        <div className="grid h-20 w-20 flex-none place-items-center rounded-xl bg-blush text-xs text-ink-soft">No photo</div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{item.title}</p>
        <p className="text-xs text-ink-soft">{item.pricePhp ? `₱${item.pricePhp.toLocaleString()}` : ""}{item.pricePhp && item.store ? " · " : ""}{item.store ?? ""}</p>

        {claimed ? (
          <p className="mt-2 inline-block rounded-full bg-sage/30 px-3 py-1 text-xs font-semibold text-sage-deep">Claimed ✓</p>
        ) : (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {item.affiliateUrl && (
              <a href={item.affiliateUrl} target="_blank" rel="noopener noreferrer" className="rounded-full border border-rose px-3 py-1 text-xs font-semibold text-rose-deep">View / buy →</a>
            )}
            {!claiming && <button onClick={() => setClaiming(true)} className="rounded-full bg-rose px-3 py-1 text-xs font-semibold text-white">Claim this</button>}
          </div>
        )}

        {claiming && !claimed && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-32 rounded-lg border border-blush-2 bg-white px-2 py-1 text-sm outline-none focus:border-rose" />
            <button onClick={submit} disabled={pending} className="rounded-full bg-rose px-3 py-1 text-xs font-semibold text-white disabled:opacity-60">{pending ? "…" : "Confirm"}</button>
            <button onClick={() => { setClaiming(false); setError(null); }} className="text-xs text-ink-soft underline">cancel</button>
          </div>
        )}
        {error && <p className="mt-1 text-xs text-rose-deep">{error}</p>}
      </div>
    </div>
  );
}
