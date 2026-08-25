import { WaveIcon, BackpackIcon, MegaphoneIcon, FlowerIcon, PersonIcon } from '../../components/icons';
import { Course, CourseId, Lesson } from './types';
import { TANTRUM_LESSONS } from './lessons/tantrumsLessons';
import { ORGANIZATION_LESSONS } from './lessons/organizationLessons';
import { LISTENING_LESSONS } from './lessons/listeningLessons';
import { SOCIAL_LESSONS } from './lessons/socialLessons';

export const COURSES: Course[] = [
  {
    id: 'tantrums',
    title: 'Tantrums Tamed',
    subtitle: 'Calm, confident responses to big emotions',
    description:
      'Tell tantrums and meltdowns apart, catch escalation early, and build a real toolkit for the hardest moments — plus the repair that comes after.',
    icon: WaveIcon,
  },
  {
    id: 'organization',
    title: 'Mastering Organization',
    subtitle: 'Routines and systems that actually stick',
    description:
      'Build visual schedules, landing zones, and routines that work with an ADHD brain instead of against it — small enough to actually survive a busy week.',
    icon: BackpackIcon,
  },
  {
    id: 'listening',
    title: 'Teaching Your Kids to Listen',
    subtitle: 'Instructions that land the first time',
    description:
      'Learn why instructions get missed, how to deliver them so they land, and how to follow through consistently without the nagging.',
    icon: MegaphoneIcon,
  },
  {
    id: 'social',
    title: 'Mastering Social Skills',
    subtitle: 'Building friendships and confidence',
    description:
      'From reading body language to handling rejection and rehearsing tricky moments ahead of time — practical support for the social side of ADHD.',
    icon: FlowerIcon,
  },
  {
    id: 'personalized',
    title: 'My Personalized Lessons',
    subtitle: 'Built from your own logs and conversations',
    description:
      "Mini-courses generated just for your family, from a Daily Log entry, a Help Bot conversation, a recurring pattern, or any topic you bring — with why it happened, what helps, and a next step to try.",
    icon: PersonIcon,
  },
];

// The four built-in courses ship with fixed content. "personalized" has no
// static lessons here — its lessons are generated per-family at runtime and
// live in PersonalizedLessonsProvider instead (see personalizedLessons/).
const LESSONS_BY_COURSE: Record<CourseId, Lesson[]> = {
  tantrums: TANTRUM_LESSONS,
  organization: ORGANIZATION_LESSONS,
  listening: LISTENING_LESSONS,
  social: SOCIAL_LESSONS,
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
