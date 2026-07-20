import { FloralDivider } from "./Ornaments";

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
    <section id={id} className={`w-full px-6 py-14 ${className}`}>
      <div className="mx-auto max-w-xl text-center">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-deep/80">
            {eyebrow}
          </p>
        )}
        {title && (
          <h2
            className="mt-2 font-script text-4xl text-rose-deep"
            style={{ textWrap: "balance" }}
          >
            {title}
          </h2>
        )}
        {(eyebrow || title) && (
          <FloralDivider className="mx-auto mt-4 h-5 w-40 opacity-80" />
        )}
        <div className="mt-6 text-ink">{children}</div>
      </div>
    </section>
  );
}
