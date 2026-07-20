import Reveal from "./Reveal";
import { Scallop } from "./Decor";

export default function Section({
  id,
  eyebrow,
  title,
  sticker,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  sticker?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`w-full px-6 py-12 ${className}`}>
      <Reveal className="mx-auto max-w-xl text-center">
        {eyebrow && (
          <span className="inline-block rounded-full bg-white/80 px-4 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-rose-deep shadow-[0_6px_16px_-8px_rgba(225,95,129,0.6)]">
            {eyebrow}
          </span>
        )}
        {title && (
          <h2
            className="mt-3 font-display text-4xl font-extrabold text-rose-deep"
            style={{ textWrap: "balance" }}
          >
            {sticker && <span className="mr-1 align-middle">{sticker}</span>}
            {title}
          </h2>
        )}
        {(eyebrow || title) && <Scallop className="mx-auto mt-3 h-3 w-44" />}
        <div className="mt-6 text-ink">{children}</div>
      </Reveal>
    </section>
  );
}
