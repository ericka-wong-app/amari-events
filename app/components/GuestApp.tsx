"use client";
import { useState } from "react";
import RsvpFlow from "../rsvp/RsvpFlow";
import type { Pass } from "../rsvp/actions";

type TabKey = "home" | "rsvp" | "details" | "map" | "gifts";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "home", label: "Home", icon: <path d="M4 11.5 12 4l8 7.5M6 10v9h12v-9" /> },
  { key: "rsvp", label: "RSVP", icon: <path d="M4 6h16v12H4zM4 7l8 6 8-6" /> },
  { key: "details", label: "Details", icon: <path d="M5 4h14v16H5zM8 3v3M16 3v3M5 9h14" /> },
  { key: "map", label: "Map", icon: <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" /> },
  { key: "gifts", label: "Gifts", icon: <path d="M4 9h16v11H4zM3 6h18v3H3zM12 6v14M12 6S9 2 7 4s2 2 5 2M12 6s3-4 5-2-2 2-5 2" /> },
];

export default function GuestApp({
  initialPass,
  home,
  details,
  map,
  gifts,
}: {
  initialPass: Pass | null;
  home: React.ReactNode;
  details: React.ReactNode;
  map: React.ReactNode;
  gifts: React.ReactNode;
}) {
  const [tab, setTab] = useState<TabKey>(initialPass ? "home" : "rsvp");

  return (
    <>
      <main className="mx-auto w-full max-w-3xl pb-28">
        <div className={tab === "home" ? "" : "hidden"}>{home}</div>
        <div className={tab === "rsvp" ? "" : "hidden"}>
          <section className="px-6 py-12">
            <RsvpFlow initialPass={initialPass} />
          </section>
        </div>
        <div className={tab === "details" ? "" : "hidden"}>{details}</div>
        <div className={tab === "map" ? "" : "hidden"}>{map}</div>
        <div className={tab === "gifts" ? "" : "hidden"}>{gifts}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-blush-2 bg-cream/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-md items-stretch justify-around px-2 py-1.5">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[0.62rem] font-semibold ${active ? "text-rose-deep" : "text-ink-soft"}`}
                aria-current={active ? "page" : undefined}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {t.icon}
                </svg>
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
