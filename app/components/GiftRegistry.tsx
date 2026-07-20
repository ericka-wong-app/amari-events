import Section from "./Section";
import content from "../content";

export default function GiftRegistry() {
  const { note, items, links } = content.gift;
  return (
    <Section id="gifts" eyebrow="With Love" title="Gifts & Registry">
      <p className="mx-auto max-w-md text-sm text-ink-soft">{note}</p>
      {items.length > 0 && (
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-sm">
          {items.map((it) => (
            <li key={it} className="rounded-xl bg-white/60 px-4 py-2 text-ink">
              {it}
            </li>
          ))}
        </ul>
      )}
      {links.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-rose px-5 py-2 font-semibold text-white"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </Section>
  );
}
