"use client";
import { useCallback, useState } from "react";
import RsvpFlow from "../rsvp/RsvpFlow";
import type { Pass } from "../rsvp/actions";

type Tab = "home" | "rsvp" | "details" | "gifts";

const ICONS: Record<Tab, React.ReactNode> = {
  home: <path d="M4 11.5 12 4l8 7.5M6 10v9h12v-9" />,
  rsvp: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  details: <path d="M5 4h14v16H5zM8 3v3M16 3v3M5 9h14" />,
  gifts: <path d="M4 9h16v11H4zM3 6h18v3H3zM12 6v14M12 6S9 2 7 4s2 2 5 2M12 6s3-4 5-2-2 2-5 2" />,
};

const ctaPrimary = "hover-lift rounded-full bg-rose px-8 py-4 text-center text-base font-semibold text-white shadow-[0_16px_34px_-16px_rgba(183,110,125,0.95)]";
const ctaGhost = "rounded-full border border-rose bg-white px-8 py-3.5 text-center text-base font-semibold text-rose-deep";

export default function GuestShell({
  initialPass,
  hero,
  details,
  gifts,
  inviteToken,
}: {
  initialPass: Pass | null;
  hero: React.ReactNode;
  details: React.ReactNode;
  gifts: React.ReactNode;
  inviteToken?: string | null;
}) {
  const [pass, setPass] = useState<Pass | null>(initialPass);
  const [tab, setTab] = useState<Tab>(inviteToken && !initialPass ? "rsvp" : "home");
  const loggedIn = Boolean(pass);
  const onPassChange = useCallback((p: Pass | null) => setPass(p), []);

  const nav: { key: Tab; label: string }[] = loggedIn
    ? [{ key: "home", label: "Home" }, { key: "rsvp", label: "My Pass" }, { key: "details", label: "Details" }, { key: "gifts", label: "Gifts" }]
    : [{ key: "home", label: "Home" }, { key: "rsvp", label: "RSVP" }, { key: "gifts", label: "Gifts" }];

  return (
    <>
      <main className="mx-auto w-full max-w-3xl pb-28">
        <div className={tab === "home" ? "" : "hidden"}>
          {hero}
          <div className="mx-auto -mt-2 flex max-w-sm flex-col gap-3 px-6 pb-12">
            {loggedIn ? (
              <>
                <button onClick={() => setTab("rsvp")} className={ctaPrimary}>View my pass</button>
                <button onClick={() => setTab("details")} className={ctaGhost}>Baptism details &amp; map</button>
                <button onClick={() => setTab("gifts")} className={ctaGhost}>Gifts &amp; registry</button>
              </>
            ) : (
              <>
                <button onClick={() => setTab("rsvp")} className={ctaPrimary}>RSVP / Log in</button>
                <button onClick={() => setTab("gifts")} className={ctaGhost}>Gifts &amp; registry</button>
              </>
            )}
          </div>
        </div>

        <div className={tab === "rsvp" ? "" : "hidden"}>
          <section className="px-6 py-12">
            <RsvpFlow initialPass={pass} onPassChange={onPassChange} initialInviteToken={inviteToken} onGifts={() => setTab("gifts")} />
          </section>
        </div>

        <div className={tab === "details" ? "" : "hidden"}>
          {loggedIn ? details : <LockedPrompt onRsvp={() => setTab("rsvp")} />}
        </div>

        <div className={tab === "gifts" ? "" : "hidden"}>{gifts}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-blush-2 bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
          {nav.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[0.62rem] font-semibold ${active ? "text-rose-deep" : "text-ink-soft"}`}
                aria-current={active ? "page" : undefined}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{ICONS[t.key]}</svg>
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function LockedPrompt({ onRsvp }: { onRsvp: () => void }) {
  return (
    <div className="mx-auto mt-12 max-w-md rounded-[26px] border border-blush-2 bg-white/70 px-6 py-10 text-center shadow-[0_20px_50px_-30px_rgba(183,110,125,0.6)]">
      <p className="font-display text-2xl italic text-rose-deep">Please RSVP first</p>
      <p className="mt-2 text-sm text-ink-soft">Find your name and log in to see the baptism details &amp; map.</p>
      <button onClick={onRsvp} className={`${ctaPrimary} mt-5 inline-block`}>RSVP / Log in</button>
    </div>
  );
}
