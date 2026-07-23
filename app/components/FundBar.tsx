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
    <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-[30px] border border-blush-2 bg-white/70 shadow-[0_24px_60px_-30px_rgba(183,110,125,0.6)]">
      {imageUrl && (
        <div className="relative h-60 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={item} className="h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/90 to-transparent" />
        </div>
      )}
      <div className={`px-7 text-center ${imageUrl ? "-mt-4 pb-7" : "py-8"}`}>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-rose-deep/75">The Group Gift</p>
        <h2 className="mt-1 font-script text-4xl leading-tight text-rose-deep">{item}</h2>
        {blurb && <p className="mt-2 text-sm text-ink-soft">{blurb}</p>}

        <div className="mt-5 h-4 w-full overflow-hidden rounded-full border border-blush-2 bg-blush/50">
          <div className="h-full rounded-full bg-gradient-to-r from-rose to-rose-deep transition-[width] duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-2 flex items-baseline justify-between text-sm">
          <span className="font-display text-2xl not-italic font-semibold text-rose-deep">{peso(raisedPhp)}</span>
          <span className="text-ink-soft">of {peso(goalPhp)} goal</span>
        </div>
        <p className="mt-1 text-xs font-semibold text-ink-soft">{pct}% funded — salamat! 💕</p>
      </div>
    </div>
  );
}
