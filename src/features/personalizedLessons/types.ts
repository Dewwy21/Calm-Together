import { Lesson, LessonCard } from '../courses/types';

export type LessonSourceType = 'dailyLog' | 'helpBot' | 'pattern' | 'manual';

export interface LessonSource {
  type: LessonSourceType;
  /** Human-readable description of exactly what this lesson was built from, shown on the lesson card. */
  label: string;
}

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

/** LessonCard without the `icon` field — React components aren't JSON-serializable, so stored personalized lessons never carry them. Icons are re-attached by kind at load time (see hydrate.ts). */
export type StorableLessonCard = DistributiveOmit<LessonCard, 'icon'>;

export interface StoredPersonalizedLesson {
  id: string;
  courseId: 'personalized';
  title: string;
  summary: string;
  estimatedMinutes: number;
  cards: StorableLessonCard[];
  source: LessonSource;
  createdAtISO: string;
}

export interface PersonalizedLesson extends Lesson {
  courseId: 'personalized';
  source: LessonSource;
  createdAtISO: string;
}
