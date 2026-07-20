"use client";
import { useEffect, useState } from "react";

const COLORS = ["#f0819a", "#ffe08a", "#9fe0cf", "#cdb4f0", "#ffc4a3", "#bcdcf5"];
// Fixed pieces so there is no server/client mismatch and no reliance on RNG timing.
const PIECES = Array.from({ length: 44 }, (_, i) => ({
  left: (i * 2.27 + (i % 5) * 3) % 100,
  color: COLORS[i % COLORS.length],
  delay: (i % 11) * 0.06,
  dur: 1.6 + (i % 7) * 0.18,
  size: 7 + (i % 4) * 2,
  rot: (i * 47) % 360,
  round: i % 3 === 0,
}));

export default function Confetti({ fire }: { fire: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!fire) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const raf = requestAnimationFrame(() => setOn(true));
    const t = setTimeout(() => setOn(false), 2600);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [fire]);

  if (!on) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {PIECES.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-6%",
            width: p.size,
            height: p.size * (p.round ? 1 : 1.6),
            background: p.color,
            borderRadius: p.round ? "50%" : "2px",
            transform: `rotate(${p.rot}deg)`,
            animation: `confettiFall ${p.dur}s cubic-bezier(0.3,0.6,0.4,1) ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          to { transform: translateY(112vh) rotate(720deg); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
}
