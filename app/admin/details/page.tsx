import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { getEventDetails, getSiteMeta } from "@/lib/event-details";
import { supabaseAdmin } from "@/lib/supabase";
import AdminShell from "../AdminShell";
import DetailsManager from "./DetailsManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Details · Admin" };

export default async function AdminDetailsPage() {
  await requireAdmin();

  const { error } = await supabaseAdmin().from("event_details").select("id, seo_title").limit(1);
  const tableError = error?.message ?? null;
  const details = await getEventDetails();
  const meta = await getSiteMeta();

  return (
    <AdminShell title="Baptism Details" active="/admin/details">
      {tableError ? (
        <div className="rounded-2xl border border-rose bg-rose/10 px-6 py-6 text-sm text-ink">
          <p className="font-semibold text-rose-deep">One-time setup needed</p>
          <p className="mt-1 text-ink-soft">Run this in Supabase → SQL Editor, then refresh this page:</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-3 text-xs text-ink">{`create table if not exists event_details (
  id int primary key default 1,
  ceremony_venue text, ceremony_address text, ceremony_time text,
  reception_venue text, reception_address text, reception_time text,
  church_photos text[] not null default '{}',
  reception_photos text[] not null default '{}',
  seo_title text, seo_description text, og_image_url text,
  updated_at timestamptz not null default now(),
  constraint event_details_singleton check (id = 1)
);
alter table event_details enable row level security;
-- If the table already exists, add the new columns:
alter table event_details add column if not exists seo_title text;
alter table event_details add column if not exists seo_description text;
alter table event_details add column if not exists og_image_url text;`}</pre>
        </div>
      ) : (
        <DetailsManager details={details} meta={meta} />
      )}
    </AdminShell>
  );
}
