import { ACT_PROCESSES, ACT_PROCESS_LESSONS } from './lessons/actProgramLessons';
import { Lesson } from './types';
import { getInterventionDayNumber } from '../baselineAssessment/checkpoints';

const WEEKS = [1, 2, 3, 4] as const;

// The canonical Day 1-28 order, straight from the program spec: Week 1
// walks all 7 processes in program order (Present-Moment Awareness → ... →
// Choice Point), then Week 2 repeats that same process order using each
// process's own Week-2 lesson, and so on through Week 4. This is the one
// place that order is defined — everything else (unlock day, the "which
// lesson is next" banner, week/day labels) derives from it.
function flattenedLessonPath(): Lesson[] {
  return WEEKS.flatMap((week) => ACT_PROCESSES.map((def) => ACT_PROCESS_LESSONS[def.id][week - 1]));
}

export function getSuggestedLessonForDay(dayNumber: number): Lesson | null {
  const path = flattenedLessonPath();
  if (path.length === 0) return null;
  const index = Math.min(Math.max(dayNumber, 1), path.length) - 1;
  return path[index];
}

// 1-based day this lesson unlocks on (1-28), or null for a lesson outside
// the 28-day schedule (e.g. a personalized lesson, always open).
export function getUnlockDayForLesson(lessonId: string): number | null {
  const index = flattenedLessonPath().findIndex((l) => l.id === lessonId);
  return index === -1 ? null : index + 1;
}

// The real hard lock: whether this lesson can be opened right now. Before
// the program has started (interventionStartDateISO unset), only Day 1's
// lesson is open — tapping it is what triggers the "start your program"
// heads-up in the lesson player and sets the start date. Once started,
// every lesson through the current elapsed day is open — unlocking is
// purely calendar-day-based ("automatically unlock one lesson per day"),
// never gated on whether earlier lessons were actually completed.
// `unlockAllOverride` is the app's own "unlock all lessons (testing)"
// preference (see AppPreferences) — a manual escape hatch so a caregiver
// testing the app isn't stuck waiting on the real calendar, without
// touching the day-lock logic itself.
export function isLessonUnlocked(
  lessonId: string,
  interventionStartDateISO: string | undefined,
  unlockAllOverride?: boolean
): boolean {
  if (unlockAllOverride) return true;
  const unlockDay = getUnlockDayForLesson(lessonId);
  if (unlockDay === null) return true;
  if (!interventionStartDateISO) return unlockDay === 1;
  return unlockDay <= getInterventionDayNumber(interventionStartDateISO);
}

export function getWeekForDay(dayNumber: number): number {
  return Math.min(Math.ceil(dayNumber / ACT_PROCESSES.length), WEEKS.length);
}
