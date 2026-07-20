-- Amari's Baptism — database schema (run once in Supabase → SQL Editor).
-- All app access goes through the Next.js server using the SERVICE ROLE key,
-- so RLS is enabled with NO policies: the anon/public key can read nothing,
-- the service role bypasses RLS. PINs / passwords / security answers are
-- stored HASHED by the app (never plaintext).

create extension if not exists "pgcrypto";

-- Groups / "main guest" — an organizing layer over individual guests.
create table if not exists groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  notes      text,
  created_at timestamptz not null default now()
);

-- Individual guests. Each person logs in and gets their own QR pass.
create table if not exists guests (
  id             uuid primary key default gen_random_uuid(),
  group_id       uuid references groups(id) on delete set null,
  display_name   text not null,
  alt_names      text[] not null default '{}',      -- nicknames / alternate spellings
  max_pax        int  not null default 1 check (max_pax >= 1),
  table_number   text,
  godparent_role text check (godparent_role in ('Ninong','Ninang')),
  notes          text,
  created_at     timestamptz not null default now()
);
create index if not exists guests_group_id_idx on guests(group_id);
create index if not exists guests_display_lower_idx on guests(lower(display_name));
create index if not exists guests_alt_names_idx on guests using gin(alt_names);

-- Per-guest login (no email/SMS): 4-digit PIN + security question reset.
create table if not exists guest_auth (
  guest_id             uuid primary key references guests(id) on delete cascade,
  pin_hash             text,
  security_question    text,
  security_answer_hash text,
  updated_at           timestamptz not null default now()
);

-- RSVP response per guest.
create table if not exists rsvps (
  guest_id      uuid primary key references guests(id) on delete cascade,
  status        text not null default 'pending' check (status in ('attending','declined','pending')),
  confirmed_pax int check (confirmed_pax >= 0),
  responded_at  timestamptz
);

-- Event-day check-in per guest.
create table if not exists checkins (
  guest_id      uuid primary key references guests(id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  checked_in_by text,
  method        text check (method in ('scan','manual'))
);

-- Host / door-helper admin accounts (username + password, no email).
create table if not exists admins (
  id                   uuid primary key default gen_random_uuid(),
  username             text unique not null,
  password_hash        text not null,
  security_question    text,
  security_answer_hash text,
  created_at           timestamptz not null default now()
);

-- Lock everything down: only the service role (server) may touch these.
alter table groups     enable row level security;
alter table guests     enable row level security;
alter table guest_auth enable row level security;
alter table rsvps      enable row level security;
alter table checkins   enable row level security;
alter table admins     enable row level security;
