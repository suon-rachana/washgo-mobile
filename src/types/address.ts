import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import type { Address as MockAddress } from '@/src/data/mock';
import type { AddressRow } from '@/src/types/database';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Shared shape both app/addresses/index.tsx and the pickup flow (Phase 4)
// render, regardless of source.
export interface DisplayAddress {
  id: string;
  label: string;
  detail: string;
  isDefault: boolean;
  icon: IconName;
  /** Only populated for Supabase addresses — used to build a real order's
   *  address snapshot in app/summary + app/payment. */
  latitude?: number | null;
  longitude?: number | null;
}

export function fromMockAddress(address: MockAddress): DisplayAddress {
  return { id: address.id, label: address.label, detail: address.detail, isDefault: !!address.isDefault, icon: address.icon };
}

export function fromSupabaseAddress(address: AddressRow): DisplayAddress {
  return {
    id: address.id,
    label: address.label,
    detail: address.address_line,
    isDefault: address.is_default,
    icon: 'location-outline',
    latitude: address.latitude,
    longitude: address.longitude,
  };
}
