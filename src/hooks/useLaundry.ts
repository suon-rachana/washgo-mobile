import { useCallback, useEffect, useState } from 'react';

import { isSupabaseDataSource } from '@/src/config/dataSource';
import { laundries as mockLaundries } from '@/src/data/mock';
import { laundryService } from '@/src/services/laundryService';
import type { ServiceErrorCode } from '@/src/services/errors';
import type { Laundry } from '@/src/types/laundry';

export interface UseLaundryResult {
  laundry: Laundry | null;
  loading: boolean;
  error: ServiceErrorCode | null;
  reload: () => void;
}

// Same mock/Supabase split as useLaundries() — see that file.
export function useLaundry(id: string | undefined): UseLaundryResult {
  const mockMatch = id ? (mockLaundries.find((item) => item.id === id) ?? null) : null;

  const [laundry, setLaundry] = useState<Laundry | null>(isSupabaseDataSource ? null : mockMatch);
  const [loading, setLoading] = useState(isSupabaseDataSource && !!id);
  const [error, setError] = useState<ServiceErrorCode | null>(null);
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

    laundryService.get(id).then((result) => {
      if (cancelled) return;
      setLaundry(result.data);
      setError(result.error);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  return { laundry, loading, error, reload };
}
