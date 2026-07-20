import content from "../content";
import { Bow, Cross } from "./Ornaments";

export default function Hero() {
  return (
    <header className="relative w-full px-6 pt-16 pb-10 text-center">
      <Bow className="mx-auto h-16 w-28" />
      <Cross className="mx-auto mt-3 h-9 w-6" />
      <p className="mt-6 text-xs uppercase tracking-[0.28em] text-ink-soft">
        {content.intro}
      </p>
      <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-rose-deep">
        {content.hero.kicker}
      </p>
      <h1
        className="mt-2 font-script text-7xl leading-none text-rose-deep"
        style={{ textWrap: "balance" }}
      >
        {content.celebrant}
      </h1>
      <p className="mt-6 text-base text-ink">{content.dateLong}</p>
      <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-ink-soft">
        {content.hero.message}
      </p>
    </header>
  );
}
