import Reveal from "./Reveal";
import { FloralDivider } from "./Decor";

export default function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`w-full px-6 py-12 ${className}`}>
      <Reveal className="mx-auto max-w-xl text-center">
        {eyebrow && (
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-rose-deep/75">
            {eyebrow}
          </p>
        )}
        {title && (
          <h2
            className="mt-2 font-display text-[2.4rem] font-medium italic leading-tight text-rose-deep"
            style={{ textWrap: "balance" }}
          >
            {title}
          </h2>
        )}
        {(eyebrow || title) && <FloralDivider className="mt-4" />}
        <div className="mt-6 text-ink">{children}</div>
      </Reveal>
    </section>
  );
}
