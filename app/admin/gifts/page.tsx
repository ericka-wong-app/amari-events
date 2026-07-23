import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { getFund, listGiftItems, listPaidContributions, type GiftItem, type AdminContribution } from "@/lib/gift-admin";
import { getPaidTotal } from "@/lib/fund";
import AdminShell from "../AdminShell";
import GiftManager from "./GiftManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gifts · Admin" };

export default async function AdminGiftsPage() {
  await requireAdmin();
  const fund = await getFund();

  let items: GiftItem[] = [];
  let tableError: string | null = null;
  try {
    items = await listGiftItems();
  } catch (e) {
    tableError = (e as Error).message;
  }

  let contributions: AdminContribution[] = [];
  let paidTotal = 0;
  try {
    contributions = await listPaidContributions();
    paidTotal = await getPaidTotal();
  } catch {
    /* contributions table already handled elsewhere */
  }

  return (
    <AdminShell title="Gifts & Registry" active="/admin/gifts">
      {tableError ? (
        <div className="rounded-2xl border border-rose bg-rose/10 px-6 py-6 text-sm text-ink">
          <p className="font-semibold text-rose-deep">One-time setup needed</p>
          <p className="mt-1 text-ink-soft">
            Run this in Supabase → SQL Editor, then refresh this page:
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-3 text-xs text-ink">{`create table if not exists fund (
  id uuid primary key default gen_random_uuid(),
  item text, goal_php int not null default 0, blurb text,
  created_at timestamptz not null default now()
);
create table if not exists gift_items (
  id uuid primary key default gen_random_uuid(),
  title text not null, image_url text, price_php int,
  store text, affiliate_url text, sort int not null default 0,
  claimed_by text, claimed_guest_id uuid references guests(id) on delete set null,
  claimed_at timestamptz, created_at timestamptz not null default now()
);
alter table fund enable row level security;
alter table gift_items enable row level security;`}</pre>
        </div>
      ) : (
        <GiftManager fund={fund} items={items} contributions={contributions} paidTotal={paidTotal} />
      )}
    </AdminShell>
  );
}
