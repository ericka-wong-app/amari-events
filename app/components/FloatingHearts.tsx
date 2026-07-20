import { Heart, Star, Cloud, Sparkle } from "./Decor";

// Fixed (non-random) scatter so server and client render identically.
const ITEMS = [
  { c: "heart", x: 6, y: 14, s: 26, d: 0, hue: "var(--rose)" },
  { c: "star", x: 88, y: 10, s: 20, d: 1.2, hue: "var(--butter)" },
  { c: "cloud", x: 72, y: 26, s: 54, d: 0.6, hue: "#ffffff" },
  { c: "heart", x: 92, y: 44, s: 18, d: 2.1, hue: "var(--grape)" },
  { c: "sparkle", x: 16, y: 40, s: 16, d: 0.3, hue: "var(--mint-deep)" },
  { c: "heart", x: 10, y: 62, s: 22, d: 1.6, hue: "var(--peach)" },
  { c: "star", x: 84, y: 66, s: 18, d: 0.9, hue: "var(--rose)" },
  { c: "cloud", x: 8, y: 84, s: 48, d: 1.4, hue: "#ffffff" },
  { c: "heart", x: 90, y: 86, s: 20, d: 0.5, hue: "var(--rose)" },
  { c: "sparkle", x: 50, y: 6, s: 14, d: 1.9, hue: "var(--grape)" },
  { c: "star", x: 30, y: 93, s: 16, d: 0.7, hue: "var(--butter)" },
] as const;

function Glyph({ c, hue }: { c: string; hue: string }) {
  const cls = "h-full w-full";
  if (c === "heart") return <Heart className={cls} fill={hue} />;
  if (c === "star") return <Star className={cls} fill={hue} />;
  if (c === "sparkle") return <Sparkle className={cls} fill={hue} />;
  return <Cloud className={cls} fill={hue} />;
}

export default function FloatingHearts() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {ITEMS.map((it, i) => (
        <span
          key={i}
          className={`absolute opacity-70 ${it.c === "cloud" ? "anim-float-slow" : "anim-float"}`}
          style={{
            left: `${it.x}%`,
            top: `${it.y}%`,
            width: it.s,
            height: it.s,
            animationDelay: `${it.d}s`,
          }}
        >
          <Glyph c={it.c} hue={it.hue} />
        </span>
      ))}
    </div>
  );
}
