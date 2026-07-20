"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { startGift } from "./actions";

const PRESETS = [200, 500, 1000, 2000];

export default function GiveForm() {
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
    <div className="anim-fade-up mx-auto max-w-md rounded-[26px] border border-blush-2 bg-white/70 px-6 py-8 text-center shadow-[0_20px_50px_-30px_rgba(183,110,125,0.65)]">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-rose-deep/75">A gift of love</p>
      <h1 className="mt-1 font-script text-4xl text-rose-deep">Send a monetary gift</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        Any amount is a blessing. Pay securely via GCash, card, or Maya.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => { setAmount(p); setCustom(""); }}
            className={`rounded-2xl border px-4 py-3 font-semibold transition ${
              !custom.trim() && amount === p
                ? "border-rose bg-rose text-white"
                : "border-blush-2 bg-white text-rose-deep"
            }`}
          >
            ₱{p.toLocaleString()}
          </button>
        ))}
      </div>

      <label className="mt-4 block text-left text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">Or enter an amount</label>
      <div className="mt-1 flex items-center rounded-2xl border border-blush-2 bg-white px-3">
        <span className="text-lg text-ink-soft">₱</span>
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ""))}
          inputMode="numeric" placeholder="Custom amount"
          className="w-full bg-transparent px-2 py-2 text-lg outline-none"
        />
      </div>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name (optional)"
        className="mt-3 w-full rounded-2xl border border-blush-2 bg-white px-3 py-2 text-sm outline-none focus:border-rose" />
      <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="A short message (optional)"
        className="mt-2 w-full rounded-2xl border border-blush-2 bg-white px-3 py-2 text-sm outline-none focus:border-rose" />

      <button onClick={give} disabled={pending || finalAmount < 20}
        className="hover-lift mt-6 w-full rounded-full bg-rose px-6 py-3.5 font-semibold text-white shadow-[0_16px_32px_-16px_rgba(183,110,125,0.95)] disabled:opacity-60">
        {pending ? "Opening secure checkout…" : `Give ₱${(finalAmount || 0).toLocaleString()}`}
      </button>
      {error && <p className="mt-3 text-sm text-rose-deep">{error}</p>}
      <p className="mt-4 text-xs text-ink-soft">Secured by PayMongo · <Link href="/" className="underline">Back to the invitation</Link></p>
    </div>
  );
}
