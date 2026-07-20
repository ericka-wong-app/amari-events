"use client";
import { useEffect, useState } from "react";
import { Bow } from "./Ornaments";
import content from "../content";

export default function IntroReveal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || sessionStorage.getItem("amari-intro-seen")) return;
    sessionStorage.setItem("amari-intro-seen", "1");
    // Toggle from callbacks (not synchronously in the effect body) so the
    // overlay paints one frame after mount and auto-dismisses.
    const raf = requestAnimationFrame(() => setShow(true));
    const t = setTimeout(() => setShow(false), 3200);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

  if (!show) return null;
  return (
    <div
      onClick={() => setShow(false)}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream/95 backdrop-blur-sm intro-fade"
      role="dialog"
      aria-label="Invitation opening"
    >
      <Bow className="h-24 w-40 intro-bow" />
      <p className="mt-6 text-xs uppercase tracking-[0.3em] text-rose-deep/70">
        {content.hero.kicker}
      </p>
      <p className="mt-2 font-script text-6xl text-rose-deep intro-name">
        {content.celebrantFirst}
      </p>
      <button className="mt-10 text-xs uppercase tracking-widest text-ink-soft underline">
        Tap to enter
      </button>
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .intro-fade { animation: introOut .6s ease 2.6s forwards; }
          .intro-bow { animation: bowIn .8s ease both; transform-origin: center; }
          .intro-name { animation: nameIn 1s ease .4s both; }
          @keyframes bowIn { from { opacity: 0; transform: scale(.6) } to { opacity: 1; transform: scale(1) } }
          @keyframes nameIn { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
          @keyframes introOut { to { opacity: 0; visibility: hidden } }
        }
      `}</style>
    </div>
  );
}
