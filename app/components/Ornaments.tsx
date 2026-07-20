export function Bow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 70" className={className} aria-hidden="true" fill="none">
      <path
        d="M60 34c-14-22-52-24-52 2 0 20 34 16 52-2 18 18 52 22 52 2 0-26-38-24-52-2Z"
        stroke="var(--rose)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M60 34c-4 10-8 22-4 34M60 34c4 10 8 22 4 34"
        stroke="var(--rose)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="60" cy="34" r="6" fill="var(--rose)" opacity=".85" />
    </svg>
  );
}

export function Cross({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={className} aria-hidden="true">
      <path
        d="M12 2v36M4 12h16"
        stroke="var(--rose)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FloralDivider({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 24" className={className} aria-hidden="true" fill="none">
      <path
        d="M10 12h70M120 12h70"
        stroke="var(--sage)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="12" r="5" fill="var(--rose)" />
      <circle cx="88" cy="12" r="3" fill="var(--sage)" />
      <circle cx="112" cy="12" r="3" fill="var(--sage)" />
    </svg>
  );
}
