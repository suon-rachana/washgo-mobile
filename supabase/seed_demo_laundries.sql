-- ============================================================================
-- WashGo — demo laundry data
--
-- Optional. Not a schema migration — run this manually in the SQL Editor
-- after 001-004 to have something real to browse/book in Supabase mode.
-- Safe to re-run: it deletes its own previously-seeded rows (matched by
-- name) before re-inserting, so running it twice doesn't duplicate shops.
--
-- Names/prices mirror src/data/mock/laundries.ts and src/data/mock/services.ts
-- so the app's UI numbers feel consistent whether you're comparing mock mode
-- against Supabase mode side by side.
-- ============================================================================

delete from public.laundry_services
where laundry_id in (
  select id from public.laundries
  where name in ('CleanWave Laundry', 'Angkor Fresh Laundry', 'BlueWash Express', 'Riverside Laundry Co.')
);

delete from public.laundries
where name in ('CleanWave Laundry', 'Angkor Fresh Laundry', 'BlueWash Express', 'Riverside Laundry Co.');

-- owner_id is left null — no laundry_owner accounts exist yet (see
-- docs/SUPABASE_SETUP.md's Phase 4 limitations).
insert into public.laundries
  (name, description, phone, address_line, latitude, longitude, rating_average, rating_count, is_open, approval_status)
values
  (
    'CleanWave Laundry',
    'Fast, friendly wash & fold with same-day turnaround for most orders.',
    '+855 12 345 678',
    'Wat Bo Road, Siem Reap',
    13.3560, 103.8580,
    4.8, 126, true, 'approved'
  ),
  (
    'Angkor Fresh Laundry',
    'Family-run laundry shop known for careful handling of delicate fabrics.',
    '+855 12 456 789',
    'Sivatha Blvd, Siem Reap',
    13.3610, 103.8560,
    4.6, 98, true, 'approved'
  ),
  (
    'BlueWash Express',
    'Premium express service — the fastest turnaround in Siem Reap.',
    '+855 12 567 890',
    'Central Market Area, Siem Reap',
    13.3620, 103.8590,
    4.9, 152, false, 'approved'
  ),
  (
    'Riverside Laundry Co.',
    'Reliable everyday wash & fold, a short walk from the riverside.',
    '+855 12 678 901',
    'River Road, Siem Reap',
    13.3540, 103.8620,
    4.5, 74, true, 'approved'
  );

-- Wash & Fold / Dry Cleaning / Ironing / Express per shop, with each shop's
-- own price point (matches the spread already in the mock catalog).
insert into public.laundry_services (laundry_id, name, description, price, pricing_unit, estimated_duration_minutes)
select l.id, s.name, s.description, s.price, s.pricing_unit::public.pricing_unit, s.duration
from public.laundries l
join (
  values
    ('CleanWave Laundry',      'Wash & Fold',   'We wash, dry, and neatly fold your clothes.',       2.50, 'per_kg',  180),
    ('CleanWave Laundry',      'Dry Cleaning',  'Professional cleaning for delicate fabrics.',        4.50, 'per_item', 240),
    ('CleanWave Laundry',      'Ironing',       'Freshly pressed and wrinkle-free.',                  1.50, 'per_item', 120),
    ('CleanWave Laundry',      'Express',       'Same-day turnaround for urgent orders.',             6.00, 'flat',      90),

    ('Angkor Fresh Laundry',   'Wash & Fold',   'We wash, dry, and neatly fold your clothes.',        3.00, 'per_kg',  180),
    ('Angkor Fresh Laundry',   'Dry Cleaning',  'Professional cleaning for delicate fabrics.',        5.00, 'per_item', 240),
    ('Angkor Fresh Laundry',   'Ironing',       'Freshly pressed and wrinkle-free.',                  1.80, 'per_item', 120),
    ('Angkor Fresh Laundry',   'Express',       'Same-day turnaround for urgent orders.',             6.50, 'flat',      90),

    ('BlueWash Express',       'Wash & Fold',   'We wash, dry, and neatly fold your clothes.',        3.50, 'per_kg',  150),
    ('BlueWash Express',       'Dry Cleaning',  'Professional cleaning for delicate fabrics.',        5.50, 'per_item', 210),
    ('BlueWash Express',       'Ironing',       'Freshly pressed and wrinkle-free.',                  2.00, 'per_item', 100),
    ('BlueWash Express',       'Express',       'Same-day turnaround for urgent orders.',             7.00, 'flat',      60),

    ('Riverside Laundry Co.',  'Wash & Fold',   'We wash, dry, and neatly fold your clothes.',        2.80, 'per_kg',  180),
    ('Riverside Laundry Co.',  'Dry Cleaning',  'Professional cleaning for delicate fabrics.',        4.80, 'per_item', 240),
    ('Riverside Laundry Co.',  'Ironing',       'Freshly pressed and wrinkle-free.',                  1.60, 'per_item', 120),
    ('Riverside Laundry Co.',  'Express',       'Same-day turnaround for urgent orders.',             6.20, 'flat',      90)
) as s(laundry_name, name, description, price, pricing_unit, duration)
  on s.laundry_name = l.name
where l.name in ('CleanWave Laundry', 'Angkor Fresh Laundry', 'BlueWash Express', 'Riverside Laundry Co.');
