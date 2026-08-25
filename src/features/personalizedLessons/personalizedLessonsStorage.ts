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

export async function loadPersonalizedLessonsData(): Promise<PersonalizedLessonsData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) } as PersonalizedLessonsData;
  } catch {
    return EMPTY;
  }
}

export async function persistPersonalizedLessonsData(data: PersonalizedLessonsData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, lessons: data.lessons.slice(-MAX_STORED_LESSONS) }));
  } catch {
    // best-effort local persistence only
  }
}
