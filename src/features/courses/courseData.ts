import { PersonIcon } from '../../components/icons';
import { Course, CourseId, Lesson } from './types';
import { ACT_PROCESSES, ACT_PROCESS_LESSONS } from './lessons/actProgramLessons';

// --- Adding a video or audio moment to a lesson ---------------------------
// Insert a 'media' card anywhere in a lesson's `cards` array (see
// lessons/actProgramLessons.ts for the buildLesson() call sites) — it's
// just another card kind, same as 'quiz' or 'concept':
//
//   { kind: 'media', mediaType: 'video', title: 'See it in action',
//     sourceUrl: null, caption: 'A 2-minute walkthrough' }
//
// `sourceUrl: null` renders a clean "coming soon" placeholder — swap in a
// real URL later with no other changes needed:
//   - Video: a full YouTube URL (youtube.com/watch?v=..., youtu.be/...),
//     or a bare 11-character YouTube video ID. Opens in YouTube/the
//     browser on tap — there's no embedded in-app player.
//   - Audio: any direct HTTPS file URL (e.g. a link from external file
//     storage once that's set up) — plays inline in the lesson.
// See mediaSources.ts for exactly how each sourceUrl is resolved.

// --- Filling in a real week's content --------------------------------------
// Every lesson below is a deliberate placeholder (see actProgramLessons.ts）
// — replace a `cards` array with real content (any mix of 'concept',
// 'example', 'quiz', 'media', 'scenario', 'reflection', etc. — see
// types.ts's LessonCard union for the full set) once it's written. The
// lesson's `id`, `courseId`, and position in the 28-day schedule
// (coursePath.ts) don't need to change — only its content does.

// The 6 ACT processes + Choice Point, one course per process — see
// types.ts's CourseId comment and coursePath.ts for how these 7 courses'
// lessons interleave into the single Day 1-28 program schedule.
const PROCESS_DESCRIPTIONS: Record<Exclude<CourseId, 'personalized'>, { subtitle: string; description: string }> = {
  presentMomentAwareness: {
    subtitle: 'Noticing what\'s happening, right now',
    description: 'Practicing attention to the present moment — what\'s actually happening, rather than replaying the past or bracing for what\'s next.',
  },
  selfAsContext: {
    subtitle: 'The steady you, underneath it all',
    description: 'Connecting with the stable sense of self that observes every thought and feeling, without being defined by any single one of them.',
  },
  acceptance: {
    subtitle: 'Making room for what\'s hard',
    description: 'Making room for difficult thoughts and feelings instead of fighting them, so energy goes toward what actually helps.',
  },
  cognitiveDefusion: {
    subtitle: 'Thoughts are thoughts, not orders',
    description: 'Learning to notice a thought as just a thought — not a fact that has to be obeyed or argued with.',
  },
  values: {
    subtitle: 'What actually matters to you',
    description: 'Getting clear on what kind of parent you want to be, as a compass for hard moments — not a standard to be judged against.',
  },
  committedAction: {
    subtitle: 'Real steps, even when it\'s hard',
    description: 'Taking concrete, values-aligned action, even when it\'s uncomfortable — small steps that build over the 4 weeks.',
  },
  choicePoint: {
    subtitle: 'Toward, or away — the moment of choice',
    description: 'Recognizing the moment-by-moment choice between moving toward what matters or away from it, especially under difficult private experiences.',
  },
};

export const COURSES: Course[] = [
  ...ACT_PROCESSES.map(
    (def): Course => ({
      id: def.id,
      title: def.name,
      subtitle: PROCESS_DESCRIPTIONS[def.id].subtitle,
      description: PROCESS_DESCRIPTIONS[def.id].description,
      icon: def.icon,
    })
  ),
  {
    id: 'personalized',
    title: 'My Personalized Lessons',
    subtitle: 'Built from your own logs and conversations',
    description:
      "Mini-courses generated just for your family, from a Daily Log entry, a Help Bot conversation, a recurring pattern, or any topic you bring — with why it happened, what helps, and a next step to try.",
    icon: PersonIcon,
  },
];

// The 7 ACT-process courses ship with placeholder content (see
// actProgramLessons.ts) — real content replaces it lesson-by-lesson later,
// no structural changes needed here. "personalized" has no static lessons;
// its lessons are generated per-family at runtime and live in
// PersonalizedLessonsProvider instead (see personalizedLessons/).
const LESSONS_BY_COURSE: Record<CourseId, Lesson[]> = {
  ...ACT_PROCESS_LESSONS,
  personalized: [],
};

export function getCourseById(id: string | undefined): Course | undefined {
  return COURSES.find((c) => c.id === id);
}

export function getLessonsForCourse(courseId: CourseId): Lesson[] {
  return LESSONS_BY_COURSE[courseId] ?? [];
}

export function getLessonById(lessonId: string | undefined): Lesson | undefined {
  if (!lessonId) return undefined;
  for (const lessons of Object.values(LESSONS_BY_COURSE)) {
    const found = lessons.find((l) => l.id === lessonId);
    if (found) return found;
  }
  return undefined;
}
