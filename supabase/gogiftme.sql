-- GoGiftMe (group gift fund) — run once in Supabase SQL Editor when we build
-- the flow. A single active fund + a list of contributions; the funding bar =
-- sum(amount_php) of paid contributions vs the fund's goal_php.

create table if not exists fund (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default 'Help us gift Amari something special',
  item        text,
  description text,
  goal_php    int  not null default 0 check (goal_php >= 0),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists contributions (
  id          uuid primary key default gen_random_uuid(),
  fund_id     uuid references fund(id) on delete cascade,
  name        text,
  message     text,
  amount_php  int  not null check (amount_php > 0),
  status      text not null default 'pending' check (status in ('pending','paid','failed')),
  checkout_id text,
  reference   text,
  created_at  timestamptz not null default now(),
  paid_at     timestamptz
);
create index if not exists contributions_fund_idx on contributions(fund_id);
create index if not exists contributions_status_idx on contributions(status);

alter table fund          enable row level security;
alter table contributions enable row level security;
