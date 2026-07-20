import type { Metadata } from "next";
import GiveForm from "./GiveForm";
import FloatingHearts from "../components/FloatingHearts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Send a Gift · Amari's Baptism",
};

export default function GiftPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-14">
      <FloatingHearts />
      <GiveForm />
    </main>
  );
}
