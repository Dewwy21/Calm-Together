import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

const STORAGE_KEY = 'otter-companion/last-celebrated-streak';

async function loadLastCelebrated(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
}

async function persistLastCelebrated(value: number): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // best-effort local persistence only
  }
}

// Fires exactly once per milestone crossed (e.g. a 3-day streak celebrates
// once, not on every render while streak stays at 3, and not again until
// the next milestone). `dismiss` persists so it never re-fires for the same
// milestone, even across app restarts.
export function useStreakCelebration(streak: number) {
  const [lastCelebrated, setLastCelebrated] = useState<number | null>(null);

  useEffect(() => {
    loadLastCelebrated().then(setLastCelebrated);
  }, []);

  const milestone = STREAK_MILESTONES.filter((m) => m <= streak).pop();
  const shouldCelebrate = lastCelebrated !== null && !!milestone && milestone > lastCelebrated;

  function dismiss() {
    if (!milestone) return;
    setLastCelebrated(milestone);
    persistLastCelebrated(milestone);
  }

  return { shouldCelebrate, milestone, dismiss };
}
