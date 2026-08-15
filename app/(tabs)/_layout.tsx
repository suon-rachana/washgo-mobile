import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { Spacing } from '@/src/theme';

export default function TabLayout() {
  const colors = useThemeColors();
  const typography = useTypography();
  const { t, language } = useTranslation();
  const isKhmer = language === 'km';

  return (
    <Tabs
      screenOptions={{
        // Off by default — Home keeps its own custom in-page header.
        // Orders/Laundries/Profile below turn this on for a compact native
        // header matching the rest of the app; these style options apply
        // whenever a screen does.
        headerShown: false,
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        headerTintColor: colors.text,
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: {
          // See app/_layout.tsx for why Khmer gets a couple points knocked
          // off the header title size.
          fontSize: isKhmer ? typography.subtitle.fontSize - 2 : typography.subtitle.fontSize,
          fontWeight: typography.subtitle.fontWeight,
          fontFamily: typography.subtitle.fontFamily,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarItemStyle: {
          // Khmer labels sit taller (see typography.ts's khmerLineHeightScale)
          // and were reading as crowded against the icon above them — a touch
          // more top padding is enough headroom; English is untouched.
          paddingTop: isKhmer ? Spacing.xs : Spacing.xxs,
        },
        tabBarLabelStyle: {
          fontSize: typography.label.fontSize,
          // Only set an explicit lineHeight for Khmer (its taller
          // khmerLineHeightScale value) — leaving it unset for English
          // preserves the exact native default line metrics it had before.
          ...(isKhmer ? { lineHeight: typography.label.lineHeight } : null),
          fontWeight: typography.label.fontWeight,
          fontFamily: typography.label.fontFamily,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarAccessibilityLabel: t('home'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('orders'),
          headerShown: true,
          tabBarAccessibilityLabel: t('orders'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="laundries"
        options={{
          // Tab bar keeps the short "Laundries" label; the native header
          // shows the longer, existing "Choose a Laundry" title.
          title: t('laundries'),
          headerShown: true,
          headerTitle: t('chooseALaundry'),
          tabBarAccessibilityLabel: t('laundries'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'shirt' : 'shirt-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          headerShown: true,
          tabBarAccessibilityLabel: t('profile'),
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
