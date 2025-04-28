-- Update the function to include schedule field
create or replace function get_markets_with_locations()
returns table (
  market_id bigint,
  name text,
  description text,
  address text,
  website_url text,
  location text,
  opening_hours text
)
language sql
security definer
as $$
  select 
    m.market_id,
    m.name,
    m.description,
    m.address,
    m.website_url,
    ST_AsText(m.location) as location,
    m.opening_hours
  from markets m
$$;
