import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Region } from 'react-native-maps';

import { AppScreen } from '@/src/components/layout';
import { LocationMap, MapErrorBoundary, MockMapCanvas } from '@/src/components/map';
import { Button, Card } from '@/src/components/ui';
import { mapLocationAddress } from '@/src/data/mock';
import { useCurrentLocation } from '@/src/hooks/useCurrentLocation';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Radius, Spacing } from '@/src/theme';
import { formatCoordinates, type Coordinates } from '@/src/utils/coordinates';

// Default pickup coordinates for Siem Reap, Cambodia — used as the initial
// map center and as the fallback selection if the user never moves the map.
const INITIAL_COORDINATES: Coordinates = {
  latitude: 13.3671,
  longitude: 103.8448,
};
const REGION_DELTA = 0.015;
const INITIAL_REGION: Region = {
  ...INITIAL_COORDINATES,
  latitudeDelta: REGION_DELTA,
  longitudeDelta: REGION_DELTA,
};

export default function ChooseLocationScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { t } = useTranslation();
  const { laundryId, serviceIds } = useLocalSearchParams<{ laundryId?: string; serviceIds?: string }>();

  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates>(INITIAL_COORDINATES);

  const handleCoordinatesChange = useCallback((coordinates: Coordinates) => {
    setSelectedCoordinates(coordinates);
  }, []);

  // Only used by MapErrorBoundary's fallback below, for the rare case the
  // real MapView fails to render on a native platform (web already renders
  // the mock canvas on its own — see LocationMap.web.tsx). The real
  // LocationMap owns its own current-location flow so it can animate the
  // camera internally.
  const { isLocating: isFallbackLocating, requestCurrentLocation: requestFallbackLocation } = useCurrentLocation({
    onLocated: handleCoordinatesChange,
  });

  const handleConfirm = () => {
    // `/pickup` is an index route; see the Href-cast note in app/(tabs)/home.tsx —
    // the local typed-routes generator doesn't collapse index files to their parent path.
    router.replace({
      pathname: '/pickup',
      params: {
        ...(laundryId ? { laundryId } : {}),
        ...(serviceIds ? { serviceIds } : {}),
        selectedLocation: mapLocationAddress.id,
        latitude: String(selectedCoordinates.latitude),
        longitude: String(selectedCoordinates.longitude),
      },
    } as unknown as Href);
  };

  return (
    <AppScreen
      title={t('chooseLocation')}
      footer={
        <Button
          title={t('confirmLocation')}
          fullWidth
          onPress={handleConfirm}
          accessibilityHint="Returns to pickup details with this location selected"
        />
      }
    >
      <MapErrorBoundary
        fallback={<MockMapCanvas onCurrentLocationPress={requestFallbackLocation} isLocating={isFallbackLocating} />}
      >
        <LocationMap initialRegion={INITIAL_REGION} onCoordinatesChange={handleCoordinatesChange} />
      </MapErrorBoundary>

      <Card variant="outlined" style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <View style={styles.previewIcon}>
            <Ionicons name="location-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.previewTextWrap}>
            <Text style={styles.previewTitle}>{t('selectedLocation')}</Text>
            <Text style={styles.previewSubtitle}>{mapLocationAddress.detail}</Text>
          </View>
        </View>

        <View style={styles.coordRow}>
          <Text style={styles.coordLabel}>{t('selectedCoordinates')}</Text>
          <Text style={styles.coordValue}>{formatCoordinates(selectedCoordinates)}</Text>
        </View>
        {/* Future: use reverse geocoding to display the selected street address. */}
      </Card>
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    previewCard: {
      marginBottom: Spacing.xl,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.md,
    },
    previewIcon: {
      width: 36,
      height: 36,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    previewTextWrap: {
      flex: 1,
    },
    previewTitle: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
      marginBottom: Spacing.xxs,
    },
    previewSubtitle: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
    coordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    coordLabel: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
    coordValue: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
    },
  });
