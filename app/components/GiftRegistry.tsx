import Link from "next/link";
import Section from "./Section";
import content from "../content";

export default function GiftRegistry() {
  const { note, items, links } = content.gift;
  return (
    <Section id="gifts" eyebrow="With Love" title="Gifts & Registry">
      <div className="rounded-3xl border border-blush-2 bg-white/55 px-6 py-6">
        <p className="mx-auto max-w-md text-sm leading-relaxed text-ink-soft">{note}</p>
        <Link
          href="/gift"
          className="hover-lift mt-4 inline-block rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_-16px_rgba(183,110,125,0.9)]"
        >
          Send a monetary gift
        </Link>
      </div>
      {items.length > 0 && (
        <ul className="mx-auto mt-6 grid max-w-sm gap-2 text-sm">
          {items.map((it) => (
            <li key={it} className="rounded-2xl border border-blush-2 bg-white/60 px-4 py-2 text-ink">
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
              className="hover-lift rounded-full bg-rose px-5 py-2.5 font-semibold text-white shadow-[0_12px_26px_-14px_rgba(183,110,125,0.9)]"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </Section>
  );
}
