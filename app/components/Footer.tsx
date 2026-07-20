import content from "../content";
import { DreamyBunny, FloralDivider } from "./Decor";

export default function Footer() {
  return (
    <footer className="relative w-full px-6 py-16 text-center">
      <div className="mx-auto h-24 w-20 anim-float">
        <DreamyBunny className="h-full w-full" />
      </div>
      <p className="mt-4 font-script text-4xl text-rose-deep">{content.celebrantFirst}</p>
      <FloralDivider className="mt-3" />
      <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-ink-soft">
        {content.dateLong}
      </p>
      <p className="mt-2 font-display text-lg italic text-ink-soft">
        We can&apos;t wait to celebrate with you.
      </p>
    </footer>
  );
}
