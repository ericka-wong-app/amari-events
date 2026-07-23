import Section from "./Section";
import DetailCard from "./DetailCard";
import PhotoStrip from "./PhotoStrip";
import type { EventDetails } from "@/lib/event-details";

export default function Details({ details }: { details: EventDetails }) {
  const { ceremony, reception } = details;
  return (
    <Section id="details" eyebrow="When & Where" title="The Celebration">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <DetailCard title={ceremony.title} venue={ceremony.venue} address={ceremony.address} time={ceremony.time} />
          <PhotoStrip photos={ceremony.photos} alt={ceremony.venue} />
        </div>
        <div>
          <DetailCard title={reception.title} venue={reception.venue} address={reception.address} time={reception.time} />
          <PhotoStrip photos={reception.photos} alt={reception.venue} />
        </div>
      </div>

      <p className="mx-auto mt-6 max-w-xl rounded-2xl border border-blush-2 bg-blush/40 px-5 py-3 text-center text-sm text-ink">
        Joining the <strong className="text-rose-deep">reception only</strong>? Come straight to {reception.venue} at{" "}
        <strong className="text-rose-deep">{reception.time}</strong>.
      </p>
    </Section>
  );
}
