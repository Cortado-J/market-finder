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
  last_verified    timestamp default now(),
  opening_hours    text
);

-- Enable RLS on the sensitive tables
alter table markets enable row level security;

-- Allow all authenticated users to SELECT from markets
create policy "Authenticated users can read markets"
on markets
for select
to authenticated
using (true);
