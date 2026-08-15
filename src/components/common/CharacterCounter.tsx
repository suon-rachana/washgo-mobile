import { StyleProp, Text, TextStyle } from 'react-native';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';

export interface CharacterCounterProps {
  current: number;
  max: number;
  style?: StyleProp<TextStyle>;
}

export function CharacterCounter({ current, max, style }: CharacterCounterProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const isNearLimit = current >= max * 0.9;

  return (
    <Text
      style={[
        {
          fontSize: typography.caption.fontSize,
          fontFamily: typography.caption.fontFamily,
          color: isNearLimit ? colors.warning : colors.textMuted,
        },
        style,
      ]}
    >
      {current} / {max}
    </Text>
  );
}
