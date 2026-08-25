import { OnboardingAnswers } from '../onboarding/types';

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
  completedAtISO: string;
  answers: OnboardingAnswers;
  /** From the signed-in account at submission time — the digital equivalent of the source document's "Parent name" field, filled in automatically rather than asked. */
  completedByName?: string;
}
