import type { Metadata } from "next";
import RsvpFlow from "./RsvpFlow";
import { myPass, type Pass } from "./actions";
import content from "../content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "RSVP · Amari's Baptism",
};

export default async function RsvpPage() {
  let initialPass: Pass | null = null;
  try {
    initialPass = await myPass();
  } catch {
    initialPass = null;
  }
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center px-6 py-14">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-rose-deep/80">
        {content.celebrant} · {content.dateLong}
      </p>
      <div className="mt-8 w-full">
        <RsvpFlow initialPass={initialPass} />
      </div>
    </main>
  );
}
