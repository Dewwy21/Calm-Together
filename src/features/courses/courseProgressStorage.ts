import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LessonProgress {
  lessonId: string;
  /** Last card index the caregiver was viewing, so a lesson can resume where it left off. */
  cardIndex: number;
  completed: boolean;
  completedAtISO?: string;
  /** Saved answer text for the lesson's reflection card, if any. */
  reflectionAnswer?: string;
}

export interface CourseProgressData {
  lessons: Record<string, LessonProgress>;
}

const STORAGE_KEY = 'otter-companion/course-progress';
const EMPTY: CourseProgressData = { lessons: {} };

export async function loadCourseProgress(): Promise<CourseProgressData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) } as CourseProgressData;
  } catch {
    return EMPTY;
  }
}

export async function persistCourseProgress(data: CourseProgressData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // best-effort local persistence only
  }
}
