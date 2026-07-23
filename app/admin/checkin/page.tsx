import { requireAdmin } from "@/lib/admin";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminCheckinPage() {
  await requireAdmin();
  return (
    <AdminShell title="Check-in" active="/admin/checkin">
      <div className="rounded-2xl border border-blush-2 bg-white px-6 py-10 text-center text-ink-soft">
        📷 QR scanner + manual check-in — building next.
      </div>
    </AdminShell>
  );
}
