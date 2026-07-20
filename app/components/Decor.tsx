// Playful decorative stickers — all decorative (aria-hidden).
type P = { className?: string };

export function Heart({ className = "", fill = "var(--rose)" }: P & { fill?: string }) {
  return (
    <svg viewBox="0 0 32 30" className={className} aria-hidden="true">
      <path d="M16 28C4 20 1 13 1 8.5 1 4 4.5 1 8.5 1 12 1 14.5 3 16 5.5 17.5 3 20 1 23.5 1 27.5 1 31 4 31 8.5 31 13 28 20 16 28Z"
        fill={fill} stroke="rgba(0,0,0,.06)" strokeWidth="1" />
    </svg>
  );
}

export function Star({ className = "", fill = "var(--butter)" }: P & { fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 1.5c.8 4.4 2.6 6.2 7 7-4.4.8-6.2 2.6-7 7-.8-4.4-2.6-6.2-7-7 4.4-.8 6.2-2.6 7-7Z" fill={fill} />
    </svg>
  );
}

export function Sparkle({ className = "", fill = "#fff" }: P & { fill?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path d="M10 1c.5 3.6 1.4 4.5 5 5-3.6.5-4.5 1.4-5 5-.5-3.6-1.4-4.5-5-5 3.6-.5 4.5-1.4 5-5Z" fill={fill} />
    </svg>
  );
}

export function Bow({ className = "" }: P) {
  return (
    <svg viewBox="0 0 120 78" className={className} aria-hidden="true">
      <path d="M60 40c-16-24-56-26-56 3 0 22 38 18 56-3 18 21 56 25 56 3 0-29-40-27-56-3Z"
        fill="var(--blush-2)" stroke="var(--rose)" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M60 40c-5 12-9 26-4 38M60 40c5 12 9 26 4 38" stroke="var(--rose)" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <circle cx="60" cy="40" r="9" fill="var(--rose)" />
      <circle cx="57" cy="37" r="2.4" fill="#fff" opacity=".8" />
    </svg>
  );
}

export function Balloon({ className = "", fill = "var(--rose)" }: P & { fill?: string }) {
  return (
    <svg viewBox="0 0 44 66" className={className} aria-hidden="true">
      <ellipse cx="22" cy="22" rx="19" ry="22" fill={fill} />
      <ellipse cx="15" cy="15" rx="5" ry="7" fill="#fff" opacity=".35" />
      <path d="M22 44l-3 5h6l-3-5Z" fill={fill} />
      <path d="M22 49c4 6-4 10 0 16" stroke="var(--ink-soft)" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function CrossHeart({ className = "" }: P) {
  return (
    <svg viewBox="0 0 40 52" className={className} aria-hidden="true">
      <path d="M16 6h8v10h10v8H24v22h-8V24H6v-8h10V6Z" fill="var(--rose)" opacity=".92" />
      <path d="M20 40c-6-4-9-7.5-9-10.5 0-2.4 1.9-4 4.2-4 1.9 0 3.4 1.1 4.8 2.6 1.4-1.5 2.9-2.6 4.8-2.6 2.3 0 4.2 1.6 4.2 4C29 32.5 26 36 20 40Z" fill="var(--butter)" />
    </svg>
  );
}

export function Cloud({ className = "", fill = "#fff" }: P & { fill?: string }) {
  return (
    <svg viewBox="0 0 90 44" className={className} aria-hidden="true">
      <path d="M22 40c-10 0-18-6-18-15S13 12 21 13c3-8 12-11 19-7 5-4 15-2 16 6 8 0 14 5 14 13s-9 15-19 15H22Z" fill={fill} />
    </svg>
  );
}

export function Bunny({ className = "" }: P) {
  return (
    <svg viewBox="0 0 120 150" className={className} aria-hidden="true">
      {/* ears */}
      <ellipse cx="44" cy="42" rx="13" ry="38" fill="#fff" stroke="var(--rose)" strokeWidth="3" transform="rotate(-10 44 42)" />
      <ellipse cx="44" cy="46" rx="6" ry="28" fill="var(--blush)" transform="rotate(-10 44 46)" />
      <ellipse cx="78" cy="42" rx="13" ry="38" fill="#fff" stroke="var(--rose)" strokeWidth="3" transform="rotate(10 78 42)" />
      <ellipse cx="78" cy="46" rx="6" ry="28" fill="var(--blush)" transform="rotate(10 78 46)" />
      {/* head */}
      <circle cx="61" cy="98" r="40" fill="#fff" stroke="var(--rose)" strokeWidth="3" />
      {/* cheeks */}
      <circle cx="42" cy="104" r="7" fill="var(--blush-2)" opacity=".7" />
      <circle cx="80" cy="104" r="7" fill="var(--blush-2)" opacity=".7" />
      {/* eyes + nose */}
      <circle cx="49" cy="94" r="4" fill="var(--ink)" />
      <circle cx="73" cy="94" r="4" fill="var(--ink)" />
      <path d="M57 104h8l-4 4-4-4Z" fill="var(--rose)" />
      <path d="M61 108v5M61 113c-3 3-7 2-8-1M61 113c3 3 7 2 8-1" stroke="var(--ink-soft)" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* little bow */}
      <path d="M84 74c-5-6-14-5-14 2 0 6 9 6 14 0 5 6 14 6 14 0 0-7-9-8-14-2Z" fill="var(--rose)" />
    </svg>
  );
}

export function Scallop({ className = "", color = "var(--blush-2)" }: P & { color?: string }) {
  return (
    <svg viewBox="0 0 240 16" className={className} aria-hidden="true" preserveAspectRatio="none">
      <path d="M0 8c12 0 12-6 24-6s12 6 24 6 12-6 24-6 12 6 24 6 12-6 24-6 12 6 24 6 12-6 24-6 12 6 24 6 12-6 24-6 12 6 24 6"
        fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
