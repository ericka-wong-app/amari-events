import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { listGroups, type Group } from "@/lib/admin-data";
import AdminShell from "../AdminShell";
import GroupManager from "./GroupManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Invites · Admin" };

const MIGRATION = `alter table groups add column if not exists max_pax int not null default 1;
alter table groups add column if not exists table_number text;
alter table groups add column if not exists rsvp_status text not null default 'pending' check (rsvp_status in ('attending','declined','pending'));
alter table groups add column if not exists confirmed_pax int;
alter table groups add column if not exists responded_at timestamptz;
alter table groups add column if not exists checked_in_at timestamptz;
alter table groups add column if not exists attendance text check (attendance in ('both','reception','ceremony'));
alter table groups add column if not exists is_online boolean not null default false;

-- move loose guests into their own solo group (pax 1)
insert into groups (name, max_pax)
  select display_name, greatest(coalesce(max_pax,1),1) from guests where group_id is null;
update guests g set group_id = gr.id
  from groups gr where g.group_id is null and gr.name = g.display_name;

NOTIFY pgrst, 'reload schema';`;

export default async function AdminGuestsPage() {
  await requireAdmin();
  let groups: Group[] = [];
  let error: string | null = null;
  try {
    groups = await listGroups();
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <AdminShell title="Invites & Groups" active="/admin/guests">
      {error ? (
        <div className="rounded-2xl border border-rose bg-rose/10 px-6 py-6 text-sm text-ink">
          <p className="font-semibold text-rose-deep">One-time setup needed</p>
          <p className="mt-1 text-ink-soft">Run this in Supabase → SQL Editor, then refresh:</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-3 text-xs text-ink">{MIGRATION}</pre>
        </div>
      ) : (
        <GroupManager groups={groups} />
      )}
    </AdminShell>
  );
}
