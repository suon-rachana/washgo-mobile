-- ============================================================================
-- WashGo - Grant privileges for authenticated users
-- RLS policies still determine WHICH rows users can access.
-- These GRANTs only allow the authenticated role to query the tables.
-- ============================================================================

grant usage on schema public to authenticated;

-- Profiles
grant select, update
on table public.profiles
to authenticated;

-- Addresses
grant select, insert, update, delete
on table public.addresses
to authenticated;

-- Favorites
grant select, insert, delete
on table public.favorites
to authenticated;

-- Notifications
grant select, update
on table public.notifications
to authenticated;

-- Laundries
grant select
on table public.laundries
to authenticated;

-- Laundry Services
grant select
on table public.laundry_services
to authenticated;

-- Orders
grant select
on table public.orders
to authenticated;

grant select
on table public.order_items
to authenticated;

grant select
on table public.order_status_history
to authenticated;

-- Payments
grant select
on table public.payments
to authenticated;

-- RPC
grant execute
on function public.set_default_address(uuid)
to authenticated;