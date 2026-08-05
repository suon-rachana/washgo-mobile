import { isSupabaseDataSource } from '@/src/config/dataSource';
import { getSupabaseClient } from '@/src/lib/supabase';
import type { AddressInsert, AddressRow, AddressUpdate } from '@/src/types/database';
import { authService } from './authService';
import { normalizeServiceError, type ServiceErrorCode } from './errors';

export interface AddressListResult {
  data: AddressRow[];
  error: ServiceErrorCode | null;
}

export interface AddressMutationResult {
  data: AddressRow | null;
  error: ServiceErrorCode | null;
}

export interface AddressVoidResult {
  error: ServiceErrorCode | null;
}

// `is_default` is intentionally excluded: it can only ever be changed via
// setDefault() → the set_default_address() RPC, which atomically clears the
// previous default first. No caller can request a row be inserted/updated
// straight into "default" and risk the one-default-per-user constraint.
export type NewAddressInput = Omit<AddressInsert, 'user_id' | 'id' | 'is_default'>;

export const addressService = {
  async list(): Promise<AddressListResult> {
    if (!isSupabaseDataSource) return { data: [], error: 'not_configured' };

    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) return { data: [], error: 'not_authenticated' };

      const { data, error } = await getSupabaseClient()
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (__DEV__) {
        console.log('[WashGo][diag] addressService.list:', {
          table: 'addresses',
          userId,
          rowCount: data?.length ?? 0,
          error: error ? { code: error.code, message: error.message, details: error.details, hint: error.hint } : null,
        });
      }

      if (error) return { data: [], error: normalizeServiceError(error) };
      return { data: data ?? [], error: null };
    } catch (error) {
      console.error('[WashGo] Unable to load addresses:', error);
      return { data: [], error: normalizeServiceError(error) };
    }
  },

  async get(id: string): Promise<AddressMutationResult> {
    if (!isSupabaseDataSource) return { data: null, error: 'not_configured' };

    try {
      const { data, error } = await getSupabaseClient().from('addresses').select('*').eq('id', id).single();

      if (error) return { data: null, error: normalizeServiceError(error) };
      return { data, error: null };
    } catch (error) {
      console.error('[WashGo] Unable to load address:', error);
      return { data: null, error: normalizeServiceError(error) };
    }
  },

  async add(input: NewAddressInput): Promise<AddressMutationResult> {
    if (!isSupabaseDataSource) return { data: null, error: 'not_configured' };

    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) return { data: null, error: 'not_authenticated' };

      const client = getSupabaseClient();

      // Safe flow (see set_default_address() and the addresses_one_default_per_user
      // unique index in supabase/migrations/001_initial_schema.sql): always insert
      // as non-default first.
      const { data, error } = await client
        .from('addresses')
        .insert({ ...input, user_id: userId, is_default: false })
        .select()
        .single();

      if (error) return { data: null, error: normalizeServiceError(error) };

      // A user's first saved address becomes their default automatically.
      // Counted after insert (rather than checked-then-inserted) so two
      // concurrent first-adds can't both decide they're "the first" and race
      // the unique-default constraint — only the RPC ever flips is_default.
      const { count, error: countError } = await client
        .from('addresses')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (!countError && count === 1) {
        const { error: defaultError } = await client.rpc('set_default_address', { p_address_id: data.id });

        if (!defaultError) {
          return { data: { ...data, is_default: true }, error: null };
        }

        // Non-fatal: the address was created successfully. It just stays
        // non-default until the user taps "Set as default" themselves.
        console.error('[WashGo] Unable to auto-default first address:', defaultError);
      }

      return { data, error: null };
    } catch (error) {
      console.error('[WashGo] Unable to add address:', error);
      return { data: null, error: normalizeServiceError(error) };
    }
  },

  async update(id: string, input: AddressUpdate): Promise<AddressMutationResult> {
    if (!isSupabaseDataSource) return { data: null, error: 'not_configured' };

    try {
      // Same reasoning as add(): is_default only ever moves through
      // setDefault() → the RPC, never a direct field update.
      const safeInput: AddressUpdate = { ...input };
      delete safeInput.is_default;

      const { data, error } = await getSupabaseClient()
        .from('addresses')
        .update(safeInput)
        .eq('id', id)
        .select()
        .single();

      if (error) return { data: null, error: normalizeServiceError(error) };
      return { data, error: null };
    } catch (error) {
      console.error('[WashGo] Unable to update address:', error);
      return { data: null, error: normalizeServiceError(error) };
    }
  },

  async remove(id: string): Promise<AddressVoidResult> {
    if (!isSupabaseDataSource) return { error: 'not_configured' };

    try {
      const { error } = await getSupabaseClient().from('addresses').delete().eq('id', id);

      if (error) return { error: normalizeServiceError(error) };
      return { error: null };
    } catch (error) {
      console.error('[WashGo] Unable to delete address:', error);
      return { error: normalizeServiceError(error) };
    }
  },

  // Delegates to the set_default_address() database function so "unset the
  // old default, set the new one" happens atomically — see
  // supabase/migrations/001_initial_schema.sql. A naive two-step update from
  // the client could race or transiently violate the one-default-per-user
  // constraint.
  async setDefault(id: string): Promise<AddressVoidResult> {
    if (!isSupabaseDataSource) return { error: 'not_configured' };

    try {
      const { error } = await getSupabaseClient().rpc('set_default_address', { p_address_id: id });

      if (error) return { error: normalizeServiceError(error) };
      return { error: null };
    } catch (error) {
      console.error('[WashGo] Unable to set default address:', error);
      return { error: normalizeServiceError(error) };
    }
  },
};
