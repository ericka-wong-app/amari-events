import Link from "next/link";
import Section from "./Section";

export default function RsvpCta() {
  return (
    <Section id="rsvp" eyebrow="Kindly Respond" title="RSVP">
      <p className="text-sm text-ink-soft">
        Search your name to confirm your seat, set a private PIN, and get your QR pass for the day.
      </p>
      <Link
        href="/rsvp"
        className="mt-6 inline-block rounded-full bg-rose px-8 py-3 font-semibold text-white shadow-[0_10px_30px_-12px_rgba(201,106,114,0.7)]"
      >
        Search your name to RSVP →
      </Link>
    </Section>
  );
}
