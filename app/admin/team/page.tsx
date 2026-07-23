import type { Metadata } from "next";
import { requireAdmin, listAdmins, type AdminUser } from "@/lib/admin";
import AdminShell from "../AdminShell";
import TeamManager from "./TeamManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admins · Admin" };

export default async function AdminTeamPage() {
  await requireAdmin();

  let admins: AdminUser[] = [];
  let tableError: string | null = null;
  try {
    admins = await listAdmins();
  } catch (e) {
    tableError = (e as Error).message;
  }

  return (
    <AdminShell title="Admins & Helpers" active="/admin/team">
      {tableError ? (
        <div className="rounded-2xl border border-rose bg-rose/10 px-6 py-6 text-sm text-ink">
          <p className="font-semibold text-rose-deep">One-time setup needed</p>
          <p className="mt-1 text-ink-soft">Your admins table needs a role column. Run this in Supabase → SQL Editor, then refresh:</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-3 text-xs text-ink">{`alter table admins add column if not exists role text;
alter table admins add column if not exists created_at timestamptz not null default now();`}</pre>
        </div>
      ) : (
        <TeamManager admins={admins} />
      )}
    </AdminShell>
  );
}
