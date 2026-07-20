import content from "../content";
import { Bow } from "./Ornaments";

export default function Footer() {
  return (
    <footer className="w-full px-6 py-12 text-center">
      <Bow className="mx-auto h-12 w-24 opacity-80" />
      <p className="mt-4 font-script text-3xl text-rose-deep">{content.celebrantFirst}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-ink-soft">
        {content.dateLong} · We can’t wait to celebrate with you
      </p>
    </footer>
  );
}
