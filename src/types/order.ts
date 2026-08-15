import type { OrderStepId } from '@/src/data/mock/order';
import type { OrderStatus, PaymentMethodType } from '@/src/types/database';

export type OrderLifecycleStatus = 'active' | 'completed' | 'cancelled';

export interface AppOrderItem {
  id: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

// Shared shape order screens render, regardless of source — mirrors the
// Laundry/AppNotification pattern from Phases 2-3. Mock orders (src/data/mock/orders.ts)
// resolve their id-reference fields (laundryId, serviceIds, addressId, ...)
// into this fully-resolved shape in src/utils/mapMockOrder.ts; Supabase
// orders resolve their row + joined order_items in orderService.ts.
export interface AppOrder {
  id: string;
  laundryId: string;
  laundryName: string;
  addressLabel: string;
  addressLine: string;
  items: AppOrderItem[];
  notes: string;
  subtotal: number;
  pickupFee: number;
  deliveryFee: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderLifecycleStatus;
  /** Reuses the mock catalog's step vocabulary (src/data/mock/order.ts) so
   *  OrderTimeline/getOrderStatusLabelKey don't need a second copy for
   *  Supabase-backed orders — see DB_STATUS_TO_STEP_ID below. */
  stepId: OrderStepId;
  paymentMethod: PaymentMethodType;
  createdAt: string;
  estimatedArrival?: string;
  /** Mock only — real orders have no dedicated size column (see the
   *  create_order() RPC comment); size is folded into `notes` instead. */
  sizeLabel?: string;
  sizeDetail?: string;
  /** Human-readable scheduled pickup window, formatted differently per
   *  source: mock reads its date/time option labels, Supabase formats
   *  `pickup_scheduled_at`. */
  scheduledLabel?: string;
  scheduledDetail?: string;
}

const DB_STATUS_TO_STEP_ID: Record<OrderStatus, OrderStepId> = {
  pending: 'order-placed',
  rider_assigned: 'rider-assigned',
  picked_up: 'picked-up',
  at_laundry: 'at-laundry-shop',
  washing: 'cleaning-in-progress',
  ready_for_delivery: 'ready-for-delivery',
  out_for_delivery: 'out-for-delivery',
  delivered: 'delivered',
  // Lifecycle status ('cancelled') is what the UI actually branches on for
  // this case — see getOrderStatusLabelKey — so the step id is unused here.
  cancelled: 'order-placed',
};

export function dbStatusToStepId(status: OrderStatus): OrderStepId {
  return DB_STATUS_TO_STEP_ID[status];
}

export function dbStatusToLifecycle(status: OrderStatus): OrderLifecycleStatus {
  if (status === 'cancelled') return 'cancelled';
  if (status === 'delivered') return 'completed';
  return 'active';
}
