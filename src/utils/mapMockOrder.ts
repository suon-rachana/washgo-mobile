import { addresses, dateOptions, laundries, promotions, services, sizeOptions, timeOptions } from '@/src/data/mock';
import type { OrderSummary } from '@/src/data/mock/orders';
import type { AppOrder, AppOrderItem } from '@/src/types/order';
import { estimateOrderTotal } from './estimateOrderTotal';

// Resolves a mock OrderSummary's id-reference fields (laundryId, serviceIds,
// addressId, sizeId, dateId, timeId) into the fully-resolved AppOrder shape
// screens actually render — the same shape orderService.ts produces for
// Supabase orders, so OrderSummaryCard/tracking/order-details need only one
// rendering path. See src/types/order.ts.
export function mapMockOrderToAppOrder(order: OrderSummary): AppOrder {
  const laundry = laundries.find((item) => item.id === order.laundryId);
  const address = addresses.find((item) => item.id === order.addressId);
  const size = sizeOptions.find((item) => item.id === order.sizeId);
  const date = dateOptions.find((item) => item.id === order.dateId);
  const time = timeOptions.find((item) => item.id === order.timeId);

  const selectedServiceIds = order.serviceIds.split(',').filter(Boolean);
  const selectedServices = services.filter((service) => selectedServiceIds.includes(service.id));
  const { laundryFee, pickupFee, returnDeliveryFee, discountAmount, total } = estimateOrderTotal(
    selectedServices,
    promotions[0]
  );

  const items: AppOrderItem[] = selectedServices.map((service) => ({
    id: service.id,
    serviceName: service.title,
    quantity: 1,
    unitPrice: service.price,
    lineTotal: service.price,
  }));

  return {
    id: order.id,
    laundryId: order.laundryId,
    laundryName: laundry?.name ?? 'Unknown laundry',
    addressLabel: address?.label ?? 'Not selected',
    addressLine: address?.detail ?? '',
    items,
    notes: order.notes,
    subtotal: laundryFee,
    pickupFee,
    deliveryFee: returnDeliveryFee,
    discount: discountAmount,
    total,
    currency: '$',
    status: order.status,
    stepId: order.currentStepId,
    paymentMethod: 'cash',
    createdAt: order.createdAt,
    estimatedArrival: order.estimatedArrival,
    sizeLabel: size?.label,
    sizeDetail: size?.detail,
    scheduledLabel: date && time ? `${date.label}, ${time.label}` : undefined,
    scheduledDetail: time?.detail,
  };
}
