// Shared shape for a laundry shop, used by both the mock catalog
// (src/data/mock/laundries.ts) and the Supabase-backed service
// (src/services/laundryService.ts) — screens and components render this one
// shape regardless of which data source is active.
export interface LaundryService {
  id: string;
  label: string;
  price: number;
}

export interface LaundryReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
}

export interface Laundry {
  id: string;
  name: string;
  rating: number;
  distanceKm: number;
  etaMinutes: number;
  startingPrice: number;
  currency: string;
  isOpen: boolean;
  services: LaundryService[];
  reviews: LaundryReview[];
  /**
   * Scheduled pickup/delivery slot text. Only ever populated by the mock
   * catalog (static, presentational). Real laundries don't have a fixed
   * per-shop window — scheduling happens per-order — so Supabase-backed
   * laundries leave this undefined and the UI falls back to a contact card
   * (phone/address) instead. See laundryService.ts.
   */
  pickupWindow?: string;
  deliveryWindow?: string;
  /** Only populated for Supabase-backed laundries. */
  phone?: string;
  addressLine?: string;
}
