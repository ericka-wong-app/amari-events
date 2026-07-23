import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getStats } from "@/lib/admin-data";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard · Admin" };

function Tile({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border px-4 py-4 text-center ${accent ? "border-rose bg-rose/10" : "border-blush-2 bg-white"}`}>
      <p className="font-display text-3xl font-semibold text-rose-deep">{value}</p>
      <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-soft">{label}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  await requireAdmin();
  const s = await getStats();
  return (
    <AdminShell title="Dashboard" active="/admin">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Invites" value={s.groups} />
        <Tile label="Attending" value={s.attending} accent />
        <Tile label="Declined" value={s.declined} />
        <Tile label="Pending" value={s.pending} />
        <Tile label="Confirmed pax" value={s.confirmedPax} accent />
        <Tile label="People listed" value={s.people} />
        <Tile label="Gifts raised" value={`₱${s.paidTotalPhp.toLocaleString()}`} accent />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link href="/admin/guests" className="rounded-2xl border border-blush-2 bg-white px-5 py-4 font-semibold text-rose-deep hover:bg-blush/30">
          👥 Manage guests →
        </Link>
        <Link href="/admin/checkin" className="rounded-2xl border border-blush-2 bg-white px-5 py-4 font-semibold text-rose-deep hover:bg-blush/30">
          📷 Check-in →
        </Link>
        <Link href="/admin/gifts" className="rounded-2xl border border-blush-2 bg-white px-5 py-4 font-semibold text-rose-deep hover:bg-blush/30">
          🎁 Gifts &amp; registry →
        </Link>
      </div>
    </AdminShell>
  );
}
