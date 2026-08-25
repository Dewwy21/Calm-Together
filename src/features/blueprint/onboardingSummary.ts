import { OnboardingAnswers } from '../onboarding/types';
import { QUESTIONS, getQuestionOptionLabel } from '../onboarding/questions';
import { OTHER_VALUE } from '../onboarding/OnboardingQuestionCard';

export function buildOnboardingSummary(answers: OnboardingAnswers): string {
  const lines: string[] = [];

  QUESTIONS.forEach((question) => {
    const value = answers[question.id];
    if (value === undefined || (Array.isArray(value) && value.length === 0)) return;

    const resolveLabel = (v: string): string => {
      if (v === OTHER_VALUE) {
        const otherText = answers[`${question.id}__other`] as string | undefined;
        return otherText?.trim() || 'Other';
      }
      return getQuestionOptionLabel(question, v);
    };

    const labels = Array.isArray(value) ? value.map(resolveLabel) : [resolveLabel(value)];
    const note = answers[`${question.id}__note`] as string | undefined;
    lines.push(`${question.prompt} ${labels.join(', ')}${note ? ` (${note})` : ''}`);
  });

  return lines.length ? lines.join('\n') : 'The caregiver skipped the onboarding assessment — no answers were given.';
}
