import { QUESTIONS } from '../onboarding/questions';
import { OnboardingAnswers } from '../onboarding/types';

// Deterministic, non-AI scoring for the two standardized instruments in the
// Baseline Assessment — the Parental Stress Scale (Berry & Jones, 1995) and
// the 6-PAQ. Reuses the `reverseScored` flag already captured on each
// question from the source document's own scoring notes (see
// onboarding/types.ts) rather than re-deriving reverse-item lists here, so
// there's exactly one place that knows which items reverse.
//
// Deliberately does NOT invent severity bands (mild/moderate/severe) — the
// user gave us item groupings and the reverse/sum mechanics for both
// instruments, but no validated cutoff thresholds, so we only ever surface
// the raw score plus its known min/max range.

function itemScore(questionId: string, answers: OnboardingAnswers): number | null {
  const question = QUESTIONS.find((q) => q.id === questionId);
  if (!question) return null;
  const raw = answers[questionId];
  if (typeof raw !== 'string' || raw === '') return null;
  const rawNum = Number(raw);
  if (!Number.isFinite(rawNum)) return null;
  const scaleMax = question.options.length;
  return question.reverseScored ? scaleMax + 1 - rawNum : rawNum;
}

export interface RangedScore {
  raw: number;
  min: number;
  max: number;
}

const PSS_ITEM_IDS = Array.from({ length: 18 }, (_, i) => `stressScale${i + 1}`);

// Higher score = higher parental stress, lower satisfaction. Range 18-90
// (18 items, 1-5 each) — matches the 18 items actually in this assessment;
// see PAQ_SUBSCALES below, whose item numbers only make sense against an
// 18-item scale (they reference items up through #18).
export function computePssScore(answers: OnboardingAnswers): RangedScore | null {
  const scores = PSS_ITEM_IDS.map((id) => itemScore(id, answers));
  if (scores.some((s) => s === null)) return null;
  const raw = (scores as number[]).reduce((a, b) => a + b, 0);
  return { raw, min: PSS_ITEM_IDS.length, max: PSS_ITEM_IDS.length * 5 };
}

export interface PaqSubscaleScore extends RangedScore {
  id: string;
  label: string;
}

const PAQ_SUBSCALE_DEFS: { id: string; label: string; itemNumbers: number[] }[] = [
  { id: 'beingPresent', label: 'Being Present', itemNumbers: [1, 8, 17] },
  { id: 'values', label: 'Values', itemNumbers: [5, 10, 18] },
  { id: 'committedAction', label: 'Committed Action', itemNumbers: [2, 7, 15] },
  { id: 'selfAsContext', label: 'Self as Context', itemNumbers: [4, 9, 13] },
  { id: 'defusion', label: 'Defusion', itemNumbers: [6, 11, 16] },
  { id: 'acceptance', label: 'Acceptance', itemNumbers: [3, 12, 14] },
];

// Each subscale sums 3 items (1-4 each, reversed where flagged), range
// 3-12. Higher = greater difficulty/inflexibility in that domain — this is
// the instrument's own convention, not a display choice, so callers should
// present it as such rather than flipping it into a "higher is better"
// framing.
export function computePaqSubscales(answers: OnboardingAnswers): PaqSubscaleScore[] | null {
  const results: PaqSubscaleScore[] = [];
  for (const def of PAQ_SUBSCALE_DEFS) {
    const scores = def.itemNumbers.map((n) => itemScore(`paq${n}`, answers));
    if (scores.some((s) => s === null)) return null;
    const raw = (scores as number[]).reduce((a, b) => a + b, 0);
    results.push({ id: def.id, label: def.label, raw, min: 3, max: 12 });
  }
  return results;
}
