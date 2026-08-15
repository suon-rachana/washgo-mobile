-- ============================================================================
-- Phase 4: order creation + status advancement
--
-- orders/order_items/order_status_history intentionally have no client
-- INSERT/UPDATE policy (see 001_initial_schema.sql) — all writes go through
-- these two SECURITY DEFINER RPCs so prices and status transitions are
-- computed/validated server-side, never trusted from the client.
-- ============================================================================

-- Creates an order + its order_items in one transaction. Item prices are
-- looked up from laundry_services server-side (never trusted from the
-- client) so a tampered client request can't under-price an order.
--
-- p_items shape: [{"service_id": "<uuid>", "quantity": <numeric, optional, default 1>}, ...]
--
-- Fees are fixed constants matching src/utils/estimateOrderTotal.ts. There is
-- no promotions table yet (promotions are decorative mock-only UI — see
-- src/data/mock/promotions.ts), so real orders never apply a discount; this
-- is a known, documented gap versus the mock estimate shown earlier in the
-- booking flow.
create or replace function public.create_order(
  p_laundry_id uuid,
  p_items jsonb,
  p_address_label text,
  p_address_line text,
  p_address_latitude double precision,
  p_address_longitude double precision,
  p_delivery_instructions text,
  p_pickup_scheduled_at timestamptz,
  p_notes text,
  p_payment_method public.payment_method_type
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_id uuid := auth.uid();
  v_order_id uuid;
  v_item jsonb;
  v_service public.laundry_services%rowtype;
  v_quantity numeric(10, 2);
  v_line_total numeric(10, 2);
  v_subtotal numeric(10, 2) := 0;
  v_pickup_fee constant numeric(10, 2) := 1.00;
  v_delivery_fee constant numeric(10, 2) := 1.50;
begin
  if v_customer_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_address_line is null or length(trim(p_address_line)) = 0 then
    raise exception 'Address is required';
  end if;

  if not exists (
    select 1 from public.laundries
    where id = p_laundry_id
      and approval_status = 'approved'
  ) then
    raise exception 'Laundry not found';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one service is required';
  end if;

  insert into public.orders (
    customer_id, laundry_id,
    address_label, address_line, address_latitude, address_longitude, delivery_instructions,
    status, pickup_scheduled_at, notes,
    subtotal, pickup_fee, delivery_fee, discount, total,
    payment_method, payment_status
  ) values (
    v_customer_id, p_laundry_id,
    p_address_label, p_address_line, p_address_latitude, p_address_longitude, p_delivery_instructions,
    'pending', p_pickup_scheduled_at, p_notes,
    0, v_pickup_fee, v_delivery_fee, 0, v_pickup_fee + v_delivery_fee,
    coalesce(p_payment_method, 'cash'), 'pending'
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_service
    from public.laundry_services
    where id = (v_item ->> 'service_id')::uuid
      and laundry_id = p_laundry_id
      and is_active = true;

    if not found then
      raise exception 'Service % is not available at this laundry', v_item ->> 'service_id';
    end if;

    v_quantity := coalesce((v_item ->> 'quantity')::numeric, 1);
    if v_quantity <= 0 then
      raise exception 'Invalid quantity for service %', v_service.name;
    end if;

    v_line_total := round(v_service.price * v_quantity, 2);
    v_subtotal := v_subtotal + v_line_total;

    insert into public.order_items (
      order_id, service_id, service_name, pricing_unit, quantity, unit_price, line_total
    ) values (
      v_order_id, v_service.id, v_service.name, v_service.pricing_unit, v_quantity, v_service.price, v_line_total
    );
  end loop;

  update public.orders
  set subtotal = v_subtotal,
      total = v_subtotal + v_pickup_fee + v_delivery_fee
  where id = v_order_id;

  return v_order_id;
end;
$$;

-- Demo-only status progression. There is no rider/laundry-shop app yet to
-- drive real status changes, so — for this phase — the order's own customer
-- can advance it one step at a time as a stand-in for that missing system.
-- This is explicitly NOT a real access-control model; it exists so the
-- tracking screen has something real to demo end-to-end. Replace the
-- "customer_id = auth.uid()" check below with a rider/shop-owner check once
-- those roles have their own apps calling this.
create or replace function public.advance_order_status(p_order_id uuid)
returns public.order_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_id uuid := auth.uid();
  v_current public.order_status;
  v_next public.order_status;
  v_laundry_name text;
  v_title text;
  v_message text;
begin
  if v_customer_id is null then
    raise exception 'Not authenticated';
  end if;

  select status into v_current
  from public.orders
  where id = p_order_id
    and customer_id = v_customer_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  v_next := case v_current
    when 'pending' then 'rider_assigned'
    when 'rider_assigned' then 'picked_up'
    when 'picked_up' then 'at_laundry'
    when 'at_laundry' then 'washing'
    when 'washing' then 'ready_for_delivery'
    when 'ready_for_delivery' then 'out_for_delivery'
    when 'out_for_delivery' then 'delivered'
    else null
  end;

  if v_next is null then
    raise exception 'Order is already at a final status';
  end if;

  update public.orders set status = v_next where id = p_order_id;
  -- orders_record_status_change (001_initial_schema.sql) auto-appends the
  -- order_status_history row for this transition.

  select l.name into v_laundry_name
  from public.laundries l
  join public.orders o on o.laundry_id = l.id
  where o.id = p_order_id;

  v_title := case v_next
    when 'rider_assigned' then 'Rider assigned'
    when 'picked_up' then 'Laundry picked up'
    when 'at_laundry' then 'Arrived at laundry'
    when 'washing' then 'Washing in progress'
    when 'ready_for_delivery' then 'Ready for delivery'
    when 'out_for_delivery' then 'Out for delivery'
    when 'delivered' then 'Delivered'
    else 'Order update'
  end;

  v_message := case v_next
    when 'rider_assigned' then 'A rider has been assigned to your order.'
    when 'picked_up' then 'Your laundry has been picked up.'
    when 'at_laundry' then format('Your laundry has arrived at %s.', coalesce(v_laundry_name, 'the laundry shop'))
    when 'washing' then 'Your laundry is now being washed.'
    when 'ready_for_delivery' then 'Your laundry is ready for delivery.'
    when 'out_for_delivery' then 'Your laundry is out for delivery.'
    when 'delivered' then 'Your laundry has been delivered. Enjoy!'
    else 'Your order status has been updated.'
  end;

  -- Written in English only — notifications have no per-language template
  -- yet (see docs/SUPABASE_SETUP.md's Phase 3 gaps). Same limitation as
  -- every other server-written notification.
  insert into public.notifications (user_id, type, title, message, related_order_id, is_read)
  values (v_customer_id, 'order_update', v_title, v_message, p_order_id, false);

  return v_next;
end;
$$;

-- ============================================================================
-- Function permissions
-- ============================================================================

revoke all on function public.create_order(
  uuid, jsonb, text, text, double precision, double precision, text, timestamptz, text, public.payment_method_type
) from public;
grant execute on function public.create_order(
  uuid, jsonb, text, text, double precision, double precision, text, timestamptz, text, public.payment_method_type
) to authenticated;

revoke all on function public.advance_order_status(uuid) from public;
grant execute on function public.advance_order_status(uuid) to authenticated;
