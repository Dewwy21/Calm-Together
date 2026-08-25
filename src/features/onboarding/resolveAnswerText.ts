import { QUESTIONS, getQuestionOptionLabel } from './questions';
import { OnboardingAnswers } from './types';
import { OTHER_VALUE } from './OnboardingQuestionCard';

// Turns a raw stored answer into its display text — shared by the
// in-flow Review step and the read-only Assessment History detail view,
// so both always render an answer identically.
export function resolveAnswerText(answers: OnboardingAnswers, questionId: string): string | null {
  const question = QUESTIONS.find((q) => q.id === questionId);
  if (!question) return null;
  const value = answers[questionId];
  if (value === undefined || (Array.isArray(value) && value.length === 0)) return null;

  if (question.type === 'shortText' || question.type === 'longText') {
    return (value as string).trim() || null;
  }

  const resolveLabel = (v: string): string => {
    if (v === OTHER_VALUE) {
      const otherText = answers[`${questionId}__other`] as string | undefined;
      return otherText?.trim() || 'Other';
    }
    return getQuestionOptionLabel(question, v);
  };

  const labels = Array.isArray(value) ? value.map(resolveLabel) : [resolveLabel(value)];
  return labels.join(', ');
}
