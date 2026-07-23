import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminLogin from "./AdminLogin";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Amari's Baptism" };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-14">
      <AdminLogin />
    </main>
  );
}
