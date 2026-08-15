-- One-time backfill for public.profiles.
--
-- The on_auth_user_created trigger (handle_new_user(), see
-- 001_initial_schema.sql) only fires on INSERT into auth.users going
-- forward. Any account created via auth.users before that trigger existed
-- in this project — e.g. a test signup made prior to running the migration
-- — has no matching public.profiles row, which makes
-- profileService.fetchCurrentProfile() come back empty for that user.
--
-- Run this once in the Supabase dashboard: SQL Editor -> New query.
--
-- Safe to run more than once: `on conflict (id) do nothing` never touches a
-- row that already exists, so it can't overwrite real profile data.

-- 1. Check first — see which accounts (if any) are missing a profile row.
select u.id, u.email, u.created_at
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- 2. Backfill. Mirrors handle_new_user()'s own field derivation exactly, so
--    a backfilled row looks identical to one the trigger would have made.
insert into public.profiles (id, role, full_name, phone, email, preferred_language)
select
  u.id,
  'customer',
  nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
  nullif(trim(u.raw_user_meta_data ->> 'phone'), ''),
  u.email,
  case
    when nullif(u.raw_user_meta_data ->> 'preferred_language', '') in ('en', 'km')
      then u.raw_user_meta_data ->> 'preferred_language'
    else 'en'
  end
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
