import { create } from 'zustand';

import { isSupabaseDataSource } from '@/src/config/dataSource';
import { favoriteService } from '@/src/services/favoriteService';

interface FavoritesState {
  favoriteIds: Set<string>;
  isLoading: boolean;
  isFavorite: (laundryId: string) => boolean;
  toggleFavorite: (laundryId: string) => void;
  /** Fetches the signed-in user's favorites once per session. No-op in mock mode. */
  load: () => Promise<void>;
  /** Clears state on sign-out so the next account doesn't see a stale set. No-op in mock mode. */
  reset: () => void;
}

// Guards load() against duplicate concurrent calls (e.g. both the layout's
// auth listener and a screen mount racing) — module-level like
// hasInitialized in store/auth.ts, not store state, so reset() can flip it
// back without a render.
let hasLoaded = false;

// Global state — shared between the Favorites list and the heart toggle on
// Laundry Details so toggling a favorite anywhere updates everywhere
// immediately. Mock mode: client-only, resets on app restart (unchanged
// behavior). Supabase mode: hydrated from the favorites table on sign-in
// (see the RootLayout effect in app/_layout.tsx) and persisted optimistically
// — toggle flips local state immediately and reverts if the write fails.
export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoriteIds: isSupabaseDataSource ? new Set() : new Set(['laundry-1', 'laundry-3']),
  isLoading: false,

  isFavorite: (laundryId) => get().favoriteIds.has(laundryId),

  toggleFavorite: (laundryId) => {
    const wasFavorite = get().favoriteIds.has(laundryId);

    set((state) => {
      const nextFavoriteIds = new Set(state.favoriteIds);
      if (wasFavorite) {
        nextFavoriteIds.delete(laundryId);
      } else {
        nextFavoriteIds.add(laundryId);
      }
      return { favoriteIds: nextFavoriteIds };
    });

    if (!isSupabaseDataSource) return;

    const persist = wasFavorite ? favoriteService.remove(laundryId) : favoriteService.add(laundryId);
    persist.then(({ error }) => {
      if (!error) return;

      console.error('[WashGo] Unable to sync favorite, reverting:', error);
      set((state) => {
        const revertedIds = new Set(state.favoriteIds);
        if (wasFavorite) {
          revertedIds.add(laundryId);
        } else {
          revertedIds.delete(laundryId);
        }
        return { favoriteIds: revertedIds };
      });
    });
  },

  load: async () => {
    if (!isSupabaseDataSource || hasLoaded) return;
    hasLoaded = true;

    set({ isLoading: true });
    const { data } = await favoriteService.list();
    set({ favoriteIds: new Set(data), isLoading: false });
  },

  reset: () => {
    if (!isSupabaseDataSource) return;
    hasLoaded = false;
    set({ favoriteIds: new Set(), isLoading: false });
  },
}));
