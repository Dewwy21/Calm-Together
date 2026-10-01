import AsyncStorage from '@react-native-async-storage/async-storage';
import { LessonQuizAttempt } from './quizTypes';

// Scoped per child, append-only — same pattern as every other historical
// record in the app (Daily Log, assessments, Simulator sessions). Every
// attempt is kept, including retakes, so this can feed course progress
// now and longitudinal analysis later.
const STORAGE_KEY = 'otter-companion/lesson-quiz-attempts';

export async function loadLessonQuizAttempts(childId: string): Promise<LessonQuizAttempt[]> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEY}/${childId}`);
    if (!raw) return [];
    return JSON.parse(raw) as LessonQuizAttempt[];
  } catch {
    return [];
  }
}

export async function persistLessonQuizAttempts(childId: string, attempts: LessonQuizAttempt[]): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, JSON.stringify(attempts));
  } catch {
    // best-effort local persistence only
  }
}
