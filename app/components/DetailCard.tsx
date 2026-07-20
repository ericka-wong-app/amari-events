export default function DetailCard({
  emoji,
  title,
  venue,
  address,
  time,
  accent,
  tilt,
}: {
  emoji: string;
  title: string;
  venue: string;
  address: string;
  time: string;
  accent: string;
  tilt: "tilt-l" | "tilt-r";
}) {
  return (
    <article
      className={`hover-boop ${tilt} relative rounded-[28px] border-4 border-white bg-white/85 px-6 py-7 text-center shadow-[0_18px_40px_-20px_rgba(225,95,129,0.55)]`}
    >
      <div
        className="mx-auto -mt-12 mb-2 grid h-16 w-16 place-items-center rounded-full border-4 border-white text-3xl shadow-md"
        style={{ background: accent }}
      >
        {emoji}
      </div>
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-rose-deep/80">{title}</p>
      <h3 className="mt-1 font-display text-2xl font-extrabold text-rose-deep">{venue}</h3>
      <p className="mt-2 text-sm font-semibold text-ink-soft">{address}</p>
      <p className="mt-3 inline-block rounded-full bg-blush px-4 py-1 text-sm font-extrabold text-rose-deep">
        ⏰ {time}
      </p>
    </article>
  );
}
