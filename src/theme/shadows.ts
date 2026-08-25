import { Platform } from 'react-native';
import { palette } from './palette';

// Warm-tinted elevation (shadow color pulled from the terracotta palette)
// instead of neutral gray, so elevated surfaces still read as part of the
// warm system rather than generic Material shadows.
const card = Platform.select({
  ios: {
    shadowColor: palette.terracotta700,
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  android: {
    elevation: 4,
  },
  default: {},
});

const raised = Platform.select({
  ios: {
    shadowColor: palette.terracotta700,
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  android: {
    elevation: 8,
  },
  default: {},
});

export const shadows = { card, raised } as const;
