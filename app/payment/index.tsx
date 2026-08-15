import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SelectableOption } from '@/src/components/common';
import { AppScreen } from '@/src/components/layout';
import { Button } from '@/src/components/ui';
import { DEFAULT_PAYMENT_METHOD_ID, paymentMethods } from '@/src/data/mock';
import { Spacing } from '@/src/theme';

export default function PaymentMethodScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const [selectedMethodId, setSelectedMethodId] = useState(DEFAULT_PAYMENT_METHOD_ID);

  const handleConfirmPickup = () => {
    // `/success` is an index route; see the Href-cast note in app/(tabs)/home.tsx —
    // the local typed-routes generator doesn't collapse index files to their parent path.
    router.push({
      pathname: '/success',
      params: { ...(orderId ? { orderId } : {}) },
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
