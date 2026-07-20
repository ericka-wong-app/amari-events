import Section from "./Section";
import RouteSketch from "./RouteSketch";
import content from "../content";

export default function Directions() {
  const d = content.directions;
  return (
    <Section id="directions" eyebrow="Getting There" title="Maps & Directions">
      <p className="text-sm text-ink-soft">
        {d.origin} → {d.destination} · {d.distance}. A full interactive map is coming; for now,
        follow the landmarks below — they avoid the far U-turn.
      </p>
      <div className="mt-6">
        <RouteSketch />
      </div>
      <ol className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm">
        {d.steps.map((s, i) => (
          <li key={i} className="rounded-xl bg-white/60 px-4 py-2 text-ink">
            <span className="mr-2 font-semibold text-rose-deep">{i + 1}.</span>
            {s}
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
        <a
          href={d.fromWalterMart}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-rose px-5 py-2 font-semibold text-white"
        >
          From WalterMart
        </a>
        <a
          href={d.fromParish}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full bg-sage px-5 py-2 font-semibold text-white"
        >
          From St. Benedict
        </a>
        <a
          href={d.okairiPin}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-rose px-5 py-2 font-semibold text-rose-deep"
        >
          Okairi pin
        </a>
      </div>
    </Section>
  );
}
