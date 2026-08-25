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
const MAX_USAGE_LOG = 365;
const EMPTY: CalmCornerData = { favoriteIds: [], recentlyUsed: [], usageLog: [] };

export async function loadCalmCornerData(): Promise<CalmCornerData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) } as CalmCornerData;
  } catch {
    return EMPTY;
  }
}

export async function persistCalmCornerData(data: CalmCornerData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // best-effort local persistence only
  }
}
