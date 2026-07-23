import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { listGuests } from "@/lib/admin-data";
import AdminShell from "../AdminShell";
import GuestManager from "./GuestManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Guests · Admin" };

export default async function AdminGuestsPage() {
  await requireAdmin();
  const guests = await listGuests();
  return (
    <AdminShell title="Guests" active="/admin/guests">
      <GuestManager guests={guests} />
    </AdminShell>
  );
}
