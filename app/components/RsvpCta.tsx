import Link from "next/link";
import Section from "./Section";

export default function RsvpCta() {
  return (
    <Section id="rsvp" eyebrow="Kindly Respond" title="Will you join us?">
      <p className="text-sm leading-relaxed text-ink-soft">
        Search your name, set a private PIN, and receive your own QR pass for the day.
      </p>
      <Link
        href="/rsvp"
        className="hover-lift mt-6 inline-block rounded-full bg-rose px-9 py-3.5 text-base font-semibold tracking-wide text-white shadow-[0_16px_34px_-16px_rgba(183,110,125,0.95)]"
      >
        Find my invite
      </Link>
    </Section>
  );
}
