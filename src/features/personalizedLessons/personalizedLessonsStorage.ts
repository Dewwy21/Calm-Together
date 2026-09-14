import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredPersonalizedLesson } from './types';

export interface PersonalizedLessonsData {
  lessons: StoredPersonalizedLesson[];
  /** Suggested-lesson topics (from detected patterns) the caregiver has dismissed, so they stop resurfacing. */
  dismissedSuggestionTopics: string[];
}

const STORAGE_KEY = 'otter-companion/personalized-lessons';
const MAX_STORED_LESSONS = 50;
const EMPTY: PersonalizedLessonsData = { lessons: [], dismissedSuggestionTopics: [] };

// Was a single global key (no childId) — migrates any data found there onto
// the requesting child's own key, once, the first time it's asked for. See
// courseProgressStorage.ts's loadCourseProgress for the same pattern.
export async function loadPersonalizedLessonsData(childId: string): Promise<PersonalizedLessonsData> {
  try {
    const scopedKey = `${STORAGE_KEY}/${childId}`;
    const raw = await AsyncStorage.getItem(scopedKey);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) } as PersonalizedLessonsData;

    const legacy = await AsyncStorage.getItem(STORAGE_KEY);
    if (legacy) {
      await AsyncStorage.setItem(scopedKey, legacy);
      await AsyncStorage.removeItem(STORAGE_KEY);
      return { ...EMPTY, ...JSON.parse(legacy) } as PersonalizedLessonsData;
    }

    return EMPTY;
  } catch {
    return EMPTY;
  }
}

export async function persistPersonalizedLessonsData(childId: string, data: PersonalizedLessonsData): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, JSON.stringify({ ...data, lessons: data.lessons.slice(-MAX_STORED_LESSONS) }));
  } catch {
    // best-effort local persistence only
  }
}
