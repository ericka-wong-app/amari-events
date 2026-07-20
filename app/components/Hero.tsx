import content from "../content";
import { Bow, Balloon, Bunny, CrossHeart, Star } from "./Decor";

export default function Hero() {
  return (
    <header className="relative w-full overflow-hidden px-6 pt-14 pb-8 text-center">
      {/* floating balloons */}
      <span className="pointer-events-none absolute left-3 top-24 h-24 w-16 anim-float sm:left-10">
        <Balloon className="h-full w-full" fill="var(--rose)" />
      </span>
      <span className="pointer-events-none absolute right-4 top-16 h-28 w-16 anim-float-slow sm:right-12">
        <Balloon className="h-full w-full" fill="var(--grape)" />
      </span>
      <span className="pointer-events-none absolute right-6 top-40 h-20 w-12 anim-float sm:right-24">
        <Balloon className="h-full w-full" fill="var(--mint)" />
      </span>

      <div className="anim-wiggle mx-auto h-16 w-28">
        <Bow className="h-full w-full" />
      </div>
      <div className="mx-auto -mt-1 h-9 w-7">
        <CrossHeart className="h-full w-full" />
      </div>

      <p className="mt-5 inline-block rounded-full bg-white/80 px-4 py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-rose-deep shadow-[0_6px_16px_-8px_rgba(225,95,129,0.6)]">
        {content.hero.kicker}
      </p>

      <div className="relative mt-2">
        <Star className="absolute -left-1 top-2 h-5 w-5 anim-wiggle sm:left-16" />
        <Star className="absolute right-2 top-8 h-4 w-4 anim-float sm:right-20" fill="var(--grape)" />
        <h1 className="anim-pop font-script text-7xl leading-none text-rose-deep drop-shadow-[0_3px_0_rgba(255,255,255,0.8)] sm:text-8xl">
          {content.celebrant}
        </h1>
      </div>

      <p className="mt-5 inline-block rounded-full bg-rose px-5 py-2 text-sm font-bold text-white shadow-[0_10px_24px_-12px_rgba(225,95,129,0.9)]">
        🗓️ {content.dateLong}
      </p>

      <p className="mx-auto mt-6 max-w-md text-sm font-semibold leading-relaxed text-ink-soft">
        {content.hero.message}
      </p>

      <div className="mx-auto mt-6 h-28 w-24 anim-float">
        <Bunny className="h-full w-full" />
      </div>
    </header>
  );
}
