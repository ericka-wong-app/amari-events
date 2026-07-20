import Section from "./Section";
import DetailCard from "./DetailCard";
import content from "../content";

export default function Details() {
  return (
    <Section id="details" eyebrow="When & Where" title="The Celebration">
      <div className="grid gap-6 sm:grid-cols-2">
        <DetailCard {...content.ceremony} />
        <DetailCard {...content.reception} />
      </div>
    </Section>
  );
}
