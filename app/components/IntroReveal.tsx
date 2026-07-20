"use client";
import { useEffect, useState } from "react";
import { Bow, Heart, Star } from "./Decor";
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
      <Heart className="absolute left-8 top-24 h-8 w-8 anim-float" fill="var(--rose)" />
      <Star className="absolute right-10 top-32 h-7 w-7 anim-wiggle" />
      <Heart className="absolute bottom-28 right-12 h-6 w-6 anim-float" fill="var(--grape)" />
      <Star className="absolute bottom-32 left-12 h-6 w-6 anim-float-slow" fill="var(--mint-deep)" />

      <div className="h-24 w-40 anim-wiggle">
        <Bow className="h-full w-full" />
      </div>
      <p className="mt-6 text-xs font-extrabold uppercase tracking-[0.28em] text-rose-deep/70">
        {content.hero.kicker}
      </p>
      <p className="anim-pop mt-2 font-script text-6xl text-rose-deep drop-shadow-[0_2px_0_rgba(255,255,255,0.8)]">
        {content.celebrantFirst}
      </p>
      <button className="mt-10 rounded-full bg-white/80 px-5 py-2 text-xs font-extrabold uppercase tracking-widest text-rose-deep shadow">
        Tap to open 🎀
      </button>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .intro-fade { animation: introOut .6s ease 2.8s forwards; }
          @keyframes introOut { to { opacity: 0; visibility: hidden } }
        }
      `}</style>
    </div>
  );
}
