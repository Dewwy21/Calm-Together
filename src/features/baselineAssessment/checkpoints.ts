import { AssessmentTimepoint, BaselineAssessmentRecord } from './types';

// Older records were written before `timepoint` existed — treat those as
// the baseline attempts they actually were, rather than migrating storage.
export function resolveTimepoint(record: BaselineAssessmentRecord): AssessmentTimepoint {
  return record.timepoint ?? 'baseline';
}

export const CHECKPOINT_LABELS: Record<AssessmentTimepoint, string> = {
  baseline: 'Baseline Assessment',
  day14: 'Day 14 Check-In',
  day28: 'Day 28 Assessment',
};

const CHECKPOINT_OFFSET_DAYS: Record<'day14' | 'day28', number> = {
  day14: 14,
  day28: 28,
};

const DAY_MS = 24 * 60 * 60 * 1000;

export function getCheckpointDueDate(interventionStartDateISO: string, timepoint: 'day14' | 'day28'): Date {
  const start = new Date(interventionStartDateISO);
  return new Date(start.getTime() + CHECKPOINT_OFFSET_DAYS[timepoint] * DAY_MS);
}

export type CheckpointStatus =
  | { state: 'noProgramYet' }
  | { state: 'upcoming'; dueDate: Date }
  | { state: 'due'; dueDate: Date }
  | { state: 'completed'; completedAtISO: string };

// Mirrors useCheckInState's isDue pattern: "due" just means the target date
// has arrived and nothing's been recorded for it yet — retaking later (or
// early, via the same Settings row) is always allowed and never blocked.
export function getCheckpointStatus(
  interventionStartDateISO: string | undefined,
  records: BaselineAssessmentRecord[],
  timepoint: 'day14' | 'day28'
): CheckpointStatus {
  const existing = records.find((r) => resolveTimepoint(r) === timepoint);
  if (existing) return { state: 'completed', completedAtISO: existing.completedAtISO };
  if (!interventionStartDateISO) return { state: 'noProgramYet' };

  const dueDate = getCheckpointDueDate(interventionStartDateISO, timepoint);
  return Date.now() >= dueDate.getTime() ? { state: 'due', dueDate } : { state: 'upcoming', dueDate };
}

export const TOTAL_INTERVENTION_DAYS = 28;

// 1-based day number since the intervention started, clamped to the
// program length — used for the "Day X of 28" display and to pick which
// lesson to suggest each day (see coursePath.ts).
export function getInterventionDayNumber(interventionStartDateISO: string): number {
  const elapsedDays = Math.floor((Date.now() - new Date(interventionStartDateISO).getTime()) / DAY_MS) + 1;
  return Math.min(Math.max(elapsedDays, 1), TOTAL_INTERVENTION_DAYS);
}
