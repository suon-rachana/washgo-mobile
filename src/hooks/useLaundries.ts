import { useCallback, useEffect, useState } from 'react';

import { isSupabaseDataSource } from '@/src/config/dataSource';
import { laundries as mockLaundries } from '@/src/data/mock';
import { laundryService } from '@/src/services/laundryService';
import type { ServiceErrorCode } from '@/src/services/errors';
import type { Laundry } from '@/src/types/laundry';

export interface UseLaundriesResult {
  laundries: Laundry[];
  loading: boolean;
  error: ServiceErrorCode | null;
  reload: () => void;
}

// Mock mode returns the static catalog instantly (no network, no loading
// state — matches the app's behavior before this hook existed). Supabase
// mode fetches from laundryService and exposes loading/error like the
// addresses/profile screens do.
export function useLaundries(): UseLaundriesResult {
  const [laundries, setLaundries] = useState<Laundry[]>(isSupabaseDataSource ? [] : mockLaundries);
  const [loading, setLoading] = useState(isSupabaseDataSource);
  const [error, setError] = useState<ServiceErrorCode | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    if (!isSupabaseDataSource) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    laundryService.list().then((result) => {
      if (cancelled) return;
      setLaundries(result.data);
      setError(result.error);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return { laundries, loading, error, reload };
}
