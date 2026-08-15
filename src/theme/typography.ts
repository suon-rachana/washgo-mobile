import type { TextStyle } from 'react-native';

import type { Language } from '@/src/store/settingsStore';
import { getFontFamily, type FontWeightKey } from './fonts';

export { LatinFontFamily, LatinFontFamily as FontFamily, KhmerFontFamily, getFontFamily } from './fonts';

/**
 * WashGo typography tokens.
 *
 * `Typography` is the original English/system-font token set — screens that
 * import it directly keep the exact same numbers as before Khmer support was
 * added. `getTypography(language)` / `useTypography()` (src/hooks/useTypography.ts)
 * return the same shape but with Battambang families and taller
 * Khmer-only line heights swapped in for `language === 'km'`. Khmer's
 * dependent vowels and stacked consonants need more vertical room than Latin
 * at the same point size, so only `lineHeight` grows for Khmer — `fontSize`
 * never changes, keeping the two languages visually comparable in size.
 */

export const FontWeight: Record<FontWeightKey, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

export interface TypographyVariant {
  fontSize: number;
  lineHeight: number;
  fontWeight: TextStyle['fontWeight'];
  letterSpacing: number;
  fontFamily?: string;
}

export type TypographyVariantKey =
  | 'display'
  | 'headline'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodyMedium'
  | 'caption'
  | 'button'
  | 'label';

interface TypographySpec {
  fontSize: number;
  lineHeight: number;
  weight: FontWeightKey;
  letterSpacing: number;
  // Multiplier applied to lineHeight only when Khmer is active — tighter
  // variants (button/label/caption) get closer to +30-35%, already-roomy
  // ones (body) get closer to +15%, all within the range Khmer needs to
  // clear stacked diacritics without the line box feeling oversized.
  khmerLineHeightScale: number;
}

const TYPOGRAPHY_SPEC: Record<TypographyVariantKey, TypographySpec> = {
  display: { fontSize: 34, lineHeight: 42, weight: 'bold', letterSpacing: 0.25, khmerLineHeightScale: 1.25 },
  headline: { fontSize: 28, lineHeight: 36, weight: 'bold', letterSpacing: 0, khmerLineHeightScale: 1.25 },
  title: { fontSize: 22, lineHeight: 30, weight: 'semibold', letterSpacing: 0, khmerLineHeightScale: 1.2 },
  subtitle: { fontSize: 18, lineHeight: 26, weight: 'semibold', letterSpacing: 0, khmerLineHeightScale: 1.2 },
  body: { fontSize: 16, lineHeight: 24, weight: 'regular', letterSpacing: 0, khmerLineHeightScale: 1.15 },
  bodyMedium: { fontSize: 16, lineHeight: 24, weight: 'medium', letterSpacing: 0, khmerLineHeightScale: 1.15 },
  caption: { fontSize: 13, lineHeight: 18, weight: 'regular', letterSpacing: 0.1, khmerLineHeightScale: 1.3 },
  button: { fontSize: 16, lineHeight: 20, weight: 'semibold', letterSpacing: 0.2, khmerLineHeightScale: 1.3 },
  label: { fontSize: 12, lineHeight: 16, weight: 'medium', letterSpacing: 0.4, khmerLineHeightScale: 1.35 },
};

function buildTypography(language: Language): Record<TypographyVariantKey, TypographyVariant> {
  const keys = Object.keys(TYPOGRAPHY_SPEC) as TypographyVariantKey[];
  const entries = keys.map((key) => {
    const spec = TYPOGRAPHY_SPEC[key];
    const isKhmer = language === 'km';
    const variant: TypographyVariant = {
      fontSize: spec.fontSize,
      lineHeight: isKhmer ? Math.round(spec.lineHeight * spec.khmerLineHeightScale) : spec.lineHeight,
      fontWeight: FontWeight[spec.weight],
      letterSpacing: spec.letterSpacing,
      fontFamily: getFontFamily(language, spec.weight),
    };
    return [key, variant] as const;
  });
  return Object.fromEntries(entries) as Record<TypographyVariantKey, TypographyVariant>;
}

// English/default token set — numerically identical to the pre-Khmer values.
export const Typography: Record<TypographyVariantKey, TypographyVariant> = buildTypography('en');

// Locale-aware token set. Prefer the useTypography() hook from components —
// this plain function exists so non-hook callers (and the hook itself) can
// reach the same logic.
export function getTypography(language: Language): Record<TypographyVariantKey, TypographyVariant> {
  return buildTypography(language);
}
