-- WashGo — Phase 1 backend foundation
-- Revised initial schema.
--
-- Phase 1 app integration:
--   - profiles
--   - addresses
--
-- Foundation for later phases:
--   - laundries
--   - laundry_services
--   - orders
--   - order_items
--   - order_status_history
--   - notifications
--   - payments
--   - favorites
--
-- Important:
-- Customers cannot create orders directly with this migration.
-- Add a secure create_customer_order() RPC in migration 002.

-- ============================================================================
-- Extensions
-- ============================================================================

create extension if not exists pgcrypto;

-- ============================================================================
-- Enums
-- ============================================================================

create type public.user_role as enum (
  'customer',
  'rider',
  'laundry_owner',
  'admin'
);

create type public.laundry_approval_status as enum (
  'pending',
  'approved',
  'rejected'
);

create type public.pricing_unit as enum (
  'per_kg',
  'per_item',
  'flat'
);

create type public.order_status as enum (
  'pending',
  'rider_assigned',
  'picked_up',
  'at_laundry',
  'washing',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

create type public.payment_method_type as enum (
  'cash',
  'card',
  'wallet'
);

create type public.payment_status_type as enum (
  'pending',
  'paid',
  'failed',
  'refunded'
);

create type public.notification_type as enum (
  'order_update',
  'promotion',
  'system'
);

-- ============================================================================
-- Shared trigger helper: keep updated_at current
-- ============================================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ============================================================================
-- profiles
-- One profile row per auth.users row.
-- ============================================================================

create table public.profiles (
  id uuid primary key
    references auth.users (id)
    on delete cascade,

  role public.user_role not null default 'customer',

  full_name text,
  phone text,
  email text,
  avatar_url text,

  preferred_language text not null default 'en'
    check (preferred_language in ('en', 'km')),

  theme_preference text not null default 'light'
    check (theme_preference in ('light', 'dark')),

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Protect fields controlled by trusted backend/admin flows.
-- Customers may still update full_name, phone, avatar_url,
-- preferred_language, and theme_preference.
create or replace function public.prevent_profile_protected_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.role := old.role;
  new.is_active := old.is_active;
  new.email := old.email;

  return new;
end;
$$;

create trigger profiles_prevent_protected_changes
  before update on public.profiles
  for each row
  execute function public.prevent_profile_protected_changes();

-- ============================================================================
-- addresses
-- ============================================================================

create table public.addresses (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles (id)
    on delete cascade,

  label text not null,
  address_line text not null,
  delivery_instructions text,

  latitude double precision,
  longitude double precision,

  is_default boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index addresses_user_id_idx
  on public.addresses (user_id);

-- A user may have at most one default address.
create unique index addresses_one_default_per_user
  on public.addresses (user_id)
  where is_default = true;

create trigger addresses_set_updated_at
  before update on public.addresses
  for each row
  execute function public.set_updated_at();

-- Atomically change the caller's default address.
create or replace function public.set_default_address(p_address_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.addresses
    where id = p_address_id
      and user_id = v_user_id
  ) then
    raise exception 'Address not found';
  end if;

  update public.addresses
  set is_default = false
  where user_id = v_user_id
    and is_default = true
    and id <> p_address_id;

  update public.addresses
  set is_default = true
  where id = p_address_id
    and user_id = v_user_id;
end;
$$;

-- ============================================================================
-- laundries
-- Schema foundation only in Phase 1.
-- ============================================================================

create table public.laundries (
  id uuid primary key default gen_random_uuid(),

  owner_id uuid
    references public.profiles (id)
    on delete set null,

  name text not null,
  description text,
  phone text,
  address_line text,

  latitude double precision,
  longitude double precision,

  rating_average numeric(2, 1) not null default 0
    check (rating_average >= 0 and rating_average <= 5),

  rating_count integer not null default 0
    check (rating_count >= 0),

  is_open boolean not null default true,

  approval_status public.laundry_approval_status
    not null
    default 'pending',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index laundries_owner_id_idx
  on public.laundries (owner_id);

create trigger laundries_set_updated_at
  before update on public.laundries
  for each row
  execute function public.set_updated_at();

-- Protect fields that must be controlled by trusted system/admin flows.
create or replace function public.prevent_laundry_protected_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.owner_id := old.owner_id;
  new.approval_status := old.approval_status;
  new.rating_average := old.rating_average;
  new.rating_count := old.rating_count;

  return new;
end;
$$;

create trigger laundries_prevent_protected_changes
  before update on public.laundries
  for each row
  execute function public.prevent_laundry_protected_changes();

-- ============================================================================
-- laundry_services
-- Schema foundation only in Phase 1.
-- ============================================================================

create table public.laundry_services (
  id uuid primary key default gen_random_uuid(),

  laundry_id uuid not null
    references public.laundries (id)
    on delete cascade,

  name text not null,
  description text,

  price numeric(10, 2) not null
    check (price >= 0),

  pricing_unit public.pricing_unit
    not null
    default 'per_kg',

  estimated_duration_minutes integer
    check (
      estimated_duration_minutes is null
      or estimated_duration_minutes >= 0
    ),

  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index laundry_services_laundry_id_idx
  on public.laundry_services (laundry_id);

create trigger laundry_services_set_updated_at
  before update on public.laundry_services
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- orders
-- Schema foundation only in Phase 1.
-- ============================================================================

create table public.orders (
  id uuid primary key default gen_random_uuid(),

  customer_id uuid not null
    references public.profiles (id)
    on delete cascade,

  laundry_id uuid not null
    references public.laundries (id)
    on delete restrict,

  pickup_rider_id uuid
    references public.profiles (id)
    on delete set null,

  delivery_rider_id uuid
    references public.profiles (id)
    on delete set null,

  -- Address snapshot at order time.
  address_label text,
  address_line text not null,
  address_latitude double precision,
  address_longitude double precision,
  delivery_instructions text,

  status public.order_status
    not null
    default 'pending',

  pickup_scheduled_at timestamptz,
  notes text,

  subtotal numeric(10, 2) not null default 0
    check (subtotal >= 0),

  pickup_fee numeric(10, 2) not null default 0
    check (pickup_fee >= 0),

  delivery_fee numeric(10, 2) not null default 0
    check (delivery_fee >= 0),

  discount numeric(10, 2) not null default 0
    check (discount >= 0),

  total numeric(10, 2) not null default 0
    check (total >= 0),

  payment_method public.payment_method_type
    not null
    default 'cash',

  payment_status public.payment_status_type
    not null
    default 'pending',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_customer_id_idx
  on public.orders (customer_id);

create index orders_laundry_id_idx
  on public.orders (laundry_id);

create index orders_pickup_rider_id_idx
  on public.orders (pickup_rider_id);

create index orders_delivery_rider_id_idx
  on public.orders (delivery_rider_id);

create index orders_customer_created_at_idx
  on public.orders (customer_id, created_at desc);

create index orders_laundry_created_at_idx
  on public.orders (laundry_id, created_at desc);

create trigger orders_set_updated_at
  before update on public.orders
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- order_items
-- Schema foundation only in Phase 1.
-- ============================================================================

create table public.order_items (
  id uuid primary key default gen_random_uuid(),

  order_id uuid not null
    references public.orders (id)
    on delete cascade,

  service_id uuid
    references public.laundry_services (id)
    on delete set null,

  -- Service snapshot at order time.
  service_name text not null,
  pricing_unit public.pricing_unit not null,

  quantity numeric(10, 2)
    not null
    default 1
    check (quantity > 0),

  unit_price numeric(10, 2)
    not null
    check (unit_price >= 0),

  line_total numeric(10, 2)
    not null
    check (line_total >= 0),

  created_at timestamptz not null default now()
);

create index order_items_order_id_idx
  on public.order_items (order_id);

-- ============================================================================
-- order_status_history
-- Schema foundation only in Phase 1.
-- ============================================================================

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),

  order_id uuid not null
    references public.orders (id)
    on delete cascade,

  status public.order_status not null,

  changed_by uuid
    references public.profiles (id)
    on delete set null,

  notes text,

  created_at timestamptz not null default now()
);

create index order_status_history_order_id_idx
  on public.order_status_history (order_id);

create index order_status_history_order_created_at_idx
  on public.order_status_history (order_id, created_at);

-- Record the initial order status automatically.
create or replace function public.record_initial_order_status()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.order_status_history (
    order_id,
    status,
    changed_by,
    notes
  )
  values (
    new.id,
    new.status,
    null,
    'Order created'
  );

  return new;
end;
$$;

create trigger orders_record_initial_status
  after insert on public.orders
  for each row
  execute function public.record_initial_order_status();

-- Append later status changes automatically.
create or replace function public.record_order_status_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.order_status_history (
      order_id,
      status,
      changed_by,
      notes
    )
    values (
      new.id,
      new.status,
      auth.uid(),
      null
    );
  end if;

  return new;
end;
$$;

create trigger orders_record_status_change
  after update of status on public.orders
  for each row
  execute function public.record_order_status_change();

-- ============================================================================
-- notifications
-- Schema foundation only in Phase 1.
-- ============================================================================

create table public.notifications (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles (id)
    on delete cascade,

  type public.notification_type
    not null
    default 'system',

  title text not null,
  message text not null,

  related_order_id uuid
    references public.orders (id)
    on delete set null,

  is_read boolean not null default false,

  created_at timestamptz not null default now()
);

create index notifications_user_id_idx
  on public.notifications (user_id);

create index notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);

-- ============================================================================
-- payments
-- No card numbers, bank credentials, or sensitive payment data.
-- ============================================================================

create table public.payments (
  id uuid primary key default gen_random_uuid(),

  order_id uuid not null
    references public.orders (id)
    on delete cascade,

  amount numeric(10, 2) not null
    check (amount >= 0),

  method public.payment_method_type not null,

  status public.payment_status_type
    not null
    default 'pending',

  provider_reference text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index payments_order_id_idx
  on public.payments (order_id);

create trigger payments_set_updated_at
  before update on public.payments
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- favorites
-- ============================================================================

create table public.favorites (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references public.profiles (id)
    on delete cascade,

  laundry_id uuid not null
    references public.laundries (id)
    on delete cascade,

  created_at timestamptz not null default now(),

  unique (user_id, laundry_id)
);

create index favorites_user_id_idx
  on public.favorites (user_id);

-- ============================================================================
-- New auth user -> profile
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_preferred_language text;
begin
  v_preferred_language :=
    coalesce(
      nullif(new.raw_user_meta_data ->> 'preferred_language', ''),
      'en'
    );

  if v_preferred_language not in ('en', 'km') then
    v_preferred_language := 'en';
  end if;

  insert into public.profiles (
    id,
    role,
    full_name,
    phone,
    email,
    preferred_language
  )
  values (
    new.id,
    'customer',
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'phone'), ''),
    new.email,
    v_preferred_language
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================================
-- Row Level Security
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.laundries enable row level security;
alter table public.laundry_services enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.notifications enable row level security;
alter table public.payments enable row level security;
alter table public.favorites enable row level security;

-- ============================================================================
-- profiles policies
-- ============================================================================

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- No client INSERT or DELETE policy.
-- Profile creation happens through handle_new_user().

-- ============================================================================
-- addresses policies
-- ============================================================================

create policy "addresses_select_own"
  on public.addresses
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "addresses_insert_own"
  on public.addresses
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "addresses_update_own"
  on public.addresses
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "addresses_delete_own"
  on public.addresses
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================================
-- favorites policies
-- ============================================================================

create policy "favorites_select_own"
  on public.favorites
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "favorites_insert_own"
  on public.favorites
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "favorites_delete_own"
  on public.favorites
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================================
-- notifications policies
-- ============================================================================

create policy "notifications_select_own"
  on public.notifications
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- No client INSERT or DELETE policy.

-- ============================================================================
-- laundries policies
-- ============================================================================

-- Authenticated users can read approved laundries.
create policy "laundries_select_approved"
  on public.laundries
  for select
  to authenticated
  using (approval_status = 'approved');

-- Owners can also read their own pending/rejected laundry.
create policy "laundries_owner_select_own"
  on public.laundries
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'laundry_owner'
        and p.is_active = true
    )
  );

create policy "laundries_owner_insert_own"
  on public.laundries
  for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'laundry_owner'
        and p.is_active = true
    )
  );

create policy "laundries_owner_update_own"
  on public.laundries
  for update
  to authenticated
  using (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'laundry_owner'
        and p.is_active = true
    )
  )
  with check (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'laundry_owner'
        and p.is_active = true
    )
  );

create policy "laundries_owner_delete_own"
  on public.laundries
  for delete
  to authenticated
  using (
    owner_id = auth.uid()
    and exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'laundry_owner'
        and p.is_active = true
    )
  );

-- ============================================================================
-- laundry_services policies
-- ============================================================================

create policy "laundry_services_select_active"
  on public.laundry_services
  for select
  to authenticated
  using (
    is_active = true
    and exists (
      select 1
      from public.laundries l
      where l.id = laundry_id
        and l.approval_status = 'approved'
    )
  );

create policy "laundry_services_owner_all"
  on public.laundry_services
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.laundries l
      join public.profiles p
        on p.id = l.owner_id
      where l.id = laundry_id
        and l.owner_id = auth.uid()
        and p.role = 'laundry_owner'
        and p.is_active = true
    )
  )
  with check (
    exists (
      select 1
      from public.laundries l
      join public.profiles p
        on p.id = l.owner_id
      where l.id = laundry_id
        and l.owner_id = auth.uid()
        and p.role = 'laundry_owner'
        and p.is_active = true
    )
  );

-- ============================================================================
-- orders policies
-- Read-only from clients in Phase 1.
-- ============================================================================

create policy "orders_select_customer"
  on public.orders
  for select
  to authenticated
  using (customer_id = auth.uid());

create policy "orders_select_laundry_owner"
  on public.orders
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.laundries l
      where l.id = laundry_id
        and l.owner_id = auth.uid()
    )
  );

create policy "orders_select_rider"
  on public.orders
  for select
  to authenticated
  using (
    pickup_rider_id = auth.uid()
    or delivery_rider_id = auth.uid()
  );

-- No direct client INSERT, UPDATE, or DELETE policy.
-- A secure RPC will be added in migration 002.

-- ============================================================================
-- order_items policies
-- ============================================================================

create policy "order_items_select_via_order"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (
          o.customer_id = auth.uid()
          or o.pickup_rider_id = auth.uid()
          or o.delivery_rider_id = auth.uid()
          or exists (
            select 1
            from public.laundries l
            where l.id = o.laundry_id
              and l.owner_id = auth.uid()
          )
        )
    )
  );

-- ============================================================================
-- order_status_history policies
-- ============================================================================

create policy "order_status_history_select_via_order"
  on public.order_status_history
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (
          o.customer_id = auth.uid()
          or o.pickup_rider_id = auth.uid()
          or o.delivery_rider_id = auth.uid()
          or exists (
            select 1
            from public.laundries l
            where l.id = o.laundry_id
              and l.owner_id = auth.uid()
          )
        )
    )
  );

-- ============================================================================
-- payments policies
-- ============================================================================

create policy "payments_select_via_order"
  on public.payments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and o.customer_id = auth.uid()
    )
  );

-- ============================================================================
-- Function permissions
-- ============================================================================

-- Publicly callable RPC used by authenticated customers.
revoke all on function public.set_default_address(uuid) from public;
grant execute on function public.set_default_address(uuid) to authenticated;

-- Internal trigger helpers should not be directly callable through the API.
revoke all on function public.set_updated_at() from public;
revoke all on function public.prevent_profile_protected_changes() from public;
revoke all on function public.prevent_laundry_protected_changes() from public;
revoke all on function public.handle_new_user() from public;
revoke all on function public.record_initial_order_status() from public;
revoke all on function public.record_order_status_change() from public;
