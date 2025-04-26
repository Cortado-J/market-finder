-- Create a function to return markets with properly formatted locations
create or replace function get_markets_with_locations()
returns table (
  market_id bigint,
  name text,
  description text,
  address text,
  website_url text,
  location text
)
language sql
security definer
as $$
  select 
    market_id,
    name,
    description,
    address,
    website_url,
    ST_AsText(location) as location
  from markets
  order by name;
$$;
