import type { Metadata } from "next";
import GiveForm from "./GiveForm";
import FundBar from "../components/FundBar";
import FloatingHearts from "../components/FloatingHearts";
import content from "../content";
import { getPaidTotal } from "@/lib/fund";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Send a Gift · Amari's Baptism",
};

export default async function GiftPage() {
  let raised = 0;
  try {
    raised = await getPaidTotal();
  } catch {
    raised = 0;
  }
  const f = content.gift.fund;
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-5 px-6 py-14">
      <FloatingHearts />
      <FundBar raisedPhp={raised} goalPhp={f.goalPhp} item={f.item} blurb={f.blurb} />
      <GiveForm />
    </main>
  );
}
