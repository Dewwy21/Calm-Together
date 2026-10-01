import { AiFeatureId } from '../aiEngine/types';

export type ResearchEnvironment = 'TEST' | 'REAL';

// One research category per interaction — see researchCategories.ts for
// how these map onto the app's existing AiFeatureId system. Extend this
// list (and researchCategories.ts's mapping) when a genuinely new category
// is needed; "Other" is the deliberate catch-all in the meantime.
export const RESEARCH_CATEGORIES = [
  'ACT AI Response',
  'General AI Response',
  'Daily Logging Response',
  'ACT Classification',
  'Parent Replay',
  'Simulator',
  'AI Reflection',
  'Personalized Lesson',
  'Lesson Chat',
  'Growth Encouragement',
  'Pattern Insight',
  'Family Blueprint',
  'Other',
] as const;
export type ResearchCategory = (typeof RESEARCH_CATEGORIES)[number];

// What a caller supplies — everything a researcher/AI feature actually has
// on hand once a response exists. `interactionId` and `timestamp` are
// filled in by the logger itself (see researchLogger.ts), never by callers,
// so nothing has to generate or coordinate those independently.
export interface ResearchLogInput {
  sessionId: string;
  interactionType: ResearchCategory;
  /** The underlying AiFeatureId when this interaction went through the Conversation Engine; 'actCoach' for the standalone ACT Parenting Coach (calls askClaudeStructured directly, not part of AiFeatureId — see actCoachEngine.ts); 'test' for the standalone connectivity check. */
  feature: AiFeatureId | 'actCoach' | 'test';
  environment: ResearchEnvironment;
  /** Required when environment is 'TEST', omitted for 'REAL' (see PreferencesProvider's activeTestCaseId). */
  testCaseId?: string | null;
  userInput: string;
  aiResponse: string;
  /** Semicolon-joined when more than one applies, e.g. "Acceptance; Cognitive Defusion" — empty/omitted when not applicable to this interaction. */
  actProcess?: string;
  /** Whatever severity signal the real system already computed for this turn (e.g. the safety-triage category) — never a new score invented for logging. */
  severity?: string;
  model: string;
  notes?: string;
}

// The full row actually POSTed to the Apps Script endpoint.
export interface ResearchLogRecord extends ResearchLogInput {
  interactionId: string;
  timestamp: string;
}
