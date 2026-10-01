import { AiFeatureId, InterventionType } from '../aiEngine/types';
import { ResearchCategory } from './types';

// Reuses the app's existing AiFeatureId system (see aiEngine/types.ts)
// rather than a parallel feature-identification scheme — most features map
// to one fixed category. Help Bot is the exception: its category depends
// on what the Decision Layer actually chose for that specific turn (see
// categoryForHelpBotTurn below), since the existing interventionType field
// already distinguishes an ACT-based reply from any other kind more
// precisely than a static per-feature label could.
const STATIC_CATEGORY_BY_FEATURE: Partial<Record<AiFeatureId, ResearchCategory>> = {
  actCheckIn: 'ACT Classification',
  parentReplay: 'Parent Replay',
  simulator: 'Simulator',
  aiReflection: 'AI Reflection',
  personalizedLesson: 'Personalized Lesson',
  lessonChat: 'Lesson Chat',
};

// "ACT AI Response" only when the Decision Layer genuinely picked an
// ACT-based intervention for this turn (see decisionSchema.ts's
// interventionType) — every other Help Bot reply (CBT reframing,
// parenting strategy, validation, etc.) is "General AI Response" instead,
// so the category reflects the real per-turn classification rather than
// labeling every Help Bot message as ACT regardless of what it actually was.
export function categoryForHelpBotTurn(interventionType: InterventionType | null): ResearchCategory {
  return interventionType === 'actIntervention' ? 'ACT AI Response' : 'General AI Response';
}

export function categoryForFeature(feature: AiFeatureId, interventionType?: InterventionType | null): ResearchCategory {
  if (feature === 'helpBot') return categoryForHelpBotTurn(interventionType ?? null);
  return STATIC_CATEGORY_BY_FEATURE[feature] ?? 'Other';
}
