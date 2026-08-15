import { useCallback, useEffect, useMemo, useState } from 'react';

import { isSupabaseDataSource } from '@/src/config/dataSource';
import { mockOrders } from '@/src/data/mock';
import { orderService } from '@/src/services/orderService';
import type { ServiceErrorCode } from '@/src/services/errors';
import type { AppOrder } from '@/src/types/order';
import { mapMockOrderToAppOrder } from '@/src/utils/mapMockOrder';

export interface UseOrdersResult {
  orders: AppOrder[];
  activeOrders: AppOrder[];
  pastOrders: AppOrder[];
  loading: boolean;
  error: ServiceErrorCode | null;
  reload: () => void;
}

// Same mock/Supabase split as useLaundries() — the Orders tab reads through
// this instead of the mock module directly so it renders identically
// regardless of source. See src/types/order.ts.
export function useOrders(): UseOrdersResult {
  const [orders, setOrders] = useState<AppOrder[]>(
    isSupabaseDataSource ? [] : mockOrders.map(mapMockOrderToAppOrder)
  );
  const [loading, setLoading] = useState(isSupabaseDataSource);
  const [error, setError] = useState<ServiceErrorCode | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!isSupabaseDataSource) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    orderService.list().then((result) => {
      if (cancelled) return;
      setOrders(result.data);
      setError(result.error);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const activeOrders = useMemo(() => orders.filter((order) => order.status === 'active'), [orders]);
  const pastOrders = useMemo(() => orders.filter((order) => order.status !== 'active'), [orders]);

  return { orders, activeOrders, pastOrders, loading, error, reload };
}
