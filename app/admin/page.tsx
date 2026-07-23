import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getStats, type AdminStats } from "@/lib/admin-data";
import AdminShell from "./AdminShell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard · Admin" };

const MIGRATION = `alter table groups add column if not exists max_pax int not null default 1;
alter table groups add column if not exists table_number text;
alter table groups add column if not exists rsvp_status text not null default 'pending' check (rsvp_status in ('attending','declined','pending'));
alter table groups add column if not exists confirmed_pax int;
alter table groups add column if not exists responded_at timestamptz;
alter table groups add column if not exists checked_in_at timestamptz;
alter table groups add column if not exists attendance text check (attendance in ('both','reception','ceremony'));
alter table guests add column if not exists is_online boolean not null default false;
alter table guests add column if not exists rsvp_status text not null default 'pending' check (rsvp_status in ('attending','declined','pending'));
alter table guests add column if not exists attendance text check (attendance in ('both','reception','ceremony'));
alter table guests add column if not exists rsvp_at timestamptz;

-- move loose guests into their own solo group (pax 1)
insert into groups (name, max_pax)
  select display_name, greatest(coalesce(max_pax,1),1) from guests where group_id is null;
update guests g set group_id = gr.id
  from groups gr where g.group_id is null and gr.name = g.display_name;

NOTIFY pgrst, 'reload schema';`;

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

  let s: AdminStats | null = null;
  try {
    s = await getStats();
  } catch {
    s = null;
  }

  if (!s) {
    return (
      <AdminShell title="Dashboard" active="/admin">
        <div className="rounded-2xl border border-rose bg-rose/10 px-6 py-6 text-sm text-ink">
          <p className="font-semibold text-rose-deep">One-time setup needed</p>
          <p className="mt-1 text-ink-soft">Run this in Supabase → SQL Editor, then reload:</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-3 text-xs text-ink">{MIGRATION}</pre>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Dashboard" active="/admin">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile label="Invites" value={s.groups} />
        <Tile label="Confirmed RSVPs" value={s.attending} accent />
        <Tile label="Declined" value={s.declined} />
        <Tile label="Pending" value={s.pending} />
      </div>
      <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-soft">Confirmed head count (pax)</p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        <Tile label="Total pax" value={s.confirmedPax} accent />
        <Tile label="In-person" value={s.inPersonPax} />
        <Tile label="Online" value={s.onlinePax} />
      </div>

      <p className="mt-5 text-[0.68rem] font-semibold uppercase tracking-wide text-ink-soft">People listed</p>
      <div className="mt-2 grid grid-cols-3 gap-3">
        <Tile label="Total people" value={s.people} />
        <Tile label="In-person" value={s.inPersonListed} />
        <Tile label="Online" value={s.onlineListed} />
      </div>

      <div className="mt-5">
        <Tile label="Gifts raised" value={`₱${s.paidTotalPhp.toLocaleString()}`} accent />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <Link href="/admin/guests" className="rounded-xl border border-blush-2 bg-white px-5 py-4 font-semibold text-rose-deep hover:bg-blush/30">Invites &amp; groups</Link>
        <Link href="/admin/godparents" className="rounded-xl border border-blush-2 bg-white px-5 py-4 font-semibold text-rose-deep hover:bg-blush/30">Ninong &amp; Ninang</Link>
        <Link href="/admin/checkin" className="rounded-xl border border-blush-2 bg-white px-5 py-4 font-semibold text-rose-deep hover:bg-blush/30">Check-in</Link>
        <Link href="/admin/gifts" className="rounded-xl border border-blush-2 bg-white px-5 py-4 font-semibold text-rose-deep hover:bg-blush/30">Gifts &amp; registry</Link>
      </div>
    </AdminShell>
  );
}
