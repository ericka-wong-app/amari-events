import Section from "./Section";

export default function RsvpCta() {
  return (
    <Section id="rsvp" eyebrow="Kindly Respond" title="RSVP">
      <p className="text-sm text-ink-soft">
        Search your name to confirm your seat and get your QR pass. RSVP opens soon — please check
        back shortly before the day.
      </p>
      <button
        type="button"
        aria-disabled="true"
        className="mt-6 cursor-not-allowed rounded-full bg-rose/60 px-8 py-3 font-semibold text-white"
      >
        RSVP — opening soon
      </button>
    </Section>
  );
}
