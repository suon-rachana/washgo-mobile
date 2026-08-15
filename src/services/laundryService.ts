import { isSupabaseDataSource } from '@/src/config/dataSource';
import { getSupabaseClient } from '@/src/lib/supabase';
import type { LaundryRow, LaundryServiceRow } from '@/src/types/database';
import type { Laundry } from '@/src/types/laundry';
import { haversineDistanceKm, type Coordinates } from '@/src/utils/coordinates';
import { normalizeServiceError, type ServiceErrorCode } from './errors';

export interface LaundryListResult {
  data: Laundry[];
  error: ServiceErrorCode | null;
}

export interface LaundryResult {
  data: Laundry | null;
  error: ServiceErrorCode | null;
}

// WashGo's launch city center (see docs/01_PROJECT_FOUNDATION.md) — used as
// the reference point for "distance away" until these screens request the
// customer's live location (currently only the pickup/map flow does that).
// Real distance-from-you will replace this once that's wired up.
const SIEM_REAP_CENTER: Coordinates = { latitude: 13.3671, longitude: 103.8448 };

const CURRENCY = '$';

// Heuristic placeholder ETA — a fixed base plus a per-km factor — until a
// real routing/traffic service backs this. Matches the rough shape of the
// old mock data (25-50 min across ~1-3 km).
function estimateEtaMinutes(distanceKm: number): number {
  return Math.round(15 + distanceKm * 8);
}

function mapLaundryRow(row: LaundryRow, services: LaundryServiceRow[]): Laundry {
  const distanceKm =
    row.latitude !== null && row.longitude !== null
      ? haversineDistanceKm(SIEM_REAP_CENTER, { latitude: row.latitude, longitude: row.longitude })
      : 0;

  const activeServices = services.filter((service) => service.is_active);
  const startingPrice = activeServices.reduce(
    (min, service) => (min === null ? service.price : Math.min(min, service.price)),
    null as number | null
  );

  return {
    id: row.id,
    name: row.name,
    rating: row.rating_average,
    distanceKm,
    etaMinutes: estimateEtaMinutes(distanceKm),
    startingPrice: startingPrice ?? 0,
    currency: CURRENCY,
    isOpen: row.is_open,
    services: activeServices.map((service) => ({
      id: service.id,
      label: service.name,
      price: service.price,
    })),
    // No reviews table yet — Phase 2 covers laundries + services only. The
    // laundry detail screen shows an empty state instead of a broken list.
    reviews: [],
    phone: row.phone ?? undefined,
    addressLine: row.address_line ?? undefined,
  };
}

interface LaundryWithServices extends LaundryRow {
  laundry_services: LaundryServiceRow[];
}

export const laundryService = {
  // RLS (laundries_select_approved) already restricts this to
  // approval_status = 'approved' — no need to filter client-side.
  async list(): Promise<LaundryListResult> {
    if (!isSupabaseDataSource) return { data: [], error: 'not_configured' };

    try {
      const { data, error } = await getSupabaseClient()
        .from('laundries')
        .select('*, laundry_services(*)')
        .order('name', { ascending: true })
        .returns<LaundryWithServices[]>();

      if (__DEV__) {
        console.log('[WashGo][diag] laundryService.list:', {
          table: 'laundries',
          rowCount: data?.length ?? 0,
          error: error ? { code: error.code, message: error.message, details: error.details, hint: error.hint } : null,
        });
      }

      if (error) return { data: [], error: normalizeServiceError(error) };
      return { data: (data ?? []).map((row) => mapLaundryRow(row, row.laundry_services)), error: null };
    } catch (error) {
      console.error('[WashGo] Unable to load laundries:', error);
      return { data: [], error: normalizeServiceError(error) };
    }
  },

  async get(id: string): Promise<LaundryResult> {
    if (!isSupabaseDataSource) return { data: null, error: 'not_configured' };

    try {
      const { data, error } = await getSupabaseClient()
        .from('laundries')
        .select('*, laundry_services(*)')
        .eq('id', id)
        .single<LaundryWithServices>();

      if (error) return { data: null, error: normalizeServiceError(error) };
      return { data: mapLaundryRow(data, data.laundry_services), error: null };
    } catch (error) {
      console.error('[WashGo] Unable to load laundry:', error);
      return { data: null, error: normalizeServiceError(error) };
    }
  },
};
