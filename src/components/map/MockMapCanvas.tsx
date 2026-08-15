import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Radius, Shadows, Spacing } from '@/src/theme';

const GRID_ROWS = 6;
const GRID_COLUMNS = 4;

interface MockMapCanvasProps {
  onCurrentLocationPress: () => void;
  isLocating: boolean;
}

/**
 * Non-interactive fallback used only when the real MapView can't load
 * (unsupported platform, e.g. web, or a native rendering failure) — a subtle
 * street/grid pattern built from plain Views, no external map image or SDK.
 * The current-location button still works; the canvas itself never moves.
 */
export function MockMapCanvas({ onCurrentLocationPress, isLocating }: MockMapCanvasProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = createStyles(colors, typography);

  return (
    <View style={styles.wrapper}>
      <View style={styles.notice}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
        <View style={styles.noticeTextWrap}>
          <Text style={styles.noticeTitle}>{t('mapUnavailable')}</Text>
          <Text style={styles.noticeMessage}>{t('mapFallbackMessage')}</Text>
        </View>
      </View>

      <View
        style={styles.mapCanvas}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={t('chooseLocation')}
        accessibilityHint={t('mapFallbackMessage')}
      >
        <View style={styles.gridRows} pointerEvents="none">
          {Array.from({ length: GRID_ROWS }).map((_, index) => (
            <View key={`row-${index}`} style={styles.gridRowLine} />
          ))}
        </View>
        <View style={styles.gridColumns} pointerEvents="none">
          {Array.from({ length: GRID_COLUMNS }).map((_, index) => (
            <View key={`col-${index}`} style={styles.gridColumnLine} />
          ))}
        </View>

        <View style={[styles.mapBlock, styles.mapBlockOne]} pointerEvents="none" />
        <View style={[styles.mapBlock, styles.mapBlockTwo]} pointerEvents="none" />
        <View style={[styles.mapBlock, styles.mapBlockThree]} pointerEvents="none" />

        <View style={styles.pinWrap} pointerEvents="none">
          <View style={styles.pinMarker}>
            <View style={styles.pinHalo} />
            <Ionicons name="location" size={40} color={colors.primary} />
          </View>
        </View>

        <Pressable
          onPress={onCurrentLocationPress}
          disabled={isLocating}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('currentLocation')}
          accessibilityHint={t('locatingYou')}
          accessibilityState={{ disabled: isLocating, busy: isLocating }}
          style={styles.currentLocationButton}
        >
          {isLocating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="locate" size={20} color={colors.primary} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const MAP_CANVAS_HEIGHT = 300;

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: Spacing.xl,
    },
    notice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.xs,
      backgroundColor: colors.elevatedSurface,
      borderRadius: Radius.md,
      padding: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    noticeTextWrap: {
      flex: 1,
    },
    noticeTitle: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
      marginBottom: Spacing.xxs,
    },
    noticeMessage: {
      fontSize: typography.caption.fontSize,
      lineHeight: typography.caption.lineHeight,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
    },
    mapCanvas: {
      height: MAP_CANVAS_HEIGHT,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      overflow: 'hidden',
    },
    gridRows: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'space-evenly',
    },
    gridRowLine: {
      height: 1,
      backgroundColor: colors.border,
    },
    gridColumns: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
    },
    gridColumnLine: {
      width: 1,
      backgroundColor: colors.border,
    },
    mapBlock: {
      position: 'absolute',
      backgroundColor: colors.elevatedSurface,
      borderRadius: Radius.sm,
    },
    mapBlockOne: {
      top: '12%',
      left: '10%',
      width: '28%',
      height: '22%',
    },
    mapBlockTwo: {
      top: '58%',
      left: '62%',
      width: '26%',
      height: '18%',
    },
    mapBlockThree: {
      top: '68%',
      left: '14%',
      width: '20%',
      height: '16%',
    },
    pinWrap: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pinMarker: {
      width: 64,
      height: 64,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pinHalo: {
      position: 'absolute',
      width: 64,
      height: 64,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
    },
    currentLocationButton: {
      position: 'absolute',
      bottom: Spacing.md,
      right: Spacing.md,
      width: 40,
      height: 40,
      borderRadius: Radius.circle,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.sm,
    },
  });
