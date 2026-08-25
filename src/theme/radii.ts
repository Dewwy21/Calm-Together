export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 24,
  pill: 999,
} as const;

export type RadiusKey = keyof typeof radii;

// Reserved for chat-bubble-style shapes (one flattened corner suggesting a
// tail) — not used for general cards, which stay uniformly rounded to read
// as a clean, consistent product rather than a scrapbook of shapes.
export const organicRadii = {
  speechBubble: { borderTopLeftRadius: 18, borderTopRightRadius: 18, borderBottomLeftRadius: 4, borderBottomRightRadius: 18 },
} as const;
