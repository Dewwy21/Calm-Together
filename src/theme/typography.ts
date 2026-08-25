import { TextStyle } from 'react-native';

// Three real installed families a caregiver can pick between (see
// buildFontFamily). Both Quicksand and Lora top out at weight 700, so their
// "extraBold" slot reuses their own boldest weight rather than a
// nonexistent 800. Loaded via expo-font in app/_layout.tsx.
export type FontChoice = 'plusJakarta' | 'quicksand' | 'lora';

interface FontFamilySet {
  extraBold: string;
  bold: string;
  semiBold: string;
  medium: string;
  regular: string;
}

const FONT_FAMILY_SETS: Record<FontChoice, FontFamilySet> = {
  plusJakarta: {
    extraBold: 'PlusJakartaSans_800ExtraBold',
    bold: 'PlusJakartaSans_700Bold',
    semiBold: 'PlusJakartaSans_600SemiBold',
    medium: 'PlusJakartaSans_500Medium',
    regular: 'PlusJakartaSans_400Regular',
  },
  quicksand: {
    extraBold: 'Quicksand_700Bold',
    bold: 'Quicksand_700Bold',
    semiBold: 'Quicksand_600SemiBold',
    medium: 'Quicksand_500Medium',
    regular: 'Quicksand_400Regular',
  },
  lora: {
    extraBold: 'Lora_700Bold',
    bold: 'Lora_700Bold',
    semiBold: 'Lora_600SemiBold',
    medium: 'Lora_500Medium',
    regular: 'Lora_400Regular',
  },
};

export function buildFontFamily(choice: FontChoice = 'plusJakarta'): FontFamilySet {
  return FONT_FAMILY_SETS[choice];
}

type TypeStyle = Pick<TextStyle, 'fontFamily' | 'fontSize' | 'lineHeight' | 'letterSpacing'>;

export type TypographyKey = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyEmphasis' | 'bodySmall' | 'label' | 'caption';

export function buildTypography(fontFamily: FontFamilySet): Record<TypographyKey, TypeStyle> {
  return {
    display: { fontFamily: fontFamily.extraBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.6 },
    h1: { fontFamily: fontFamily.bold, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
    h2: { fontFamily: fontFamily.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2 },
    h3: { fontFamily: fontFamily.semiBold, fontSize: 17, lineHeight: 22, letterSpacing: -0.1 },
    body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 24 },
    bodyEmphasis: { fontFamily: fontFamily.semiBold, fontSize: 16, lineHeight: 24 },
    bodySmall: { fontFamily: fontFamily.regular, fontSize: 14, lineHeight: 20 },
    label: { fontFamily: fontFamily.semiBold, fontSize: 15, lineHeight: 20 },
    caption: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16 },
  };
}

// Defaults (Plus Jakarta Sans), kept as plain exports for anything that
// still wants a static reference outside the theme-building pipeline.
export const fontFamily = buildFontFamily('plusJakarta');
export const typography = buildTypography(fontFamily);
