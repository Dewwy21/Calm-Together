import { palette } from './palette';
import { spacing as baseSpacing, SpacingKey } from './spacing';
import { radii as baseRadii, organicRadii, RadiusKey } from './radii';
import { buildFontFamily, buildTypography, FontChoice, TypographyKey } from './typography';
import { shadows } from './shadows';

export type ThemeMode = 'light' | 'dark';
export type TextScale = 'default' | 'large';
export type PaletteChoice = 'sunset' | 'ocean' | 'forest';
export type RadiusStyle = 'soft' | 'rounded' | 'playful';
export type Density = 'compact' | 'cozy' | 'spacious';

export interface ThemeSettings {
  mode: ThemeMode;
  textScale: TextScale;
  paletteChoice: PaletteChoice;
  fontChoice: FontChoice;
  radiusStyle: RadiusStyle;
  density: Density;
}

interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  primaryPressed: string;
  primaryTint: string;
  secondary: string;
  secondaryPressed: string;
  secondaryTint: string;
  accent: string;
  accentTint: string;
  warning: string;
  success: string;
  textPrimary: string;
  textSecondary: string;
  textOnPrimary: string;
  border: string;
  white: string;
}

// "Sunset" — the app's original palette (terracotta/sand/moss/berry).
const sunsetLight: ThemeColors = {
  background: palette.cream50,
  surface: palette.creamWhite,
  surfaceAlt: palette.sand100,
  primary: palette.terracotta500,
  primaryPressed: palette.terracotta700,
  primaryTint: palette.terracotta200,
  secondary: palette.mossGreen500,
  secondaryPressed: palette.mossGreen700,
  secondaryTint: palette.mossGreen200,
  accent: palette.berry500,
  accentTint: palette.berry200,
  warning: palette.coral500,
  success: palette.mossGreen500,
  textPrimary: palette.inkBrown900,
  textSecondary: palette.brownGray500,
  textOnPrimary: palette.creamWhite,
  border: palette.sandBorder,
  white: palette.white,
};

// Hand-tuned rather than a mechanical remap — light mode's `surface` and
// `textOnPrimary` coincidentally share one near-white value, but on dark
// those two roles diverge completely, so dark gets its own pass. Same
// warm-near-black convention as sunsetLight, never pure black.
const sunsetDark: ThemeColors = {
  background: '#1E1712',
  surface: '#251D17',
  surfaceAlt: '#33281F',
  primary: '#D98860',
  primaryPressed: '#B96E49',
  primaryTint: 'rgba(217,136,96,0.22)',
  secondary: '#9DBE92',
  secondaryPressed: '#7FA173',
  secondaryTint: 'rgba(157,190,146,0.2)',
  accent: '#CE94A2',
  accentTint: 'rgba(206,148,162,0.2)',
  warning: palette.coral500,
  success: '#9DBE92',
  textPrimary: '#F5ECE2',
  textSecondary: '#B8A996',
  textOnPrimary: '#FFFFFF',
  border: '#40332692',
  white: palette.white,
};

// "Ocean" — cool teal/blue, calm rather than warm.
const oceanLight: ThemeColors = {
  background: '#EFF6F6',
  surface: '#FFFFFF',
  surfaceAlt: '#DCEEF0',
  primary: '#2F8F9D',
  primaryPressed: '#256E79',
  primaryTint: '#BFE3E7',
  secondary: '#5B8FB0',
  secondaryPressed: '#4A7593',
  secondaryTint: '#CBDCEA',
  accent: '#7A6FB0',
  accentTint: '#DCD7EF',
  warning: palette.coral500,
  success: '#3F9E7B',
  textPrimary: '#1E2C31',
  textSecondary: '#5C7278',
  textOnPrimary: '#FFFFFF',
  border: '#CFE3E6',
  white: palette.white,
};

const oceanDark: ThemeColors = {
  background: '#0F1B1E',
  surface: '#16262A',
  surfaceAlt: '#1E3438',
  primary: '#4FB3C2',
  primaryPressed: '#3C8F9C',
  primaryTint: 'rgba(79,179,194,0.22)',
  secondary: '#83B0CE',
  secondaryPressed: '#6996B4',
  secondaryTint: 'rgba(131,176,206,0.2)',
  accent: '#A79BDA',
  accentTint: 'rgba(167,155,218,0.2)',
  warning: palette.coral500,
  success: '#5FBE9A',
  textPrimary: '#EAF3F4',
  textSecondary: '#A9C0C4',
  textOnPrimary: '#FFFFFF',
  border: '#2A4448',
  white: palette.white,
};

// "Forest" — green/earth, grounded.
const forestLight: ThemeColors = {
  background: '#F3F5EC',
  surface: '#FFFFFF',
  surfaceAlt: '#E4EAD6',
  primary: '#5B8C5A',
  primaryPressed: '#466D46',
  primaryTint: '#CFE0CC',
  secondary: '#8A9A5B',
  secondaryPressed: '#707E48',
  secondaryTint: '#E1E7CC',
  accent: '#B0703F',
  accentTint: '#EBD3BE',
  warning: palette.coral500,
  success: '#5B8C5A',
  textPrimary: '#2A2E22',
  textSecondary: '#6B7360',
  textOnPrimary: '#FFFFFF',
  border: '#D8DFC7',
  white: palette.white,
};

const forestDark: ThemeColors = {
  background: '#161A12',
  surface: '#1E2418',
  surfaceAlt: '#2A331F',
  primary: '#7FB37D',
  primaryPressed: '#649264',
  primaryTint: 'rgba(127,179,125,0.22)',
  secondary: '#AAB87E',
  secondaryPressed: '#8B9863',
  secondaryTint: 'rgba(170,184,126,0.2)',
  accent: '#D19A6C',
  accentTint: 'rgba(209,154,108,0.2)',
  warning: palette.coral500,
  success: '#8FCB8D',
  textPrimary: '#F0F3E8',
  textSecondary: '#B7C2A9',
  textOnPrimary: '#FFFFFF',
  border: '#374331',
  white: palette.white,
};

const PALETTES: Record<PaletteChoice, { light: ThemeColors; dark: ThemeColors }> = {
  sunset: { light: sunsetLight, dark: sunsetDark },
  ocean: { light: oceanLight, dark: oceanDark },
  forest: { light: forestLight, dark: forestDark },
};

const RADIUS_STYLE_SCALE: Record<RadiusStyle, number> = {
  soft: 0.55,
  rounded: 1,
  playful: 1.5,
};

const DENSITY_SCALE: Record<Density, number> = {
  compact: 0.8,
  cozy: 1,
  spacious: 1.2,
};

function scaleTypography(scale: number, fontFamily: ReturnType<typeof buildFontFamily>) {
  const base = buildTypography(fontFamily);
  const scaled = {} as typeof base;
  (Object.keys(base) as TypographyKey[]).forEach((key) => {
    const style = base[key];
    scaled[key] = {
      ...style,
      fontSize: style.fontSize ? Math.round(style.fontSize * scale) : style.fontSize,
      lineHeight: style.lineHeight ? Math.round(style.lineHeight * scale) : style.lineHeight,
    };
  });
  return scaled;
}

function scaleSpacing(scale: number): Record<SpacingKey, number> {
  const entries = (Object.keys(baseSpacing) as SpacingKey[]).map((key) => [key, Math.round(baseSpacing[key] * scale)]);
  return Object.fromEntries(entries) as Record<SpacingKey, number>;
}

function scaleRadii(scale: number): Record<RadiusKey, number> {
  // "Fully round" stays fully round regardless of style — only the
  // graduated corners (sm/md/lg/xl) scale.
  const entries = (Object.keys(baseRadii) as RadiusKey[]).map((key) => [
    key,
    key === 'pill' ? baseRadii[key] : Math.round(baseRadii[key] * scale),
  ]);
  return Object.fromEntries(entries) as Record<RadiusKey, number>;
}

const DEFAULT_SETTINGS: ThemeSettings = {
  mode: 'light',
  textScale: 'default',
  paletteChoice: 'sunset',
  fontChoice: 'plusJakarta',
  radiusStyle: 'rounded',
  density: 'cozy',
};

export function buildTheme(settings: Partial<ThemeSettings> = {}) {
  const resolved = { ...DEFAULT_SETTINGS, ...settings };
  const colors = PALETTES[resolved.paletteChoice][resolved.mode];
  const fontFamily = buildFontFamily(resolved.fontChoice);

  return {
    mode: resolved.mode,
    color: colors,
    spacing: scaleSpacing(DENSITY_SCALE[resolved.density]),
    radii: scaleRadii(RADIUS_STYLE_SCALE[resolved.radiusStyle]),
    organicRadii,
    typography: scaleTypography(resolved.textScale === 'large' ? 1.15 : 1, fontFamily),
    fontFamily,
    shadows,
  };
}

export const lightTheme = buildTheme();

export type Theme = ReturnType<typeof buildTheme>;
