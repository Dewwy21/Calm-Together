import type { ComponentType } from 'react';
import { IconProps, EyeIcon, ShellIcon, HandsIcon, ThoughtIcon, HeartIcon, ArrowRightIcon, SwirlIcon } from '../../../components/icons';
import { buildLesson } from '../lessonHelpers';
import { CourseId, Lesson } from '../types';
import { ACCEPTANCE_LESSON_1 } from './acceptanceLesson1';

// Real, authored lessons that replace a specific week's placeholder —
// keyed by the lesson id it slots into (`${processId}-week${n}`). Add a
// new real lesson (its own file, same pattern as acceptanceLesson1.ts)
// and list it here; nothing else about the 28-day schedule changes.
const REAL_LESSONS: Partial<Record<string, Lesson>> = {
  [ACCEPTANCE_LESSON_1.id]: ACCEPTANCE_LESSON_1,
};

// The 28-day program's content shell — 6 ACT processes + Choice Point,
// 4 lessons each (one per week), 28 total. Every lesson here is a
// deliberate placeholder: a real content author fills in the actual
// text/media/activities per week later (see LessonCard in ../types.ts for
// every card kind already supported — quiz, media, scenario, reflection,
// etc. — and courseData.ts's header comment for how to add a 'media' card).
// Nothing here should be mistaken for authored clinical material.
interface ActProcessDef {
  id: Exclude<CourseId, 'personalized'>;
  name: string;
  icon: ComponentType<IconProps>;
}

// Order matters: this is Week 1's sequence from the program spec, and
// coursePath.ts repeats this same order for weeks 2-4 to build the full
// Day 1-28 schedule.
export const ACT_PROCESSES: ActProcessDef[] = [
  { id: 'presentMomentAwareness', name: 'Present-Moment Awareness', icon: EyeIcon },
  { id: 'selfAsContext', name: 'Self-as-Context', icon: ShellIcon },
  { id: 'acceptance', name: 'Acceptance', icon: HandsIcon },
  { id: 'cognitiveDefusion', name: 'Cognitive Defusion', icon: ThoughtIcon },
  { id: 'values', name: 'Values', icon: HeartIcon },
  { id: 'committedAction', name: 'Committed Action', icon: ArrowRightIcon },
  { id: 'choicePoint', name: 'Choice Point', icon: SwirlIcon },
];

const WEEKS = [1, 2, 3, 4] as const;

function buildPlaceholderWeeks(def: ActProcessDef): Lesson[] {
  return WEEKS.map((week) => {
    const id = `${def.id}-week${week}`;
    const real = REAL_LESSONS[id];
    if (real) return real;

    return buildLesson({
      id,
      courseId: def.id,
      title: `${def.name} — Week ${week}`,
      summary: 'Content for this week is on its way.',
      estimatedMinutes: 5,
      icon: def.icon,
      cards: [
        {
          kind: 'intro',
          title: def.name,
          hook: `This is the Week ${week} ${def.name} lesson — its own new scenario and skill, different from the other three weeks. The real content hasn't been written yet; this placeholder just holds its place in the 28-day program.`,
          icon: def.icon,
        },
      ],
    });
  });
}

export const ACT_PROCESS_LESSONS: Record<Exclude<CourseId, 'personalized'>, Lesson[]> = Object.fromEntries(
  ACT_PROCESSES.map((def) => [def.id, buildPlaceholderWeeks(def)])
) as Record<Exclude<CourseId, 'personalized'>, Lesson[]>;
