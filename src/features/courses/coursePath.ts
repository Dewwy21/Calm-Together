import { COURSES, getLessonsForCourse } from './courseData';
import { Lesson } from './types';

// A fixed reading order for the 28-day program's daily suggestion — the 4
// real courses (skipping 'personalized', which has no static lessons) in
// their existing display order, each course's lessons in their existing
// order. Not a lock: every lesson stays freely browsable in Courses exactly
// as it does today, this is only which one gets suggested on a given day.
function flattenedLessonPath(): Lesson[] {
  return COURSES.filter((c) => c.id !== 'personalized').flatMap((c) => getLessonsForCourse(c.id));
}

// Day N's suggestion is the Nth lesson in that fixed order (1-indexed,
// clamped to however many lessons actually exist) — day 1 → index 0, etc.
// There are more real lessons (37) than program days (28), so every day
// through day 28 maps to a distinct lesson with no wraparound needed.
export function getSuggestedLessonForDay(dayNumber: number): Lesson | null {
  const path = flattenedLessonPath();
  if (path.length === 0) return null;
  const index = Math.min(Math.max(dayNumber, 1), path.length) - 1;
  return path[index];
}
