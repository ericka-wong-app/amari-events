import Link from "next/link";
import Section from "./Section";

export default function RsvpCta() {
  return (
    <Section id="rsvp" eyebrow="Kindly Respond" title="Will you join us?" sticker="💌">
      <p className="text-sm font-semibold text-ink-soft">
        Search your name, set a secret PIN, and grab your very own QR pass for the big day!
      </p>
      <Link
        href="/rsvp"
        className="hover-boop mt-6 inline-block rounded-full bg-rose px-9 py-4 text-lg font-extrabold text-white shadow-[0_16px_34px_-14px_rgba(225,95,129,0.95)]"
      >
        🎀 Find my invite &amp; RSVP
      </Link>
    </Section>
  );
}
