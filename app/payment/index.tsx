import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { SelectableOption } from '@/src/components/common';
import { AppScreen } from '@/src/components/layout';
import { Button } from '@/src/components/ui';
import { isSupabaseDataSource } from '@/src/config/dataSource';
import { DEFAULT_PAYMENT_METHOD_ID, paymentMethods } from '@/src/data/mock';
import { useTranslation } from '@/src/i18n';
import { orderService } from '@/src/services/orderService';
import { Spacing } from '@/src/theme';
import type { PaymentMethodType } from '@/src/types/database';
import { parseLatitudeParam, parseLongitudeParam } from '@/src/utils/coordinates';
import { resolvePickupScheduledAt } from '@/src/utils/pickupSchedule';

// Only 'cod' (Cash on Delivery) is actually enabled today — every other
// mock payment method is comingSoon — but this maps all of them so the
// mapping doesn't silently need revisiting once more go live.
const PAYMENT_METHOD_TO_DB_TYPE: Record<string, PaymentMethodType> = {
  cod: 'cash',
  khqr: 'wallet',
  aba: 'wallet',
  acleda: 'wallet',
  wing: 'wallet',
};

export default function PaymentMethodScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    orderId,
    laundryId,
    serviceIds,
    addressLabel,
    addressLine,
    addressLatitude,
    addressLongitude,
    dateId,
    timeId,
    notes,
  } = useLocalSearchParams<{
    orderId?: string;
    laundryId?: string;
    serviceIds?: string;
    addressLabel?: string;
    addressLine?: string;
    addressLatitude?: string;
    addressLongitude?: string;
    dateId?: string;
    timeId?: string;
    notes?: string;
  }>();
  const [selectedMethodId, setSelectedMethodId] = useState(DEFAULT_PAYMENT_METHOD_ID);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmPickup = async () => {
    if (!isSupabaseDataSource) {
      // `/success` is an index route; see the Href-cast note in app/(tabs)/home.tsx —
      // the local typed-routes generator doesn't collapse index files to their parent path.
      router.push({
        pathname: '/success',
        params: { ...(orderId ? { orderId } : {}) },
      } as unknown as Href);
      return;
    }

    // This is the actual order-creation point in Supabase mode — everything
    // before it (services/pickup/summary) only threads params through route
    // params. See create_order() in 004_order_creation_and_status.sql.
    const items = (serviceIds ?? '')
      .split(',')
      .filter(Boolean)
      .map((serviceId) => ({ service_id: serviceId }));

    if (!laundryId || items.length === 0 || !addressLine) {
      Alert.alert(t('somethingWentWrong'), 'Missing required booking details — please start over.');
      return;
    }

    setIsSubmitting(true);
    const { data: newOrderId, error } = await orderService.create({
      laundryId,
      items,
      addressLabel: addressLabel ?? null,
      addressLine,
      addressLatitude: parseLatitudeParam(addressLatitude),
      addressLongitude: parseLongitudeParam(addressLongitude),
      deliveryInstructions: null,
      pickupScheduledAt: resolvePickupScheduledAt(dateId, timeId),
      notes: notes ?? null,
      paymentMethod: PAYMENT_METHOD_TO_DB_TYPE[selectedMethodId] ?? 'cash',
    });
    setIsSubmitting(false);

    if (error || !newOrderId) {
      Alert.alert(t('somethingWentWrong'), undefined, [{ text: t('cancel'), style: 'cancel' }]);
      return;
    }

    router.push({
      pathname: '/success',
      params: { orderId: newOrderId },
    } as unknown as Href);
  };

  return (
    <AppScreen
      title="Payment Method"
      footer={
        <Button
          title="Confirm Pickup"
          variant="accent"
          fullWidth
          onPress={handleConfirmPickup}
          loading={isSubmitting}
          disabled={isSubmitting}
          accessibilityHint="Confirms your payment method and completes the pickup request"
        />
      }
    >
      <View style={styles.optionList}>
        {paymentMethods.map((method) => (
          <SelectableOption
            key={method.id}
            title={method.label}
            icon={method.icon}
            selected={selectedMethodId === method.id}
            onPress={() => setSelectedMethodId(method.id)}
            accessibilityLabel={`Select payment method ${method.label}`}
          />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  optionList: {
    gap: Spacing.sm,
  },
});
