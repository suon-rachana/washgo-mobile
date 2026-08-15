import { useCallback, useEffect, useState } from 'react';

import { isSupabaseDataSource } from '@/src/config/dataSource';
import { addresses as mockAddresses } from '@/src/data/mock';
import { addressService } from '@/src/services/addressService';
import type { ServiceErrorCode } from '@/src/services/errors';
import { fromMockAddress, fromSupabaseAddress, type DisplayAddress } from '@/src/types/address';

export interface UseAddressesResult {
  addresses: DisplayAddress[];
  loading: boolean;
  error: ServiceErrorCode | null;
  reload: () => void;
}

// Same mock/Supabase split as useLaundries() — used by the pickup flow
// (Phase 4) to let customers choose a real saved address instead of the
// mock catalog. app/addresses/index.tsx manages its own fetch directly
// rather than this hook since it also needs mutation methods (add/edit/
// delete/set-default); this covers the read-only selection use case.
export function useAddresses(): UseAddressesResult {
  const [addresses, setAddresses] = useState<DisplayAddress[]>(
    isSupabaseDataSource ? [] : mockAddresses.map(fromMockAddress)
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

    addressService.list().then((result) => {
      if (cancelled) return;
      setAddresses(result.data.map(fromSupabaseAddress));
      setError(result.error);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return { addresses, loading, error, reload };
}
