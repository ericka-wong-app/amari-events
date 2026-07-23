export default function FundBar({
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
  return (
    <div className="mx-auto max-w-md rounded-[26px] border border-blush-2 bg-white/70 px-6 py-6 text-center shadow-[0_18px_44px_-28px_rgba(183,110,125,0.6)]">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-rose-deep/75">Group gift</p>
      <h3 className="mt-1 font-display text-2xl italic text-rose-deep">Help us gift Amari {item}</h3>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt={item} className="mx-auto mt-3 h-40 w-full max-w-xs rounded-2xl object-cover" />
      )}
      {blurb && <p className="mt-2 text-sm text-ink-soft">{blurb}</p>}

      <div className="mt-4 h-4 w-full overflow-hidden rounded-full border border-blush-2 bg-blush/50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose to-rose-deep transition-[width] duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-2 flex items-baseline justify-between text-sm">
        <span className="font-display text-xl not-italic font-semibold text-rose-deep">{peso(raisedPhp)}</span>
        <span className="text-ink-soft">of {peso(goalPhp)} goal</span>
      </div>
      <p className="mt-1 text-xs font-semibold text-ink-soft">{pct}% funded — salamat! 💕</p>
    </div>
  );
}
