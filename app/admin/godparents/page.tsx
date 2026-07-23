import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { listMembersFlat, type FlatMember } from "@/lib/admin-data";
import AdminShell from "../AdminShell";
import GodparentManager from "./GodparentManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Ninong & Ninang · Admin" };

export default async function AdminGodparentsPage() {
  await requireAdmin();
  let members: FlatMember[] = [];
  let error: string | null = null;
  try {
    members = await listMembersFlat();
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <AdminShell title="Ninong & Ninang" active="/admin/godparents">
      {error ? (
        <div className="rounded-lg border border-rose bg-rose/10 px-6 py-6 text-sm text-ink-soft">
          Add some guests first (Invites tab), then assign godparents here.
        </div>
      ) : (
        <GodparentManager members={members} />
      )}
    </AdminShell>
  );
}
