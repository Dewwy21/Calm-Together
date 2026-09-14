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

// This was a single global key (no childId) before multi-child support
// existed here — a caregiver's course progress leaked across every child
// profile. Loading now migrates any data found under the old global key
// onto the requesting child's own key, once, the first time it's asked
// for — self-contained here rather than in profileStorage.ts's
// migrateLegacyChildData (that one only runs while bootstrapping the very
// first-ever profile; this key went global-to-per-child later, with
// existing profiles already in place, so it needs its own migration path).
export async function loadCourseProgress(childId: string): Promise<CourseProgressData> {
  try {
    const scopedKey = `${STORAGE_KEY}/${childId}`;
    const raw = await AsyncStorage.getItem(scopedKey);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) } as CourseProgressData;

    const legacy = await AsyncStorage.getItem(STORAGE_KEY);
    if (legacy) {
      await AsyncStorage.setItem(scopedKey, legacy);
      await AsyncStorage.removeItem(STORAGE_KEY);
      return { ...EMPTY, ...JSON.parse(legacy) } as CourseProgressData;
    }

    return EMPTY;
  } catch {
    return EMPTY;
  }
}

export async function persistCourseProgress(childId: string, data: CourseProgressData): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, JSON.stringify(data));
  } catch {
    // best-effort local persistence only
  }
}
