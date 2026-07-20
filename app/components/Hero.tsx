import content from "../content";
import { RibbonBow, Cross, DreamyBunny, Sprig, Flower } from "./Decor";

export default function Hero() {
  return (
    <header className="relative w-full overflow-hidden px-6 pt-14 pb-10 text-center">
      {/* soft corner florals */}
      <Sprig className="pointer-events-none absolute left-2 top-28 h-6 w-20 opacity-70 anim-float" />
      <Sprig flip className="pointer-events-none absolute right-2 top-24 h-6 w-20 opacity-70 anim-float-slow" />
      <Flower className="pointer-events-none absolute left-6 top-52 h-5 w-5 opacity-70 anim-float" fill="var(--rose)" />
      <Flower className="pointer-events-none absolute right-8 top-64 h-4 w-4 opacity-60 anim-float-slow" fill="var(--sage)" />

      <div className="anim-sway mx-auto h-20 w-28">
        <RibbonBow className="h-full w-full" />
      </div>
      <div className="mx-auto -mt-2 h-9 w-6">
        <Cross className="h-full w-full" />
      </div>

      <p className="anim-fade mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-rose-deep/75">
        {content.hero.kicker}
      </p>

      <h1 className="anim-fade-up mt-1 font-script text-7xl leading-[0.95] text-rose-deep sm:text-8xl">
        {content.celebrant}
      </h1>

      <div className="mt-5 flex items-center justify-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink-soft">
        <Sprig flip className="h-3 w-9 opacity-80" />
        {content.dateLong}
        <Sprig className="h-3 w-9 opacity-80" />
      </div>

      <p className="mx-auto mt-7 max-w-md font-display text-lg italic leading-relaxed text-ink-soft">
        {content.hero.message}
      </p>

      <div className="mx-auto mt-8 h-32 w-28 anim-float">
        <DreamyBunny className="h-full w-full" />
      </div>
    </header>
  );
}
