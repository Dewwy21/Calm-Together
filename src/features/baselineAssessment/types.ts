import { OnboardingAnswers } from '../onboarding/types';

// The three points in the 28-day intervention this same assessment gets
// taken at — same questions, same scoring, same wizard, every time (see
// checkpoints.ts). Not a measure of when it was actually completed; a late
// Day 14 check-in still records `timepoint: 'day14'`, just with a later
// `completedAtISO` than its target date.
export type AssessmentTimepoint = 'baseline' | 'day14' | 'day28';

// One completed attempt at the Baseline Assessment. Every submission
// creates a new record — never overwrites a previous one — so caregivers
// can retake the assessment whenever they want and still see every past
// attempt. `answers` is keyed by question id (not positional), matching
// the same OnboardingAnswers shape the wizard already uses, so a later
// comparison/scoring feature can align answers across attempts by id
// without any storage migration.
export interface BaselineAssessmentRecord {
  id: string;
  childId: string;
  /** Defaults to 'baseline' when reading older records that predate this field — see resolveTimepoint() in checkpoints.ts. */
  timepoint?: AssessmentTimepoint;
  completedAtISO: string;
  answers: OnboardingAnswers;
  /** From the signed-in account at submission time — the digital equivalent of the source document's "Parent name" field, filled in automatically rather than asked. */
  completedByName?: string;
}
