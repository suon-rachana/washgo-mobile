import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useFavoritesStore } from '@/src/store/favorites';

export interface FavoriteHeaderButtonProps {
  laundryId: string;
}

// Native-header right action shared by Laundry Details and Select Services —
// same favorite-toggle heart, same store, just relocated out of in-page
// headers and into the header bar itself.
export function FavoriteHeaderButton({ laundryId }: FavoriteHeaderButtonProps) {
  const colors = useThemeColors();
  const isFavorite = useFavoritesStore((state) => state.isFavorite(laundryId));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return (
    <Pressable
      onPress={() => toggleFavorite(laundryId)}
      hitSlop={11}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? 'Remove from favorites' : 'Favorite laundry'}
      accessibilityHint={isFavorite ? 'Removes this laundry from your favorites' : 'Marks this laundry as a favorite'}
      accessibilityState={{ selected: isFavorite }}
      style={styles.button}
    >
      <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color={isFavorite ? colors.danger : colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
});
