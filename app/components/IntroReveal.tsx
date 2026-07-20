"use client";
import { useEffect, useState } from "react";
import { RibbonBow, Petal, Flower } from "./Decor";
import content from "../content";

export default function IntroReveal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || sessionStorage.getItem("amari-intro-seen")) return;
    sessionStorage.setItem("amari-intro-seen", "1");
    const raf = requestAnimationFrame(() => setShow(true));
    const t = setTimeout(() => setShow(false), 3400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  if (!show) return null;
  return (
    <div
      onClick={() => setShow(false)}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-cream/95 backdrop-blur-sm intro-fade"
      role="dialog"
      aria-label="Invitation opening"
    >
      <Petal className="absolute left-10 top-24 h-6 w-5 anim-float" fill="var(--rose)" />
      <Flower className="absolute right-12 top-32 h-6 w-6 anim-float-slow" fill="var(--rose)" />
      <Petal className="absolute bottom-28 right-14 h-5 w-4 anim-float" fill="var(--blush-2)" />
      <Flower className="absolute bottom-32 left-14 h-5 w-5 anim-float-slow" fill="var(--sage)" />

      <div className="h-24 w-32 anim-sway">
        <RibbonBow className="h-full w-full" />
      </div>
      <p className="mt-6 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-rose-deep/70">
        {content.hero.kicker}
      </p>
      <p className="anim-fade-up mt-1 font-script text-6xl text-rose-deep">
        {content.celebrantFirst}
      </p>
      <button className="mt-10 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-ink-soft underline">
        tap to open
      </button>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .intro-fade { animation: introOut .7s ease 2.8s forwards; }
          @keyframes introOut { to { opacity: 0; visibility: hidden } }
        }
      `}</style>
    </div>
  );
}
