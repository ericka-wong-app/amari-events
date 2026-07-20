// Delicate, dreamy decorations — all decorative (aria-hidden).
type P = { className?: string };

export function RibbonBow({ className = "" }: P) {
  return (
    <svg viewBox="0 0 150 116" className={className} aria-hidden="true" fill="none">
      {/* trailing ribbons */}
      <path d="M68 46c-9 24-2 42-16 66" stroke="var(--rose)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M82 46c9 24 2 42 16 66" stroke="var(--rose)" strokeWidth="2.4" strokeLinecap="round" />
      {/* loops */}
      <path d="M75 42C48 12 10 22 18 48c6 20 42 12 57-6" stroke="var(--rose)" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M75 42c27-30 65-20 57 6-6 20-42 12-57-6" stroke="var(--rose)" strokeWidth="2.6" strokeLinecap="round" />
      {/* inner loop hints */}
      <path d="M70 41C52 26 28 30 30 44" stroke="var(--blush-2)" strokeWidth="2" strokeLinecap="round" />
      <path d="M80 41c18-15 42-11 40 3" stroke="var(--blush-2)" strokeWidth="2" strokeLinecap="round" />
      {/* knot heart */}
      <path d="M75 36c-3-5-11-4-11 2 0 5 7 8 11 12 4-4 11-7 11-12 0-6-8-7-11-2Z" fill="var(--rose)" />
    </svg>
  );
}

export function Cross({ className = "" }: P) {
  return (
    <svg viewBox="0 0 24 40" className={className} aria-hidden="true">
      <path d="M12 3v34M4.5 13h15" stroke="var(--rose)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Sprig({ className = "", flip = false }: P & { flip?: boolean }) {
  return (
    <svg viewBox="0 0 70 30" className={className} aria-hidden="true" fill="none"
      style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M4 15c18 0 40-2 60-11" stroke="var(--sage-deep)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M20 12c-4-5-10-6-14-4 3 5 9 7 14 4Z" fill="var(--sage)" opacity=".85" />
      <path d="M36 8c-3-5-9-7-13-5 2 5 8 8 13 5Z" fill="var(--sage)" opacity=".8" />
      <path d="M50 5c-3-5-8-6-12-4 2 5 7 8 12 4Z" fill="var(--sage)" opacity=".75" />
      <circle cx="63" cy="4" r="4" fill="var(--rose)" opacity=".8" />
      <circle cx="63" cy="4" r="1.6" fill="var(--gold)" />
    </svg>
  );
}

export function FloralDivider({ className = "" }: P) {
  return (
    <div className={`flex items-center justify-center gap-2 ${className}`} aria-hidden="true">
      <Sprig flip className="h-5 w-14 opacity-90" />
      <svg viewBox="0 0 16 16" className="h-3 w-3">
        <circle cx="8" cy="8" r="4" fill="var(--rose)" opacity=".8" />
        <circle cx="8" cy="8" r="1.6" fill="var(--gold)" />
      </svg>
      <Sprig className="h-5 w-14 opacity-90" />
    </div>
  );
}

export function Petal({ className = "", fill = "var(--blush-2)" }: P & { fill?: string }) {
  return (
    <svg viewBox="0 0 20 24" className={className} aria-hidden="true">
      <path d="M10 1c6 5 8 12 0 22C2 13 4 6 10 1Z" fill={fill} opacity=".9" />
    </svg>
  );
}

export function Flower({ className = "", fill = "var(--rose)" }: P & { fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} cx="12" cy="6" rx="3.4" ry="5" fill={fill} opacity=".85"
          transform={`rotate(${a} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="3" fill="var(--gold)" />
    </svg>
  );
}

export function DreamyBunny({ className = "" }: P) {
  return (
    <svg viewBox="0 0 130 168" className={className} aria-hidden="true">
      {/* ears */}
      <path d="M47 78C36 46 40 12 51 11 62 10 58 48 58 80Z" fill="#fdf3f0" stroke="var(--rose)" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M50 70C44 48 46 22 52 21" fill="none" stroke="var(--blush-2)" strokeWidth="4" strokeLinecap="round" />
      <path d="M83 80C83 48 79 10 90 12 100 14 96 48 84 78Z" fill="#fdf3f0" stroke="var(--rose)" strokeWidth="2.4" strokeLinejoin="round" transform="rotate(6 84 46)" />
      <path d="M84 70c4-22 4-46 10-47" fill="none" stroke="var(--blush-2)" strokeWidth="4" strokeLinecap="round" transform="rotate(6 88 46)" />
      {/* body */}
      <ellipse cx="65" cy="130" rx="34" ry="30" fill="#fdf3f0" stroke="var(--rose)" strokeWidth="2.4" />
      {/* head */}
      <ellipse cx="65" cy="96" rx="33" ry="29" fill="#fdf3f0" stroke="var(--rose)" strokeWidth="2.4" />
      {/* cheeks */}
      <circle cx="47" cy="102" r="6.5" fill="var(--blush-2)" opacity=".7" />
      <circle cx="83" cy="102" r="6.5" fill="var(--blush-2)" opacity=".7" />
      {/* sleepy eyes */}
      <path d="M50 94c3 4 8 4 11 0M69 94c3 4 8 4 11 0" fill="none" stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round" />
      {/* nose + mouth */}
      <path d="M62 104h6l-3 3-3-3Z" fill="var(--rose)" />
      <path d="M65 107v3M65 110c-2 2-5 1-6-1M65 110c2 2 5 1 6-1" fill="none" stroke="var(--ink-soft)" strokeWidth="1.6" strokeLinecap="round" />
      {/* paws */}
      <ellipse cx="48" cy="150" rx="10" ry="7" fill="#fdf3f0" stroke="var(--rose)" strokeWidth="2" />
      <ellipse cx="82" cy="150" rx="10" ry="7" fill="#fdf3f0" stroke="var(--rose)" strokeWidth="2" />
      {/* little bow on ear */}
      <path d="M92 26c-4-4-11-3-11 2 0 4 7 5 11 1 4 4 11 3 11-2 0-5-7-5-11-1Z" fill="var(--rose)" />
      <circle cx="92" cy="29" r="2.4" fill="#fff" opacity=".6" />
    </svg>
  );
}
