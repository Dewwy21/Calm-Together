import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecentUse {
  exerciseId: string;
  lastUsedISO: string;
}

export interface CalmCornerData {
  favoriteIds: string[];
  recentlyUsed: RecentUse[];
  /**
   * Every completed exercise, unlike `recentlyUsed` (capped at 5, for the
   * "recently used" shelf UI). Kept so the Pattern Detector can look for
   * real correlations like "intensity is lower on days you used Calm
   * Corner" — that needs actual history, not just the last few uses.
   */
  usageLog: RecentUse[];
}

const STORAGE_KEY = 'otter-companion/calm-corner';
const EMPTY: CalmCornerData = { favoriteIds: [], recentlyUsed: [], usageLog: [] };

// Was a single global key (no childId) — meaning usageLog mixed every
// child's Calm Corner history together, undermining the per-child pattern
// correlation it exists for. Migrates any data found under the old key
// onto the requesting child's own key, once, the first time it's asked
// for. See courseProgressStorage.ts's loadCourseProgress for the same
// pattern.
export async function loadCalmCornerData(childId: string): Promise<CalmCornerData> {
  try {
    const scopedKey = `${STORAGE_KEY}/${childId}`;
    const raw = await AsyncStorage.getItem(scopedKey);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) } as CalmCornerData;

    const legacy = await AsyncStorage.getItem(STORAGE_KEY);
    if (legacy) {
      await AsyncStorage.setItem(scopedKey, legacy);
      await AsyncStorage.removeItem(STORAGE_KEY);
      return { ...EMPTY, ...JSON.parse(legacy) } as CalmCornerData;
    }

    return EMPTY;
  } catch {
    return EMPTY;
  }
}

export async function persistCalmCornerData(childId: string, data: CalmCornerData): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, JSON.stringify(data));
  } catch {
    // best-effort local persistence only
  }
}
