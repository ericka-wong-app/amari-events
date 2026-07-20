import { Petal, Flower } from "./Decor";

// Fixed (non-random) scatter so server and client render identically.
const ITEMS = [
  { c: "petal", x: 7, y: 16, s: 20, d: 0, hue: "var(--blush-2)" },
  { c: "flower", x: 88, y: 12, s: 22, d: 1.4, hue: "var(--rose)" },
  { c: "petal", x: 80, y: 30, s: 16, d: 0.6, hue: "var(--rose)" },
  { c: "petal", x: 93, y: 48, s: 18, d: 2.1, hue: "var(--blush-2)" },
  { c: "flower", x: 14, y: 42, s: 18, d: 0.3, hue: "var(--sage)" },
  { c: "petal", x: 9, y: 64, s: 20, d: 1.6, hue: "var(--rose)" },
  { c: "petal", x: 86, y: 68, s: 16, d: 0.9, hue: "var(--blush-2)" },
  { c: "flower", x: 12, y: 86, s: 20, d: 1.4, hue: "var(--rose)" },
  { c: "petal", x: 90, y: 88, s: 18, d: 0.5, hue: "var(--blush-2)" },
  { c: "petal", x: 50, y: 8, s: 14, d: 1.9, hue: "var(--rose)" },
] as const;

export default function FloatingHearts() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {ITEMS.map((it, i) => (
        <span
          key={i}
          className={`absolute opacity-60 ${it.c === "flower" ? "anim-float-slow" : "anim-float"}`}
          style={{
            left: `${it.x}%`,
            top: `${it.y}%`,
            width: it.s,
            height: it.s,
            animationDelay: `${it.d}s`,
          }}
        >
          {it.c === "flower" ? (
            <Flower className="h-full w-full" fill={it.hue} />
          ) : (
            <Petal className="h-full w-full" fill={it.hue} />
          )}
        </span>
      ))}
    </div>
  );
}
