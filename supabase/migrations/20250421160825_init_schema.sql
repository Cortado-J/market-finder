-- Enable PostGIS extension
create extension if not exists postgis;

-- Markets table
create table markets (
  market_id        serial primary key,
  name             text not null,
  description      text,
  address          text,
  location         geography(point, 4326) not null,
  website_url      text,
  contact_email    text,
  contact_phone    text,
  categories       text[] default '{}',
  last_verified    timestamp default now()
);

-- Market schedule table
create table market_schedules (
  schedule_id      serial primary key,
  market_id        integer references markets(market_id) on delete cascade,
  day_of_week      smallint not null check (day_of_week between 0 and 6),
  open_time        time not null,
  close_time       time not null
);

-- Market confirmations (actual open/closed info)
create table market_confirmations (
  confirmation_id   serial primary key,
  market_id         integer not null references markets(market_id) on delete cascade,
  confirm_date      date not null,
  confirmed_open    boolean not null,
  confirmation_type text not null check (confirmation_type in ('weekly','daily')),
  confirmed_by      uuid not null references auth.users(id),
  confirmed_at      timestamp not null default now(),
  unique (market_id, confirm_date, confirmation_type)
);

-- Enable RLS on the sensitive tables
alter table markets enable row level security;
alter table market_confirmations enable row level security;

-- Allow all authenticated users to SELECT from markets
create policy "Authenticated users can read markets"
on markets
for select
to authenticated
using (true);

-- Allow authenticated users to SELECT their own confirmations
create policy "Authenticated users can read confirmations"
on market_confirmations
for select
to authenticated
using (true);

-- Allow authenticated users to INSERT confirmations
create policy "Authenticated users can insert confirmations"
on market_confirmations
for insert
to authenticated
with check (true);
