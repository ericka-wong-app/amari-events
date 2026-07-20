# Phase 1: Static Invitation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete, deployable pink/bow/floral invitation page for Amari Wong's baptism — every content section plus an animated intro reveal — so the Vercel URL shows the real invite.

**Architecture:** A single scrolling Next.js App Router page assembled from focused server components, with one client component for the intro animation. **All event copy lives in one config file (`app/content.ts`)** so the host edits names/times/links in one place. Interactive Leaflet map, RSVP flow, and admin come in later phase-plans; Phase 1 ships a static route **sketch** and a styled RSVP call-to-action.

**Tech Stack:** Next.js 16.2.10 (App Router), React 19, Tailwind 4 (`@theme inline`), TypeScript, `next/font/google`, Vitest + React Testing Library (content-integrity tests).

## Global Constraints

- **Next.js 16.2.10, App Router.** Before using any non-obvious API, skim the matching doc under `node_modules/next/dist/docs/01-app/`. Metadata via `export const metadata`; fonts via `next/font/google` (already proven in the scaffold).
- **Tailwind 4**, configured in `app/globals.css` via `@import "tailwindcss";` + `@theme inline { … }`. **No `tailwind.config.js`.**
- **Single source of content:** every guest-facing string, date, address, name, and link lives in `app/content.ts`. Components import from it; no hardcoded copy in components.
- **Single committed light theme.** Remove the starter's `prefers-color-scheme: dark` block — this is a romantic invitation, not a themeable app.
- **Accessibility & motion:** all animation wrapped in `@media (prefers-reduced-motion: no-preference)`; visible keyboard focus; semantic landmarks.
- **Mobile-first.** Primary audience opens on phones; design for ~360px up, enhance for wider.
- **No external CDN links** for fonts/assets — use `next/font` and in-repo/inline SVG.
- **Fixed event facts (verbatim):** Celebrant **Amari Wong**; **Sunday, July 26, 2026**; Ceremony **St. Benedict Parish, Ayala Westgrove, Santa Rosa, Laguna — 2:00 PM**; Reception **Okairi, B2 L10 Phase 1, La Joya Subd., Brgy. Dila, Santa Rosa, Laguna — 4:00 PM**.
- **Frequent commits**; push to `origin main` only at the end of the phase (auto-deploys to Vercel).

## File Structure

- `app/content.ts` — **create.** Typed single source of all event content.
- `app/globals.css` — **rewrite.** Design tokens, gingham background, base type, motion guard.
- `app/layout.tsx` — **modify.** Script + sans fonts, real metadata, body shell.
- `app/page.tsx` — **rewrite.** Assemble sections in order.
- `app/components/IntroReveal.tsx` — **create.** Client: animated ribbon reveal overlay.
- `app/components/Section.tsx` — **create.** Shared section shell (eyebrow + heading + body).
- `app/components/Ornaments.tsx` — **create.** Inline decorative SVGs (bow, cross, floral divider).
- `app/components/Hero.tsx` — **create.**
- `app/components/DetailCard.tsx` — **create.** Reusable venue/time card.
- `app/components/Details.tsx` — **create.** Ceremony + Reception via `DetailCard`.
- `app/components/Godparents.tsx` — **create.**
- `app/components/RouteSketch.tsx` — **create.** The schematic route SVG (from the approved sketch).
- `app/components/Directions.tsx` — **create.** RouteSketch + landmark steps + addresses (map = Phase 2).
- `app/components/RsvpCta.tsx` — **create.** Styled RSVP call-to-action (wired in Phase 3).
- `app/components/GiftRegistry.tsx` — **create.** Gift note + item list + links.
- `app/components/Footer.tsx` — **create.**
- `vitest.config.ts`, `vitest.setup.ts` — **create.** Test harness.
- `app/__tests__/content-integrity.test.tsx` — **create.** Renders page, asserts key facts.

---

### Task 1: Content config + theme foundation

**Files:**
- Create: `app/content.ts`
- Modify: `app/globals.css` (full rewrite)
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: `content` object (default export) consumed by every section. Shape below is the contract later tasks rely on.

- [ ] **Step 1: Create `app/content.ts`** — single source of truth. Fields the host will refine are marked with `// TODO(host)` but hold sensible defaults so nothing renders empty.

```ts
// app/content.ts — the ONLY place to edit event copy.
export type Godparent = { name: string; role: "Ninong" | "Ninang" };
export type RegistryLink = { label: string; href: string };

export const content = {
  celebrant: "Amari Wong",
  celebrantFirst: "Amari",
  eventType: "Baptism",
  intro: "Join us for a special day of faith and love.",
  dateLong: "Sunday, July 26, 2026",
  dateISO: "2026-07-26",
  hero: {
    kicker: "Celebrating the Baptism of",
    message:
      "Celebrate this meaningful milestone with us as we gather with family and friends to witness this special occasion. Your presence will make this day even more memorable.",
  },
  ceremony: {
    title: "The Ceremony",
    venue: "St. Benedict Parish",
    address: "Ayala Westgrove, Santa Rosa, Laguna",
    time: "2:00 PM",
  },
  reception: {
    title: "The Reception",
    venue: "Okairi",
    address: "B2 L10 Phase 1, La Joya Subd., Brgy. Dila, Santa Rosa, Laguna",
    time: "4:00 PM",
  },
  godparents: {
    // TODO(host): replace with the real list.
    callTime: "Kindly arrive by 1:30 PM at St. Benedict Parish.",
    dressCode: "Dress code: soft pastels (blush, sage, cream).",
    note: "Please proceed to the reserved front pews before the rite begins.",
    list: [] as Godparent[], // e.g. [{ name: "Juan Dela Cruz", role: "Ninong" }]
  },
  directions: {
    origin: "WalterMart Santa Rosa",
    destination: "Okairi",
    distance: "~7.8 km",
    steps: [
      "From WalterMart Santa Rosa, head east on Santa Rosa–Tagaytay Rd (Balibago Rd).",
      "Pass Mima The Baker's Partner — stay on the main road.",
      "Turn right toward Turquoise Rd → Diamond Rd, south past Balibago Market.",
      "Continue via Zircon Rd → Pearl Rd onto La Joya de Sta. Rosa Road.",
      "Do NOT take the straight AH26 center road (that forces the far U-turn) — keep right and follow the curve.",
      "Pass the Shell + McDonald's at the Amethyst Rd light, then J&T Express, then the LA JOYA / Kasa Joya gate (Alfamart on the corner).",
      "Turn into La Joya Subdivision → Blue Palm Street → arrive at Okairi.",
    ],
    // Fallback handoff links, pre-aimed at the correct pins:
    okairiPin: "https://maps.app.goo.gl/EFdo9ihkCGqpvcCH8",
    fromWalterMart: "https://maps.app.goo.gl/5SyjT2iouahqDf9E9",
    fromParish:
      "https://www.google.com/maps/dir/?api=1&origin=St%20Benedict%20Parish%2C%20Ayala%20Westgrove%2C%20City%20of%20Santa%20Rosa%2C%20Laguna&destination=Okairi%2C%20B2%20L10%20Ph1%20La%20Joya%20Subd.%2C%20Brgy%20Dila%2C%20Santa%20Rosa%2C%20Laguna&travelmode=driving",
  },
  gift: {
    note: "Your presence is the greatest gift. Should you wish to give more, monetary gifts are warmly welcome.",
    items: [
      // TODO(host): curate. Defaults keep the section from looking empty.
      "Books & keepsakes for Amari",
      "Baby essentials",
    ],
    links: [] as RegistryLink[], // e.g. [{ label: "GCash", href: "..." }]
  },
} as const;

export default content;
```

- [ ] **Step 2: Rewrite `app/globals.css`** — tokens, gingham, base type, motion guard. Replaces the starter file entirely.

```css
@import "tailwindcss";

:root {
  --cream: #fdf6f2;
  --blush: #fbeef0;
  --blush-2: #f7dde1;
  --rose: #d17b83;
  --rose-deep: #c96a72;
  --sage: #9db89a;
  --ink: #5b4a4d;
  --ink-soft: #8a7478;
  --gold: #e6b800;
  --gingham: rgba(224, 150, 157, 0.22);
}

@theme inline {
  --color-cream: var(--cream);
  --color-blush: var(--blush);
  --color-blush-2: var(--blush-2);
  --color-rose: var(--rose);
  --color-rose-deep: var(--rose-deep);
  --color-sage: var(--sage);
  --color-ink: var(--ink);
  --color-ink-soft: var(--ink-soft);
  --font-script: var(--font-script);
  --font-sans: var(--font-body);
}

html { color: var(--ink); scroll-behavior: smooth; }

/* Gingham check: two overlapping translucent grids darken at intersections */
body {
  font-family: var(--font-body), system-ui, sans-serif;
  background-color: var(--cream);
  background-image:
    repeating-linear-gradient(0deg, var(--gingham) 0 22px, transparent 22px 44px),
    repeating-linear-gradient(90deg, var(--gingham) 0 22px, transparent 22px 44px);
  background-attachment: fixed;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
}

:where(a, button):focus-visible {
  outline: 2px solid var(--rose-deep);
  outline-offset: 3px;
  border-radius: 6px;
}
```

- [ ] **Step 3: Update `app/layout.tsx`** — script + body fonts, real metadata.

```tsx
import type { Metadata } from "next";
import { Dancing_Script, Nunito } from "next/font/google";
import "./globals.css";

const script = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["400", "700"],
});
const body = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Amari's Baptism · July 26, 2026",
  description:
    "Join us for the baptism of Amari Wong — Sunday, July 26, 2026 at St. Benedict Parish, with reception to follow at Okairi.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${script.variable} ${body.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 4: Verify build compiles**

Run: `npm run build`
Expected: build succeeds (page still starter content — replaced in Task 11). If `next/font` errors, confirm network access during build.

- [ ] **Step 5: Commit**

```bash
git add app/content.ts app/globals.css app/layout.tsx
git commit -m "feat(phase1): content config + pink/gingham theme foundation"
```

---

### Task 2: Test harness + content-integrity test

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `app/__tests__/content-integrity.test.tsx`
- Modify: `package.json` (add `test` script + devDeps)

**Interfaces:**
- Consumes: `content` (Task 1), `Home` page (Task 11 — test fails until then, by design).
- Produces: `npm test` command used as the gate for later tasks.

- [ ] **Step 1: Install dev deps**

Run: `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom`

- [ ] **Step 2: Add test script to `package.json`** (in `"scripts"`): `"test": "vitest run"`.

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: { environment: "jsdom", globals: true, setupFiles: ["./vitest.setup.ts"] },
});
```

- [ ] **Step 4: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Write the failing content-integrity test** — asserts the facts that must never be wrong on an invite.

```tsx
import { render, screen } from "@testing-library/react";
import Home from "../page";

test("invitation shows the essential facts", () => {
  render(<Home />);
  expect(screen.getByText(/Amari/)).toBeInTheDocument();
  expect(screen.getByText(/July 26, 2026/)).toBeInTheDocument();
  expect(screen.getByText(/St\. Benedict Parish/)).toBeInTheDocument();
  expect(screen.getByText(/Okairi/)).toBeInTheDocument();
  expect(screen.getByText(/2:00 PM/)).toBeInTheDocument();
  expect(screen.getByText(/4:00 PM/)).toBeInTheDocument();
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Home` still renders starter markup without these strings (or import error). This is expected until Task 11.

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts vitest.setup.ts app/__tests__ package.json package-lock.json
git commit -m "test(phase1): add content-integrity test harness (red)"
```

---

### Task 3: Shared UI — Section shell + ornaments

**Files:**
- Create: `app/components/Section.tsx`, `app/components/Ornaments.tsx`

**Interfaces:**
- Produces:
  - `Section({ id?, eyebrow?, title?, children, className? })` — server component wrapper.
  - `Bow()`, `Cross()`, `FloralDivider()` — inline SVG ornaments (decorative, `aria-hidden`).

- [ ] **Step 1: Create `app/components/Ornaments.tsx`**

```tsx
export function Bow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 70" className={className} aria-hidden="true" fill="none">
      <path d="M60 34c-14-22-52-24-52 2 0 20 34 16 52-2 18 18 52 22 52 2 0-26-38-24-52-2Z"
        stroke="var(--rose)" strokeWidth="3" strokeLinejoin="round" />
      <path d="M60 34c-4 10-8 22-4 34M60 34c4 10 8 22 4 34"
        stroke="var(--rose)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="60" cy="34" r="6" fill="var(--rose)" opacity=".85" />
    </svg>
  );
}
export function Cross({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 40" className={className} aria-hidden="true">
      <path d="M12 2v36M4 12h16" stroke="var(--rose)" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
export function FloralDivider({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 24" className={className} aria-hidden="true" fill="none">
      <path d="M10 12h70M120 12h70" stroke="var(--sage)" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="100" cy="12" r="5" fill="var(--rose)" />
      <circle cx="88" cy="12" r="3" fill="var(--sage)" />
      <circle cx="112" cy="12" r="3" fill="var(--sage)" />
    </svg>
  );
}
```

- [ ] **Step 2: Create `app/components/Section.tsx`**

```tsx
import { FloralDivider } from "./Ornaments";

export default function Section({
  id, eyebrow, title, children, className = "",
}: {
  id?: string; eyebrow?: string; title?: string;
  children: React.ReactNode; className?: string;
}) {
  return (
    <section id={id} className={`w-full px-6 py-14 ${className}`}>
      <div className="mx-auto max-w-xl text-center">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-deep/80">
            {eyebrow}
          </p>
        )}
        {title && (
          <h2 className="mt-2 font-script text-4xl text-rose-deep" style={{ textWrap: "balance" }}>
            {title}
          </h2>
        )}
        {(eyebrow || title) && <FloralDivider className="mx-auto mt-4 h-5 w-40 opacity-80" />}
        <div className="mt-6 text-ink">{children}</div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/components/Section.tsx app/components/Ornaments.tsx
git commit -m "feat(phase1): shared Section shell + SVG ornaments"
```

---

### Task 4: Intro reveal (animated)

**Files:**
- Create: `app/components/IntroReveal.tsx`

**Interfaces:**
- Consumes: `content.celebrantFirst`.
- Produces: `<IntroReveal />` — client overlay that plays once per tab session, auto-dismisses, is skippable, and is inert under reduced-motion.

- [ ] **Step 1: Create `app/components/IntroReveal.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { Bow } from "./Ornaments";
import content from "../content";

export default function IntroReveal() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || sessionStorage.getItem("amari-intro-seen")) return;
    setShow(true);
    sessionStorage.setItem("amari-intro-seen", "1");
    const t = setTimeout(() => setShow(false), 3200);
    return () => clearTimeout(t);
  }, []);

  if (!show) return null;
  return (
    <div
      onClick={() => setShow(false)}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-cream/95 backdrop-blur-sm intro-fade"
      role="dialog" aria-label="Invitation opening"
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
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/IntroReveal.tsx
git commit -m "feat(phase1): animated intro reveal (reduced-motion safe, once per session)"
```

---

### Task 5: Hero

**Files:**
- Create: `app/components/Hero.tsx`

**Interfaces:**
- Consumes: `content` (celebrant, hero, dateLong), `Bow`, `Cross`.

- [ ] **Step 1: Create `app/components/Hero.tsx`**

```tsx
import content from "../content";
import { Bow, Cross } from "./Ornaments";

export default function Hero() {
  return (
    <header className="relative w-full px-6 pt-16 pb-10 text-center">
      <Bow className="mx-auto h-16 w-28" />
      <Cross className="mx-auto mt-3 h-9 w-6" />
      <p className="mt-6 text-xs uppercase tracking-[0.28em] text-ink-soft">{content.intro}</p>
      <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-rose-deep">
        {content.hero.kicker}
      </p>
      <h1 className="mt-2 font-script text-7xl leading-none text-rose-deep" style={{ textWrap: "balance" }}>
        {content.celebrant}
      </h1>
      <p className="mt-6 text-base text-ink">{content.dateLong}</p>
      <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-ink-soft">
        {content.hero.message}
      </p>
    </header>
  );
}
```

- [ ] **Step 2: Type-check** — Run: `npx tsc --noEmit` — Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/Hero.tsx
git commit -m "feat(phase1): hero section"
```

---

### Task 6: Details (Ceremony + Reception)

**Files:**
- Create: `app/components/DetailCard.tsx`, `app/components/Details.tsx`

**Interfaces:**
- Consumes: `content.ceremony`, `content.reception`, `Section`.
- Produces: `DetailCard({ title, venue, address, time })`.

- [ ] **Step 1: Create `app/components/DetailCard.tsx`**

```tsx
export default function DetailCard({
  title, venue, address, time,
}: { title: string; venue: string; address: string; time: string }) {
  return (
    <article className="rounded-3xl border border-blush-2 bg-white/70 px-6 py-7 text-center shadow-[0_12px_40px_-24px_rgba(201,106,114,0.5)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-rose-deep/80">{title}</p>
      <h3 className="mt-2 font-script text-3xl text-rose-deep">{venue}</h3>
      <p className="mt-2 text-sm text-ink-soft">{address}</p>
      <p className="mt-3 inline-block rounded-full bg-blush px-4 py-1 text-sm font-semibold text-rose-deep">
        {time}
      </p>
    </article>
  );
}
```

- [ ] **Step 2: Create `app/components/Details.tsx`**

```tsx
import Section from "./Section";
import DetailCard from "./DetailCard";
import content from "../content";

export default function Details() {
  return (
    <Section id="details" eyebrow="When & Where" title="The Celebration">
      <div className="grid gap-5 sm:grid-cols-2">
        <DetailCard {...content.ceremony} />
        <DetailCard {...content.reception} />
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Type-check** — Run: `npx tsc --noEmit` — Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/components/DetailCard.tsx app/components/Details.tsx
git commit -m "feat(phase1): ceremony + reception detail cards"
```

---

### Task 7: Godparents (Ninong & Ninang)

**Files:**
- Create: `app/components/Godparents.tsx`

**Interfaces:**
- Consumes: `content.godparents`, `Section`. Renders the named list when present; always shows call time + dress code + note.

- [ ] **Step 1: Create `app/components/Godparents.tsx`**

```tsx
import Section from "./Section";
import content from "../content";

export default function Godparents() {
  const { list, callTime, dressCode, note } = content.godparents;
  const ninong = list.filter((g) => g.role === "Ninong");
  const ninang = list.filter((g) => g.role === "Ninang");
  return (
    <Section id="godparents" eyebrow="With Gratitude" title="Ninong & Ninang">
      {list.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 text-sm">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-rose-deep">Ninong</p>
            <ul className="mt-2 space-y-1 text-ink">{ninong.map((g) => <li key={g.name}>{g.name}</li>)}</ul>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-rose-deep">Ninang</p>
            <ul className="mt-2 space-y-1 text-ink">{ninang.map((g) => <li key={g.name}>{g.name}</li>)}</ul>
          </div>
        </div>
      )}
      <div className="mt-6 space-y-2 rounded-2xl bg-white/60 px-5 py-5 text-sm text-ink-soft">
        <p>{callTime}</p>
        <p>{dressCode}</p>
        <p>{note}</p>
      </div>
    </Section>
  );
}
```

- [ ] **Step 2: Type-check** — Run: `npx tsc --noEmit` — Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/Godparents.tsx
git commit -m "feat(phase1): Ninong & Ninang section (named list + instructions)"
```

---

### Task 8: Directions (route sketch + steps)

**Files:**
- Create: `app/components/RouteSketch.tsx`, `app/components/Directions.tsx`

**Interfaces:**
- Consumes: `content.directions`, `Section`.
- Produces: `<RouteSketch />` (self-contained schematic SVG). **Note:** the pan/zoom Leaflet map is Phase 2; Phase 1 ships the static sketch + landmark steps + handoff links.

- [ ] **Step 1: Create `app/components/RouteSketch.tsx`** — port of the approved schematic (yellow start, orange landmarks, green Okairi, avoided AH26 segment).

```tsx
export default function RouteSketch() {
  return (
    <svg viewBox="0 0 400 940" className="mx-auto w-full max-w-sm" role="img"
      aria-label="Route sketch from WalterMart Santa Rosa to Okairi">
      <path d="M85,70 C85,140 300,150 300,220 C300,300 90,300 90,390 C90,470 300,470 300,560 C300,640 110,660 110,730 C110,800 300,800 300,860"
        fill="none" stroke="#f4cdd1" strokeWidth="20" strokeLinecap="round" />
      <path d="M85,70 C85,140 300,150 300,220 C300,300 90,300 90,390 C90,470 300,470 300,560 C300,640 110,660 110,730 C110,800 300,800 300,860"
        fill="none" stroke="#d17b83" strokeWidth="5" strokeLinecap="round" />
      <path d="M300,560 C330,600 335,660 300,700" fill="none" stroke="#d98a8a" strokeWidth="4" strokeDasharray="3 7" strokeLinecap="round" />
      <g transform="translate(340,632)">
        <rect x="-8" y="-13" width="72" height="26" rx="8" fill="#fdeaea" stroke="#d98a8a" strokeDasharray="3 4" />
        <text x="28" y="4" textAnchor="middle" fontSize="10" fill="#b05a5a" fontWeight="700">AVOID</text>
      </g>
      <circle cx="85" cy="70" r="9" fill="#fff" stroke="#d9ad24" strokeWidth="4" />
      <g transform="translate(105,56)"><rect width="182" height="30" rx="9" fill="#f7dd86" stroke="#d9ad24" strokeWidth="2" /><text x="14" y="20" fontSize="13" fontWeight="700" fill="#6b5200">START · WalterMart Sta. Rosa</text></g>
      <circle cx="300" cy="220" r="7" fill="#fff" stroke="#e18a2e" strokeWidth="3" />
      <g transform="translate(96,206)"><rect width="196" height="28" rx="8" fill="#f6bd7c" stroke="#e18a2e" strokeWidth="2" /><text x="13" y="19" fontSize="12.5" fontWeight="600" fill="#7a4310">Mima The Baker's Partner</text></g>
      <circle cx="90" cy="390" r="7" fill="#fff" stroke="#e18a2e" strokeWidth="3" />
      <g transform="translate(110,376)"><rect width="168" height="28" rx="8" fill="#f6bd7c" stroke="#e18a2e" strokeWidth="2" /><text x="13" y="19" fontSize="12.5" fontWeight="600" fill="#7a4310">Balibago Market</text></g>
      <circle cx="300" cy="560" r="7" fill="#fff" stroke="#d17b83" strokeWidth="3" />
      <g transform="translate(70,528)"><rect width="176" height="26" rx="8" fill="#fff" stroke="#d17b83" strokeWidth="1.5" /><text x="12" y="17" fontSize="11.5" fontWeight="600" fill="#d17b83">Keep RIGHT on the curve →</text></g>
      <circle cx="110" cy="730" r="7" fill="#fff" stroke="#e18a2e" strokeWidth="3" />
      <g transform="translate(130,716)"><rect width="196" height="28" rx="8" fill="#f6bd7c" stroke="#e18a2e" strokeWidth="2" /><text x="13" y="19" fontSize="12.5" fontWeight="600" fill="#7a4310">J&amp;T Express Sta. Rosa CP-2</text></g>
      <circle cx="300" cy="860" r="10" fill="#fff" stroke="#4f9b52" strokeWidth="4" />
      <g transform="translate(96,872)"><rect width="204" height="34" rx="10" fill="#8fd08a" stroke="#4f9b52" strokeWidth="2.5" /><text x="15" y="16" fontSize="13" fontWeight="700" fill="#245a26">OKAIRI · Reception</text><text x="15" y="28" fontSize="10.5" fill="#245a26">B2 L10 Ph 1, La Joya Subd.</text></g>
    </svg>
  );
}
```

- [ ] **Step 2: Create `app/components/Directions.tsx`**

```tsx
import Section from "./Section";
import RouteSketch from "./RouteSketch";
import content from "../content";

export default function Directions() {
  const d = content.directions;
  return (
    <Section id="directions" eyebrow="Getting There" title="Maps & Directions">
      <p className="text-sm text-ink-soft">
        {d.origin} → {d.destination} · {d.distance}. A full interactive map is coming; for now,
        follow the landmarks below — they avoid the far U-turn.
      </p>
      <div className="mt-6"><RouteSketch /></div>
      <ol className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm">
        {d.steps.map((s, i) => (
          <li key={i} className="rounded-xl bg-white/60 px-4 py-2 text-ink">
            <span className="mr-2 font-semibold text-rose-deep">{i + 1}.</span>{s}
          </li>
        ))}
      </ol>
      <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
        <a href={d.fromWalterMart} target="_blank" rel="noopener noreferrer"
          className="rounded-full bg-rose px-5 py-2 font-semibold text-white">From WalterMart</a>
        <a href={d.fromParish} target="_blank" rel="noopener noreferrer"
          className="rounded-full bg-sage px-5 py-2 font-semibold text-white">From St. Benedict</a>
        <a href={d.okairiPin} target="_blank" rel="noopener noreferrer"
          className="rounded-full border border-rose px-5 py-2 font-semibold text-rose-deep">Okairi pin</a>
      </div>
    </Section>
  );
}
```

- [ ] **Step 3: Type-check** — Run: `npx tsc --noEmit` — Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/components/RouteSketch.tsx app/components/Directions.tsx
git commit -m "feat(phase1): directions section with route sketch + landmark steps"
```

---

### Task 9: RSVP call-to-action

**Files:**
- Create: `app/components/RsvpCta.tsx`

**Interfaces:**
- Consumes: `Section`. Phase-1 placeholder button (wired to the real flow in Phase 3). Button links to `#rsvp` and shows a "opening soon" affordance — no dead-end.

- [ ] **Step 1: Create `app/components/RsvpCta.tsx`**

```tsx
import Section from "./Section";

export default function RsvpCta() {
  return (
    <Section id="rsvp" eyebrow="Kindly Respond" title="RSVP">
      <p className="text-sm text-ink-soft">
        Search your name to confirm your seat and get your QR pass. RSVP opens soon — please check
        back shortly before the day.
      </p>
      <button
        type="button"
        aria-disabled="true"
        className="mt-6 cursor-not-allowed rounded-full bg-rose/60 px-8 py-3 font-semibold text-white"
      >
        RSVP — opening soon
      </button>
    </Section>
  );
}
```

- [ ] **Step 2: Type-check** — Run: `npx tsc --noEmit` — Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/RsvpCta.tsx
git commit -m "feat(phase1): RSVP call-to-action placeholder (wired in phase 3)"
```

---

### Task 10: Gift note + Registry

**Files:**
- Create: `app/components/GiftRegistry.tsx`

**Interfaces:**
- Consumes: `content.gift`, `Section`. Shows note; item list when present; links when present.

- [ ] **Step 1: Create `app/components/GiftRegistry.tsx`**

```tsx
import Section from "./Section";
import content from "../content";

export default function GiftRegistry() {
  const { note, items, links } = content.gift;
  return (
    <Section id="gifts" eyebrow="With Love" title="Gifts & Registry">
      <p className="mx-auto max-w-md text-sm text-ink-soft">{note}</p>
      {items.length > 0 && (
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-sm">
          {items.map((it) => (
            <li key={it} className="rounded-xl bg-white/60 px-4 py-2 text-ink">{it}</li>
          ))}
        </ul>
      )}
      {links.length > 0 && (
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
          {links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer"
              className="rounded-full bg-rose px-5 py-2 font-semibold text-white">{l.label}</a>
          ))}
        </div>
      )}
    </Section>
  );
}
```

- [ ] **Step 2: Type-check** — Run: `npx tsc --noEmit` — Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/components/GiftRegistry.tsx
git commit -m "feat(phase1): gift note + registry section"
```

---

### Task 11: Footer + page assembly + ship

**Files:**
- Create: `app/components/Footer.tsx`
- Modify: `app/page.tsx` (full rewrite)

**Interfaces:**
- Consumes: every component above + `content`. Makes the Task 2 content test pass.

- [ ] **Step 1: Create `app/components/Footer.tsx`**

```tsx
import content from "../content";
import { Bow } from "./Ornaments";

export default function Footer() {
  return (
    <footer className="w-full px-6 py-12 text-center">
      <Bow className="mx-auto h-12 w-24 opacity-80" />
      <p className="mt-4 font-script text-3xl text-rose-deep">{content.celebrantFirst}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.24em] text-ink-soft">
        {content.dateLong} · We can’t wait to celebrate with you
      </p>
    </footer>
  );
}
```

- [ ] **Step 2: Rewrite `app/page.tsx`** — assemble in order.

```tsx
import IntroReveal from "./components/IntroReveal";
import Hero from "./components/Hero";
import Details from "./components/Details";
import Godparents from "./components/Godparents";
import Directions from "./components/Directions";
import RsvpCta from "./components/RsvpCta";
import GiftRegistry from "./components/GiftRegistry";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center">
      <IntroReveal />
      <Hero />
      <Details />
      <Godparents />
      <Directions />
      <RsvpCta />
      <GiftRegistry />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 3: Run the content test — verify it now passes**

Run: `npm test`
Expected: PASS — all essential facts present.

- [ ] **Step 4: Production build**

Run: `npm run build`
Expected: build succeeds, no type errors.

- [ ] **Step 5: Visual check**

Run: `npm run dev`, open `http://localhost:3000` on a narrow (phone-width) viewport. Confirm: intro reveal plays once, all sections render, gingham background, script name, links work, reduced-motion (via OS setting) skips the reveal.

- [ ] **Step 6: Commit & push (auto-deploys to Vercel)**

```bash
git add app/page.tsx app/components/Footer.tsx
git commit -m "feat(phase1): assemble invitation page + footer"
git push origin main
```

---

## Self-Review

**Spec coverage (Phase 1 scope):**
- Aesthetic system (§3) → Task 1. Intro reveal (§4.1) → Task 4. Hero (§4.2) → Task 5.
- Ceremony/Reception (§4.3–4.4) → Task 6. Godparents (§4.5) → Task 7.
- Directions **static sketch + steps + handoff links** (§4.6, §5 — interactive Leaflet deferred to Phase 2) → Task 8.
- RSVP placeholder (§4.7 — real flow Phase 3) → Task 9. Gift + Registry incl. monetary (§4.9–4.10) → Task 10.
- Deploy path (§10–11) → Task 11 push.
- *Deferred by design (own plans):* interactive map (Phase 2), RSVP/auth/QR (Phase 3), admin/groups/check-in (Phase 4).

**Placeholder scan:** No plan-level TODOs. App-level `// TODO(host)` markers in `content.ts` hold valid defaults so nothing renders empty; host swaps real godparent names / registry links later by editing one file.

**Type consistency:** `content` shape defined in Task 1 is consumed with matching field names throughout (`content.ceremony`, `content.directions.steps`, `content.gift.links`, `content.godparents.list`). `Section` props (`eyebrow`, `title`, `id`) used consistently. `DetailCard` spread from `content.ceremony`/`content.reception` matches its `{title,venue,address,time}` props.
