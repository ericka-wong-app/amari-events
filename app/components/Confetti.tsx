"use client";
import { useEffect, useState } from "react";

// Soft, muted petals drifting down — dreamy, not a bright party burst.
const COLORS = ["#cf8a97", "#efd3d9", "#f7e7ea", "#a9bfa6", "#d8b26a"];
const PIECES = Array.from({ length: 30 }, (_, i) => ({
  left: (i * 3.37 + (i % 5) * 4) % 100,
  color: COLORS[i % COLORS.length],
  delay: (i % 10) * 0.14,
  dur: 3 + (i % 6) * 0.3,
  size: 10 + (i % 4) * 3,
  drift: (i % 2 ? 1 : -1) * (14 + (i % 4) * 8),
}));

export default function Confetti({ fire }: { fire: boolean }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!fire) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const raf = requestAnimationFrame(() => setOn(true));
    const t = setTimeout(() => setOn(false), 4200);
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
            top: "-8%",
            width: p.size,
            height: p.size * 1.25,
            background: p.color,
            borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
            opacity: 0.85,
            ["--drift" as string]: `${p.drift}px`,
            animation: `petalFall ${p.dur}s cubic-bezier(0.4,0.2,0.5,1) ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes petalFall {
          to { transform: translate(var(--drift), 112vh) rotate(320deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
