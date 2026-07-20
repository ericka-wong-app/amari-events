import content from "../content";
import { Bunny, Heart } from "./Decor";

export default function Footer() {
  return (
    <footer className="relative w-full px-6 py-14 text-center">
      <div className="mx-auto h-24 w-20 anim-float">
        <Bunny className="h-full w-full" />
      </div>
      <div className="mt-3 flex items-center justify-center gap-2">
        <Heart className="h-4 w-4 anim-wiggle" />
        <p className="font-script text-4xl text-rose-deep">{content.celebrantFirst}</p>
        <Heart className="h-4 w-4 anim-wiggle" fill="var(--grape)" />
      </div>
      <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.18em] text-ink-soft">
        {content.dateLong}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink-soft">
        We can&apos;t wait to celebrate with you! 🎈
      </p>
    </footer>
  );
}
