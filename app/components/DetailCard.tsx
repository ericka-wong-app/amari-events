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
    <article className="rounded-3xl border border-blush-2 bg-white/70 px-6 py-7 text-center shadow-[0_12px_40px_-24px_rgba(201,106,114,0.5)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-deep/80">
        {title}
      </p>
      <h3 className="mt-2 font-script text-3xl text-rose-deep">{venue}</h3>
      <p className="mt-2 text-sm text-ink-soft">{address}</p>
      <p className="mt-3 inline-block rounded-full bg-blush px-4 py-1 text-sm font-semibold text-rose-deep">
        {time}
      </p>
    </article>
  );
}
