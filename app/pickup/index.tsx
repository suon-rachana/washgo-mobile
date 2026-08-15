import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CharacterCounter, SelectableOption } from '@/src/components/common';
import { AppScreen } from '@/src/components/layout';
import { Button, Input } from '@/src/components/ui';
import { addresses, dateOptions, mapLocationAddress, sizeOptions, timeOptions } from '@/src/data/mock';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Radius, Spacing } from '@/src/theme';
import { formatCoordinates, parseLatitudeParam, parseLongitudeParam } from '@/src/utils/coordinates';

const NOTES_MAX_LENGTH = 150;

export default function PickupBookingScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { t } = useTranslation();
  const { laundryId, serviceIds, selectedLocation, latitude, longitude } = useLocalSearchParams<{
    laundryId?: string;
    serviceIds?: string;
    selectedLocation?: string;
    latitude?: string;
    longitude?: string;
  }>();

  const isMapLocationSelected = selectedLocation === mapLocationAddress.id;

  // Route params arrive as strings (or may be missing/malformed) — never
  // trust them blindly, only use them once both parse to valid coordinates.
  const selectedCoordinates = useMemo(() => {
    const parsedLatitude = parseLatitudeParam(latitude);
    const parsedLongitude = parseLongitudeParam(longitude);
    return parsedLatitude !== null && parsedLongitude !== null
      ? { latitude: parsedLatitude, longitude: parsedLongitude }
      : null;
  }, [latitude, longitude]);

  // The map-picked location is only added to this screen's own displayed
  // options when the user actually returns from /map with a selection — the
  // shared `addresses` mock list itself is never mutated. `mapLocationAddress`
  // remains the fallback display information; when valid coordinates came
  // back from /map, they're appended beneath its address line.
  const addressOptions = useMemo(() => {
    if (!isMapLocationSelected) return addresses;
    const mapAddress = selectedCoordinates
      ? { ...mapLocationAddress, detail: `${mapLocationAddress.detail}\n${formatCoordinates(selectedCoordinates)}` }
      : mapLocationAddress;
    return [mapAddress, ...addresses];
  }, [isMapLocationSelected, selectedCoordinates]);

  const [addressId, setAddressId] = useState<string | null>(() =>
    isMapLocationSelected ? mapLocationAddress.id : null
  );
  const [sizeId, setSizeId] = useState<string | null>(null);
  const [dateId, setDateId] = useState<string | null>(null);
  const [timeId, setTimeId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const isComplete = !!addressId && !!sizeId && !!dateId && !!timeId;

  const handleContinue = () => {
    // `/summary` is an index route; see the Href-cast note in app/(tabs)/home.tsx —
    // the local typed-routes generator doesn't collapse index files to their parent path.
    router.push({
      pathname: '/summary',
      params: {
        ...(laundryId ? { laundryId } : {}),
        ...(serviceIds ? { serviceIds } : {}),
        addressId: addressId ?? '',
        sizeId: sizeId ?? '',
        dateId: dateId ?? '',
        timeId: timeId ?? '',
      },
    } as unknown as Href);
  };

  const handleChooseOnMap = () => {
    // `/map` is an index route; see the Href-cast note in app/(tabs)/home.tsx —
    // the local typed-routes generator doesn't collapse index files to their parent path.
    router.push({
      pathname: '/map',
      params: {
        ...(laundryId ? { laundryId } : {}),
        ...(serviceIds ? { serviceIds } : {}),
      },
    } as unknown as Href);
  };

  return (
    <AppScreen
      title={t('pickupDetails')}
      keyboardAvoiding
      footer={
        <Button
          title="Schedule Pickup"
          fullWidth
          disabled={!isComplete}
          onPress={handleContinue}
          accessibilityHint="Continues to review your order summary"
        />
      }
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pickup Address</Text>
        <View style={styles.optionList}>
          {addressOptions.map((address) => (
            <SelectableOption
              key={address.id}
              title={address.label}
              detail={address.detail}
              icon={address.icon}
              selected={addressId === address.id}
              onPress={() => setAddressId(address.id)}
              accessibilityLabel={`Select pickup address ${address.label}`}
            />
          ))}
          <Pressable
            onPress={() => console.log('Add new address pressed')}
            accessibilityRole="button"
            accessibilityLabel="Add new address"
            accessibilityHint="Opens a form to save a new pickup address"
            style={({ pressed }) => [styles.addAddress, pressed && styles.addAddressPressed]}
          >
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.addAddressText}>Add New Address</Text>
          </Pressable>
        </View>

        <Button
          title={t('chooseOnMap')}
          variant="outline"
          fullWidth
          onPress={handleChooseOnMap}
          icon={<Ionicons name="map-outline" size={16} color={colors.primary} />}
          accessibilityHint="Opens a map to choose your pickup point"
          style={styles.chooseOnMapButton}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Laundry Size Estimate</Text>
        <View style={styles.optionList}>
          {sizeOptions.map((size) => (
            <SelectableOption
              key={size.id}
              title={size.label}
              detail={size.detail}
              selected={sizeId === size.id}
              onPress={() => setSizeId(size.id)}
              accessibilityLabel={`Select laundry size ${size.label}`}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pickup Date</Text>
        <View style={styles.optionRowGroup}>
          {dateOptions.map((date) => (
            <SelectableOption
              key={date.id}
              title={date.label}
              selected={dateId === date.id}
              onPress={() => setDateId(date.id)}
              fullWidth={false}
              accessibilityLabel={`Select pickup date ${date.label}`}
            />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pickup Time</Text>
        <View style={styles.optionList}>
          {timeOptions.map((time) => (
            <SelectableOption
              key={time.id}
              title={time.label}
              detail={time.detail}
              selected={timeId === time.id}
              onPress={() => setTimeId(time.id)}
              accessibilityLabel={`Select pickup time ${time.label}`}
            />
          ))}
        </View>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <Text style={styles.sectionTitle}>Pickup Notes</Text>
        <Input
          placeholder="Any notes for the rider?"
          multiline
          numberOfLines={4}
          maxLength={NOTES_MAX_LENGTH}
          value={notes}
          onChangeText={setNotes}
          accessibilityLabel="Pickup notes"
        />
        <CharacterCounter current={notes.length} max={NOTES_MAX_LENGTH} style={styles.counter} />
      </View>
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    section: {
      marginBottom: Spacing.xl,
    },
    lastSection: {
      marginBottom: 0,
    },
    sectionTitle: {
      fontSize: typography.subtitle.fontSize,
      lineHeight: typography.subtitle.lineHeight,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.text,
      marginBottom: Spacing.md,
    },
    optionList: {
      gap: Spacing.sm,
    },
    chooseOnMapButton: {
      marginTop: Spacing.sm,
    },
    optionRowGroup: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    addAddress: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      borderWidth: 1,
      borderColor: colors.border,
      borderStyle: 'dashed',
      borderRadius: Radius.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      justifyContent: 'center',
    },
    addAddressPressed: {
      opacity: 0.7,
    },
    addAddressText: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.primary,
    },
    counter: {
      alignSelf: 'flex-end',
      marginTop: Spacing.xxs,
    },
  });
