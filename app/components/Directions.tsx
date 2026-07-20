import Section from "./Section";
import MapView from "./map/MapView";
import content from "../content";

export default function Directions() {
  const d = content.directions;
  return (
    <Section id="directions" eyebrow="Getting There" title="Maps & Directions" sticker="🗺️">
      <p className="text-sm font-semibold text-ink-soft">
        {d.origin} → {d.destination} · {d.distance}. Pan &amp; zoom the map (tap{" "}
        <span className="font-extrabold text-rose-deep">Satellite / Streets</span>), then follow the
        landmark stops — they keep you off the far U-turn.
      </p>

      <div className="mt-6 rounded-[28px] border-4 border-white bg-white/80 p-2 shadow-[0_18px_44px_-22px_rgba(225,95,129,0.55)]">
        <MapView />
      </div>

      <ol className="mx-auto mt-7 max-w-md space-y-3 text-left">
        {d.steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 flex-none place-items-center rounded-full bg-rose text-sm font-extrabold text-white shadow-md">
              {i + 1}
            </span>
            <span className="rounded-2xl bg-white/75 px-4 py-2 text-sm font-semibold text-ink shadow-sm">
              {s}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-7 flex flex-wrap justify-center gap-3 text-sm font-extrabold">
        <a href={d.fromWalterMart} target="_blank" rel="noopener noreferrer"
          className="hover-boop rounded-full bg-rose px-5 py-2.5 text-white shadow-[0_10px_24px_-12px_rgba(225,95,129,0.9)]">
          🚗 From WalterMart
        </a>
        <a href={d.fromParish} target="_blank" rel="noopener noreferrer"
          className="hover-boop rounded-full bg-mint-deep px-5 py-2.5 text-white shadow-[0_10px_24px_-12px_rgba(79,184,155,0.9)]">
          ⛪ From St. Benedict
        </a>
        <a href={d.okairiPin} target="_blank" rel="noopener noreferrer"
          className="hover-boop rounded-full border-2 border-rose bg-white px-5 py-2.5 text-rose-deep">
          📍 Okairi pin
        </a>
      </div>
    </Section>
  );
}
