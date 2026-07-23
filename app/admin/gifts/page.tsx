import { requireAdmin } from "@/lib/admin";
import { getStats } from "@/lib/admin-data";
import AdminShell from "../AdminShell";

export const dynamic = "force-dynamic";

export default async function AdminGiftsPage() {
  await requireAdmin();
  const s = await getStats();
  return (
    <AdminShell title="Gifts & Registry" active="/admin/gifts">
      <div className="rounded-2xl border border-rose bg-rose/10 px-6 py-6 text-center">
        <p className="font-display text-3xl font-semibold text-rose-deep">₱{s.paidTotalPhp.toLocaleString()}</p>
        <p className="mt-1 text-sm text-ink-soft">raised in monetary gifts so far</p>
      </div>
      <div className="mt-4 rounded-2xl border border-blush-2 bg-white px-6 py-10 text-center text-ink-soft">
        🎁 Fund goal editor + claimable registry (with your Shopee/Lazada/TikTok links) — building next.
      </div>
    </AdminShell>
  );
}
