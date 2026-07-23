import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLogin from "./AdminLogin";
import { isAdmin, adminConfigured } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Amari's Baptism" };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-14">
      <AdminLogin />
      {!adminConfigured() && (
        <p className="mt-4 max-w-sm text-center text-xs text-ink-soft">
          Set <code>ADMIN_USERNAME</code> and <code>ADMIN_PASSWORD</code> in Vercel to enable login.
        </p>
      )}
    </main>
  );
}
