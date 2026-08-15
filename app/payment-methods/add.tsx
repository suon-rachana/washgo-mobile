import type { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { Alert } from 'react-native';

import { MenuRow } from '@/src/components/common';
import { AppScreen } from '@/src/components/layout';
import { Card } from '@/src/components/ui';
import { useTranslation } from '@/src/i18n';

interface AddOption {
  id: string;
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}

const ADD_OPTIONS: AddOption[] = [
  { id: 'link-aba', label: 'Link ABA Pay', icon: 'phone-portrait-outline' },
  { id: 'link-acleda', label: 'Link ACLEDA', icon: 'business-outline' },
  { id: 'link-wing', label: 'Link Wing', icon: 'wallet-outline' },
  { id: 'use-khqr', label: 'Use KHQR', icon: 'qr-code-outline' },
];

export default function AddPaymentMethodScreen() {
  const { t } = useTranslation();

  const handleSelect = (option: AddOption) => {
    // Honest mock — there's no real payment gateway behind this app, so we say
    // so plainly instead of pretending a real account gets linked.
    Alert.alert(t('comingSoon'), `${option.label} — account linking isn't available in this prototype yet.`, [
      { text: 'OK' },
    ]);
  };

  return (
    <AppScreen title="Add Payment Method">
      <Card variant="outlined" padding="none">
        {ADD_OPTIONS.map((option, index) => (
          <MenuRow
            key={option.id}
            icon={option.icon}
            label={option.label}
            showDivider={index < ADD_OPTIONS.length - 1}
            onPress={() => handleSelect(option)}
          />
        ))}
      </Card>
    </AppScreen>
  );
}
