import Section from "./Section";
import DetailCard from "./DetailCard";
import content from "../content";

export default function Details() {
  return (
    <Section id="details" eyebrow="When & Where" title="The Celebration" sticker="🎉">
      <div className="grid gap-8 pt-8 sm:grid-cols-2">
        <DetailCard emoji="⛪" accent="var(--sky)" tilt="tilt-l" {...content.ceremony} />
        <DetailCard emoji="🥳" accent="var(--butter)" tilt="tilt-r" {...content.reception} />
      </div>
    </Section>
  );
}
