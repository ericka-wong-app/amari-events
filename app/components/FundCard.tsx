"use client";
import { useState, useTransition } from "react";
import { startGift } from "../gift/actions";

const PRESETS = [200, 500, 1000, 2000];

export default function FundCard({
  raisedPhp,
  goalPhp,
  item,
  blurb,
  imageUrl,
}: {
  raisedPhp: number;
  goalPhp: number;
  item: string;
  blurb?: string;
  imageUrl?: string | null;
}) {
  const pct = goalPhp > 0 ? Math.min(100, Math.round((raisedPhp / goalPhp) * 100)) : 0;
  const peso = (n: number) => `₱${n.toLocaleString()}`;

  const [amount, setAmount] = useState<number>(500);
  const [custom, setCustom] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const finalAmount = custom.trim() ? Number(custom.replace(/[^\d]/g, "")) : amount;

  function give() {
    setError(null);
    start(async () => {
      try {
        const r = await startGift(finalAmount, name, message);
        if (r.ok) window.location.href = r.checkoutUrl;
        else setError(r.error);
      } catch {
        setError("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="anim-fade-up relative mx-auto w-full max-w-lg overflow-hidden rounded-[30px] border border-blush-2 bg-white/75 shadow-[0_24px_60px_-30px_rgba(183,110,125,0.6)]">
      {imageUrl && (
        <div className="relative h-56 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={item} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/95 to-transparent" />
        </div>
      )}

      <div className={`px-7 pb-8 text-center ${imageUrl ? "-mt-6" : "pt-8"}`}>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-rose-deep/75">Help us fund</p>
        <h2 className="mt-1 font-script text-4xl leading-tight text-rose-deep">{item}</h2>
        {blurb && <p className="mt-2 text-sm text-ink-soft">{blurb}</p>}

        {/* progress toward the gift */}
        <div className="mt-5 h-4 w-full overflow-hidden rounded-full border border-blush-2 bg-blush/50">
          <div className="h-full rounded-full bg-gradient-to-r from-rose to-rose-deep transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-baseline justify-between text-sm">
          <span className="font-display text-2xl font-semibold not-italic text-rose-deep">{peso(raisedPhp)}</span>
          <span className="text-ink-soft">of {peso(goalPhp)} · {pct}% there</span>
        </div>

        {/* contribute — part of the same card, framed as pitching in */}
        <div className="my-6 flex items-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-ink-soft/70">
          <span className="h-px flex-1 bg-blush-2" />Pitch in any amount<span className="h-px flex-1 bg-blush-2" />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => { setAmount(p); setCustom(""); }}
              className={`rounded-2xl border px-2 py-3 text-sm font-semibold transition ${
                !custom.trim() && amount === p
                  ? "border-rose bg-rose text-white"
                  : "border-blush-2 bg-white text-rose-deep"
              }`}
            >
              ₱{p.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="mt-2 flex items-center rounded-2xl border border-blush-2 bg-white px-3">
          <span className="text-lg text-ink-soft">₱</span>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ""))}
            inputMode="numeric" placeholder="Other amount"
            className="w-full bg-transparent px-2 py-2.5 text-base outline-none"
          />
        </div>

        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)"
          className="mt-2 w-full rounded-2xl border border-blush-2 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose" />
        <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="A short message (optional)"
          className="mt-2 w-full rounded-2xl border border-blush-2 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose" />

        <button onClick={give} disabled={pending || finalAmount < 20}
          className="hover-lift mt-4 w-full rounded-full bg-rose px-6 py-3.5 font-semibold text-white shadow-[0_16px_32px_-16px_rgba(183,110,125,0.95)] disabled:opacity-60">
          {pending ? "Opening secure checkout…" : `Fund ${peso(finalAmount || 0)}`}
        </button>
        {error && <p className="mt-3 text-sm text-rose-deep">{error}</p>}
        <p className="mt-3 text-xs text-ink-soft">Secured by PayMongo · GCash, card &amp; Maya</p>
      </div>
    </div>
  );
}
