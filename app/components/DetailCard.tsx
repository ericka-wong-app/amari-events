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
    <article className="hover-lift relative rounded-3xl border border-blush-2 bg-white/80 px-6 py-8 text-center shadow-[0_18px_48px_-26px_rgba(183,110,125,0.6)]">
      <Sprig className="absolute -top-2 left-1/2 h-4 w-16 -translate-x-1/2 opacity-80" />
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-rose-deep/85">{title}</p>
      <p className="mt-2 font-display text-5xl font-semibold not-italic leading-none text-rose-deep">{time}</p>
      <h3 className="mt-3 font-script text-3xl text-rose-deep">{venue}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{address}</p>
    </article>
  );
}
