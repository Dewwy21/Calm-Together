// Primitive color values. Never import these directly into screens/components —
// consume semantic roles from `theme.ts` instead, so a future palette swap
// (dark mode, rebrand) only touches this file.
export const palette = {
  terracotta700: '#A8563A',
  terracotta500: '#C96F4A',
  terracotta200: '#EBB79B',

  sand100: '#F3E4D0',
  cream50: '#FDF4E7',
  creamWhite: '#FFFDF9',

  mossGreen700: '#5F7458',
  mossGreen500: '#7C9473',
  mossGreen200: '#CBD9C4',

  berry500: '#B06678',
  berry200: '#E7C3CB',

  coral500: '#E2836B',

  inkBrown900: '#3B2E26',
  brownGray500: '#8A7768',
  sandBorder: '#E8D5BE',

  white: '#FFFFFF',
} as const;

export type PaletteKey = keyof typeof palette;
