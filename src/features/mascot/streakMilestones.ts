import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useProfilesContext } from '../profiles/ProfilesProvider';

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

const STORAGE_KEY = 'otter-companion/last-celebrated-streak';

// Was a single global key (no childId) — a multi-child household's streak
// celebration for one child would silently suppress the other's. Migrates
// any value found under the old key onto the requesting child's own key,
// once. See courseProgressStorage.ts's loadCourseProgress for the same
// pattern.
async function loadLastCelebrated(childId: string): Promise<number> {
  try {
    const scopedKey = `${STORAGE_KEY}/${childId}`;
    const raw = await AsyncStorage.getItem(scopedKey);
    if (raw) return Number(raw) || 0;

    const legacy = await AsyncStorage.getItem(STORAGE_KEY);
    if (legacy) {
      await AsyncStorage.setItem(scopedKey, legacy);
      await AsyncStorage.removeItem(STORAGE_KEY);
      return Number(legacy) || 0;
    }

    return 0;
  } catch {
    return 0;
  }
}

async function persistLastCelebrated(childId: string, value: number): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, String(value));
  } catch {
    // best-effort local persistence only
  }
}

// Fires exactly once per milestone crossed (e.g. a 3-day streak celebrates
// once, not on every render while streak stays at 3, and not again until
// the next milestone). `dismiss` persists so it never re-fires for the same
// milestone, even across app restarts.
export function useStreakCelebration(streak: number) {
  const { currentChildId } = useProfilesContext();
  const [lastCelebrated, setLastCelebrated] = useState<number | null>(null);

  useEffect(() => {
    if (!currentChildId) return;
    setLastCelebrated(null);
    loadLastCelebrated(currentChildId).then(setLastCelebrated);
  }, [currentChildId]);

  const milestone = STREAK_MILESTONES.filter((m) => m <= streak).pop();
  const shouldCelebrate = lastCelebrated !== null && !!milestone && milestone > lastCelebrated;

  function dismiss() {
    if (!milestone || !currentChildId) return;
    setLastCelebrated(milestone);
    persistLastCelebrated(currentChildId, milestone);
  }

  return { shouldCelebrate, milestone, dismiss };
}
