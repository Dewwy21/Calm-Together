import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'otter-companion/parent-learning-completed';

export async function loadCompletedLessonIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function markLessonCompleted(lessonId: string): Promise<void> {
  try {
    const existing = await loadCompletedLessonIds();
    if (existing.includes(lessonId)) return;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...existing, lessonId]));
  } catch {
    // best-effort local persistence only
  }
}
