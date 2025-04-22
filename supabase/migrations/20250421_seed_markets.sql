-- 20250422_seed_markets.sql
begin;

insert into markets
(name, description, address, location, website_url, contact_email, contact_phone, categories, last_verified)
values
/* 1 ─ St Nicholas Market */
('St Nicholas Market',
 'Bristol’s historic indoor market (trading since 1743) with stalls, street‑food and independent retailers.',
 'Corn Street, Bristol BS1 1JQ',
 ST_SetSRID(ST_MakePoint(-2.592638, 51.454392), 4326)::geography,
 'https://www.bristol.gov.uk/st-nicholas-markets',
 null,
 null,
 array['indoor','food','craft'],
 now()),

/* 2 ─ Whiteladies Road Farmers’ Market */
('Whiteladies Road Farmers’ Market',
 'Weekly Saturday farmers’ market offering local produce at the junction of Whiteladies Rd & Apsley Rd.',
 'Whiteladies Rd × Apsley Rd, Bristol BS8 2ST',
 ST_SetSRID(ST_MakePoint(-2.6150, 51.4590), 4326)::geography,
 null,
 'whiteladiesroadmarket@gmail.com',
 null,
 array['farmers','food'],
 now()),

/* 3 ─ Tobacco Factory Sunday Market */
('Tobacco Factory Sunday Market',
 'Community Sunday market (10 am – 2 :30 pm) with ~40 stalls of food, produce and crafts on Southville’s Tobacco Factory square.',
 'Raleigh Road, Bristol BS3 1TF',
 ST_SetSRID(ST_MakePoint(-2.613174, 51.442414), 4326)::geography,
 'https://tobaccofactory.com/whats-on/sunday-market/',
 null,
 null,
 array['farmers','street food','craft'],
 now()),

/* 4 ─ Harbourside Street Food Market */
('Harbourside Street Food Market',
 'Waterside street‑food & makers market every Wed, Thu, Sat & Sun beside the amphitheatre on Bristol’s harbourside.',
 '1 Canon’s Road, Bristol BS1 5TX',
 ST_SetSRID(ST_MakePoint(-2.597986, 51.452192), 4326)::geography,
 'https://www.buoyevents.co.uk/markets/harbourside-street-food-market/',
 'info@bristolmarket.co.uk',
 null,
 array['street food','craft'],
 now()),

/* 5 ─ Finzels Reach Market */
('Finzels Reach Market',
 'Twice‑weekly Wednesday & Friday lunchtime street‑food market on Old Temple Street (Finzels Reach development).',
 'Old Temple Street, Bristol BS1 6BX',
 ST_SetSRID(ST_MakePoint(-2.58929, 51.45378), 4326)::geography,
 'https://finzelsreachmarket.co.uk/',
 'admin@sophiebevents.co.uk',
 null,
 array['street food'],
 now());

commit;
