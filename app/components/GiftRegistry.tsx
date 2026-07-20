import Section from "./Section";
import content from "../content";

export default function GiftRegistry() {
  const { note, items, links } = content.gift;
  return (
    <Section id="gifts" eyebrow="With Love" title="Gifts & Registry" sticker="🎁">
      <div className="rounded-3xl border-4 border-dashed border-blush-2 bg-white/70 px-6 py-6">
        <p className="mx-auto max-w-md text-sm font-semibold text-ink-soft">{note}</p>
      </div>
      {items.length > 0 && (
        <ul className="mx-auto mt-6 grid max-w-sm gap-2 text-sm">
          {items.map((it, i) => (
            <li
              key={it}
              className={`rounded-2xl border-4 border-white bg-white/80 px-4 py-2 font-semibold text-ink shadow-sm ${
                i % 2 ? "tilt-r" : "tilt-l"
              }`}
            >
              🎀 {it}
            </li>
          ))}
        </ul>
      )}
      {links.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm font-extrabold">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover-boop rounded-full bg-rose px-5 py-2.5 text-white shadow-[0_10px_24px_-12px_rgba(225,95,129,0.9)]"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </Section>
  );
}
