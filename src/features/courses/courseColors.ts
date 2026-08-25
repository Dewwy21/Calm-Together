import { Theme } from '../../theme';
import { CourseId } from './types';

// Cycles through the theme's semantic accent roles so every course gets a
// distinct, theme-adaptive color (works across all palette choices and
// light/dark mode, unlike a hardcoded hex value would).
const ROLE_BY_COURSE: Record<CourseId, 'primary' | 'secondary' | 'accent'> = {
  tantrums: 'primary',
  organization: 'secondary',
  listening: 'accent',
  social: 'primary',
  personalized: 'secondary',
};

export function getCourseAccent(theme: Theme, courseId: CourseId): { accentColor: string; accentTint: string } {
  const role = ROLE_BY_COURSE[courseId];
  return {
    accentColor: theme.color[role],
    accentTint: theme.color[`${role}Tint` as const],
  };
}
