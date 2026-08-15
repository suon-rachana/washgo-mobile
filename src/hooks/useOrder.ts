import { useCallback, useEffect, useState } from 'react';

import { isSupabaseDataSource } from '@/src/config/dataSource';
import { activeOrders, getOrderById } from '@/src/data/mock';
import { orderService } from '@/src/services/orderService';
import type { ServiceErrorCode } from '@/src/services/errors';
import type { AppOrder } from '@/src/types/order';
import { mapMockOrderToAppOrder } from '@/src/utils/mapMockOrder';

export interface UseOrderResult {
  order: AppOrder | null;
  loading: boolean;
  error: ServiceErrorCode | null;
  reload: () => void;
  /** Demo-only status progression — see the RPC's comment. No-op in mock mode. */
  advanceStatus: () => Promise<void>;
  isAdvancing: boolean;
}

function resolveMockOrder(id: string | undefined): AppOrder | null {
  // Tracking can be opened without an id yet (the booking flow doesn't
  // thread one through everywhere) — falls back to the first active mock
  // order so the screen still has something to show, same as before.
  const match = getOrderById(id) ?? activeOrders[0];
  return match ? mapMockOrderToAppOrder(match) : null;
}

// Same mock/Supabase split as useLaundry() — used by tracking and
// order-details.
export function useOrder(id: string | undefined): UseOrderResult {
  const [order, setOrder] = useState<AppOrder | null>(isSupabaseDataSource ? null : resolveMockOrder(id));
  const [loading, setLoading] = useState(isSupabaseDataSource && !!id);
  const [error, setError] = useState<ServiceErrorCode | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!isSupabaseDataSource) return;
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    orderService.get(id).then((result) => {
      if (cancelled) return;
      setOrder(result.data);
      setError(result.error);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  const advanceStatus = useCallback(async () => {
    if (!isSupabaseDataSource || !id) return;

    setIsAdvancing(true);
    const result = await orderService.advanceStatus(id);
    setIsAdvancing(false);

    if (result.error) {
      console.error('[WashGo] Unable to advance order status:', result.error);
      return;
    }
    setOrder(result.data);
  }, [id]);

  return { order, loading, error, reload, advanceStatus, isAdvancing };
}
