import Section from "./Section";
import content from "../content";

// Real, accurate Google map of the reception (the venue guests actually need
// help finding). Buttons hand off to live turn-by-turn navigation.
const OKAIRI = "14.292292,121.109198";

export default function Directions() {
  const d = content.directions;
  const btn = "hover-lift rounded-full px-5 py-2.5 font-semibold shadow-[0_12px_26px_-14px_rgba(183,110,125,0.9)]";
  return (
    <Section id="directions" eyebrow="Getting There" title="Maps & Directions">
      <p className="text-sm leading-relaxed text-ink-soft">
        The reception is at <strong className="text-rose-deep">{d.destination}</strong>, inside La Joya Subdivision,
        Santa Rosa. Use the live map below, or tap a button for turn-by-turn directions from where you are.
      </p>

      <div className="mt-5 overflow-hidden rounded-[26px] border border-blush-2 shadow-[0_18px_48px_-28px_rgba(183,110,125,0.6)]">
        <iframe
          title="Map to Okairi reception"
          src={`https://maps.google.com/maps?q=${OKAIRI}&z=16&hl=en&output=embed`}
          className="h-72 w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
        <a href={d.fromWalterMart} target="_blank" rel="noopener noreferrer" className={`${btn} bg-rose text-white`}>
          Directions from WalterMart
        </a>
        <a href={d.fromParish} target="_blank" rel="noopener noreferrer" className={`${btn} bg-sage-deep text-white`}>
          From St. Benedict
        </a>
        <a href={d.okairiPin} target="_blank" rel="noopener noreferrer" className={`${btn} border border-rose bg-white text-rose-deep`}>
          Open Okairi pin
        </a>
      </div>
    </Section>
  );
}
