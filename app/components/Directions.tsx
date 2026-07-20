import Section from "./Section";
import StaticMap from "./map/StaticMap";
import content from "../content";

export default function Directions() {
  const d = content.directions;
  return (
    <Section id="directions" eyebrow="Getting There" title="Maps & Directions">
      <p className="text-sm leading-relaxed text-ink-soft">
        {d.origin} → {d.destination} · {d.distance}. Follow the landmark stops below — they keep you
        off the far U-turn. Tap a button to open live navigation.
      </p>

      <div className="mt-6 overflow-hidden rounded-[26px] border border-blush-2 bg-white/60 p-3 shadow-[0_16px_44px_-28px_rgba(183,110,125,0.6)]">
        <StaticMap />
        <div className="mt-1 flex flex-wrap justify-center gap-x-5 gap-y-1 pb-1 text-xs text-ink-soft">
          <span><span className="mr-1 inline-block h-1.5 w-4 rounded-full align-middle" style={{ background: "var(--sage-deep)" }} />Parish → Okairi</span>
          <span><span className="mr-1 inline-block h-1.5 w-4 rounded-full align-middle" style={{ background: "var(--rose)" }} />WalterMart → Okairi</span>
        </div>
      </div>

      <ol className="mx-auto mt-7 max-w-md space-y-3 text-left">
        {d.steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 grid h-7 w-7 flex-none place-items-center rounded-full border border-blush-2 bg-white text-xs font-semibold text-rose-deep">
              {i + 1}
            </span>
            <span className="text-sm leading-relaxed text-ink">{s}</span>
          </li>
        ))}
      </ol>

      <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm">
        <a href={d.fromWalterMart} target="_blank" rel="noopener noreferrer"
          className="hover-lift rounded-full bg-rose px-5 py-2.5 font-semibold text-white shadow-[0_12px_26px_-14px_rgba(183,110,125,0.9)]">
          From WalterMart
        </a>
        <a href={d.fromParish} target="_blank" rel="noopener noreferrer"
          className="hover-lift rounded-full bg-sage-deep px-5 py-2.5 font-semibold text-white shadow-[0_12px_26px_-14px_rgba(127,154,124,0.9)]">
          From St. Benedict
        </a>
        <a href={d.okairiPin} target="_blank" rel="noopener noreferrer"
          className="hover-lift rounded-full border border-rose bg-white px-5 py-2.5 font-semibold text-rose-deep">
          Okairi pin
        </a>
      </div>
    </Section>
  );
}
