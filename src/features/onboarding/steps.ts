import { QUESTIONS } from './questions';
import { SECTIONS } from './sections';
import { OnboardingQuestion, OnboardingSection } from './types';

export type OnboardingStep =
  | { kind: 'welcome' }
  | { kind: 'sectionIntro'; section: OnboardingSection }
  | { kind: 'question'; question: OnboardingQuestion; questionIndex: number }
  | { kind: 'processing' }
  | { kind: 'review' };

// Walks the 5 sections in order, emitting one section-intro step followed
// by one step per question in that section — replaces the old hardcoded
// index-group/encouragement-break structure (which assumed a fixed
// 17-question shape) with something that adapts to the assessment's real
// 5-section structure.
function buildQuestionSteps(): OnboardingStep[] {
  const steps: OnboardingStep[] = [];
  SECTIONS.forEach((section) => {
    steps.push({ kind: 'sectionIntro', section });
    section.questionIds.forEach((questionId) => {
      const questionIndex = QUESTIONS.findIndex((q) => q.id === questionId);
      const question = QUESTIONS[questionIndex];
      steps.push({ kind: 'question', question, questionIndex });
    });
  });
  return steps;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  { kind: 'welcome' },
  ...buildQuestionSteps(),
  { kind: 'processing' },
  { kind: 'review' },
];
