import { isSupabaseDataSource } from '@/src/config/dataSource';
import { getSupabaseClient } from '@/src/lib/supabase';
import type { CreateOrderItemInput, OrderItemRow, OrderRow, PaymentMethodType } from '@/src/types/database';
import { dbStatusToLifecycle, dbStatusToStepId, type AppOrder, type AppOrderItem } from '@/src/types/order';
import { authService } from './authService';
import { normalizeServiceError, type ServiceErrorCode } from './errors';

export interface CreateOrderInput {
  laundryId: string;
  items: CreateOrderItemInput[];
  addressLabel: string | null;
  addressLine: string;
  addressLatitude: number | null;
  addressLongitude: number | null;
  deliveryInstructions: string | null;
  pickupScheduledAt: string | null;
  notes: string | null;
  paymentMethod: PaymentMethodType;
}

export interface OrderResult {
  data: AppOrder | null;
  error: ServiceErrorCode | null;
}

export interface OrderListResult {
  data: AppOrder[];
  error: ServiceErrorCode | null;
}

export interface CreateOrderResult {
  /** The new order's id, or null on failure. */
  data: string | null;
  error: ServiceErrorCode | null;
}

interface OrderWithRelations extends OrderRow {
  order_items: OrderItemRow[];
  laundries: { name: string } | null;
}

const CURRENCY = '$';
const ORDER_SELECT = '*, order_items(*), laundries(name)';

function mapOrderItem(row: OrderItemRow): AppOrderItem {
  return {
    id: row.id,
    serviceName: row.service_name,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    lineTotal: row.line_total,
  };
}

function formatScheduledLabel(pickupScheduledAt: string | null): string | undefined {
  if (!pickupScheduledAt) return undefined;
  return new Date(pickupScheduledAt).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function mapOrderRow(row: OrderWithRelations): AppOrder {
  return {
    id: row.id,
    laundryId: row.laundry_id,
    laundryName: row.laundries?.name ?? 'Unknown laundry',
    addressLabel: row.address_label ?? 'Address',
    addressLine: row.address_line,
    items: row.order_items.map(mapOrderItem),
    notes: row.notes ?? '',
    subtotal: row.subtotal,
    pickupFee: row.pickup_fee,
    deliveryFee: row.delivery_fee,
    discount: row.discount,
    total: row.total,
    currency: CURRENCY,
    status: dbStatusToLifecycle(row.status),
    stepId: dbStatusToStepId(row.status),
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
    scheduledLabel: formatScheduledLabel(row.pickup_scheduled_at),
  };
}

export const orderService = {
  // Writes only ever go through create_order()/advance_order_status() — see
  // supabase/migrations/004_order_creation_and_status.sql. Prices are
  // computed server-side from laundry_services, never trusted from here.
  async create(input: CreateOrderInput): Promise<CreateOrderResult> {
    if (!isSupabaseDataSource) return { data: null, error: 'not_configured' };

    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) return { data: null, error: 'not_authenticated' };

      const { data, error } = await getSupabaseClient().rpc('create_order', {
        p_laundry_id: input.laundryId,
        p_items: input.items,
        p_address_label: input.addressLabel,
        p_address_line: input.addressLine,
        p_address_latitude: input.addressLatitude,
        p_address_longitude: input.addressLongitude,
        p_delivery_instructions: input.deliveryInstructions,
        p_pickup_scheduled_at: input.pickupScheduledAt,
        p_notes: input.notes,
        p_payment_method: input.paymentMethod,
      });

      if (error) return { data: null, error: normalizeServiceError(error) };
      return { data, error: null };
    } catch (error) {
      console.error('[WashGo] Unable to create order:', error);
      return { data: null, error: normalizeServiceError(error) };
    }
  },

  async list(): Promise<OrderListResult> {
    if (!isSupabaseDataSource) return { data: [], error: 'not_configured' };

    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) return { data: [], error: 'not_authenticated' };

      const { data, error } = await getSupabaseClient()
        .from('orders')
        .select(ORDER_SELECT)
        .eq('customer_id', userId)
        .order('created_at', { ascending: false })
        .returns<OrderWithRelations[]>();

      if (error) return { data: [], error: normalizeServiceError(error) };
      return { data: (data ?? []).map(mapOrderRow), error: null };
    } catch (error) {
      console.error('[WashGo] Unable to load orders:', error);
      return { data: [], error: normalizeServiceError(error) };
    }
  },

  async get(id: string): Promise<OrderResult> {
    if (!isSupabaseDataSource) return { data: null, error: 'not_configured' };

    try {
      const { data, error } = await getSupabaseClient()
        .from('orders')
        .select(ORDER_SELECT)
        .eq('id', id)
        .single<OrderWithRelations>();

      if (error) return { data: null, error: normalizeServiceError(error) };
      return { data: mapOrderRow(data), error: null };
    } catch (error) {
      console.error('[WashGo] Unable to load order:', error);
      return { data: null, error: normalizeServiceError(error) };
    }
  },

  // Demo-only status progression — see the RPC's own comment in
  // 004_order_creation_and_status.sql for why the customer drives this
  // themselves in this phase.
  async advanceStatus(id: string): Promise<OrderResult> {
    if (!isSupabaseDataSource) return { data: null, error: 'not_configured' };

    try {
      const { error: rpcError } = await getSupabaseClient().rpc('advance_order_status', { p_order_id: id });
      if (rpcError) return { data: null, error: normalizeServiceError(rpcError) };

      // Re-fetch so the caller gets the fully-updated order (new status,
      // timeline) in one round trip instead of reconstructing it by hand.
      return await orderService.get(id);
    } catch (error) {
      console.error('[WashGo] Unable to advance order status:', error);
      return { data: null, error: normalizeServiceError(error) };
    }
  },
};
