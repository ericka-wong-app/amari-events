import { Sprig } from "./Decor";

export default function DetailCard({
  title,
  venue,
  address,
  time,
}: {
  title: string;
  venue: string;
  address: string;
  time: string;
}) {
  return (
    <article className="hover-lift relative rounded-3xl border border-blush-2 bg-white/70 px-6 py-8 text-center shadow-[0_16px_44px_-28px_rgba(183,110,125,0.6)]">
      <Sprig className="absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 opacity-80" />
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-rose-deep/75">
        {title}
      </p>
      <h3 className="mt-2 font-display text-2xl italic text-rose-deep">{venue}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{address}</p>
      <p className="mt-4 inline-block rounded-full border border-blush-2 bg-blush/60 px-4 py-1 text-sm font-semibold tracking-wide text-rose-deep">
        {time}
      </p>
    </article>
  );
}
