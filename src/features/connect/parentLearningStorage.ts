import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'otter-companion/parent-learning-completed';

// Was a single global key (no childId) — migrates any data found there onto
// the requesting child's own key, once, the first time it's asked for. See
// courseProgressStorage.ts's loadCourseProgress for the same pattern.
export async function loadCompletedLessonIds(childId: string): Promise<string[]> {
  try {
    const scopedKey = `${STORAGE_KEY}/${childId}`;
    const raw = await AsyncStorage.getItem(scopedKey);
    if (raw) return JSON.parse(raw) as string[];

    const legacy = await AsyncStorage.getItem(STORAGE_KEY);
    if (legacy) {
      await AsyncStorage.setItem(scopedKey, legacy);
      await AsyncStorage.removeItem(STORAGE_KEY);
      return JSON.parse(legacy) as string[];
    }

    return [];
  } catch {
    return [];
  }
}

export async function markLessonCompleted(childId: string, lessonId: string): Promise<void> {
  try {
    const existing = await loadCompletedLessonIds(childId);
    if (existing.includes(lessonId)) return;
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, JSON.stringify([...existing, lessonId]));
  } catch {
    // best-effort local persistence only
  }
}
