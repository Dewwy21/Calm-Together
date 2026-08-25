// The AI Conversation Engine is the single seam every conversational AI
// feature calls through — Help Bot, Parent Replay, Conversation Simulator,
// AI Reflections, Personalized Lessons, and any future feature (an ACT
// Assessment, therapist reports, adaptive learning). Each feature supplies
// its own objective, prompt, and output schema; the engine supplies the
// shared voice, the Decision Layer, the safety triage, and the Family
// Blueprint read/write — so none of that has to be reimplemented per
// feature, and a new feature only has to write what's actually new.
export type AiFeatureId = 'helpBot' | 'parentReplay' | 'simulator' | 'aiReflection' | 'personalizedLesson' | 'actCheckIn' | 'lessonChat';

// What the Decision Layer chooses between before any response is written.
// Caregiver regulation always outranks child-behavior tactics — see
// buildEnginePrompt.ts's DECISION_LAYER_INSTRUCTIONS.
export const INTERVENTION_TYPES = [
  'emotionalValidation',
  'actIntervention',
  'cbtReframing',
  'parentingStrategy',
  'suggestParentReplay',
  'suggestSimulator',
  'suggestCalmCorner',
  'suggestLesson',
  'encouragement',
  'clarifyingQuestion',
] as const;

export type InterventionType = (typeof INTERVENTION_TYPES)[number];

export type SafetyCategory = 'none' | 'selfHarm' | 'harmToChild' | 'domesticViolence';

// A discriminated union (not `{ category, isSafetyEvent: boolean }`) so
// `if (safety.isSafetyEvent)` actually narrows `category` away from
// 'none' at every call site, instead of every caller needing its own cast.
export type SafetyAssessment =
  | { isSafetyEvent: false; category: 'none' }
  | { isSafetyEvent: true; category: Exclude<SafetyCategory, 'none'> };

export interface SafetyResponse {
  text: string;
  quickReplies: string[];
}
