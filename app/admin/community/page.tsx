import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { listPosts, type Post } from "@/lib/community";
import AdminShell from "../AdminShell";
import AlbumManager from "./AlbumManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Album · Admin" };

export default async function AdminAlbumPage() {
  await requireAdmin();

  let posts: Post[] = [];
  let tableError: string | null = null;
  try {
    posts = await listPosts(null);
  } catch (e) {
    tableError = (e as Error).message;
  }

  return (
    <AdminShell title="Shared Album" active="/admin/community">
      {tableError ? (
        <div className="rounded-2xl border border-rose bg-rose/10 px-6 py-6 text-sm text-ink">
          <p className="font-semibold text-rose-deep">One-time setup needed</p>
          <p className="mt-1 text-ink-soft">Run this in Supabase → SQL Editor, then refresh this page:</p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-3 text-xs text-ink">{`create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid references guests(id) on delete set null,
  author_name text not null,
  body text, media_url text, media_type text,
  created_at timestamptz not null default now()
);
create table if not exists post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  guest_id uuid references guests(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (post_id, guest_id)
);
create table if not exists post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade,
  guest_id uuid references guests(id) on delete set null,
  author_name text not null, body text not null,
  created_at timestamptz not null default now()
);
create index if not exists posts_created_idx on posts (created_at desc);
alter table posts enable row level security;
alter table post_reactions enable row level security;
alter table post_comments enable row level security;`}</pre>
        </div>
      ) : (
        <AlbumManager posts={posts} />
      )}
    </AdminShell>
  );
}
