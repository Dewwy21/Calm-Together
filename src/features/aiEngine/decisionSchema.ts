import { z } from 'zod';
import { INTERVENTION_TYPES } from './types';

export const interventionTypeSchema = z.enum(INTERVENTION_TYPES);

// Matches actSkillOptions.ts's ACT_SKILL_OPTIONS ids exactly, minus
// 'noneToday' (an empty array already means "none" here) — kept as its own
// literal tuple since zod's enum needs a compile-time tuple, not a value
// derived from that array at runtime. Keep the two lists in sync if either
// changes.
export const ACT_PROCESS_IDS = [
  'acceptance',
  'cognitiveDefusion',
  'presentMomentAwareness',
  'selfAsContext',
  'values',
  'committedAction',
] as const;

// Spread into any feature's response schema (`z.object({ ...decisionLayerShape, reply: z.string(), ... })`)
// so the Decision Layer's choice travels with every engine response in the same shape.
export const decisionLayerShape = {
  interventionType: interventionTypeSchema.describe('The Decision Layer\'s choice of response type for this turn.'),
  interventionReasoning: z.string().describe('One short internal sentence on why — not shown to the caregiver verbatim.'),
  includeDisclaimer: z
    .boolean()
    .describe('True only if this response gives real advice/guidance a caregiver might mistake for professional clinical guidance.'),
  // Self-reported research/logging metadata, not something the caregiver
  // sees or that changes how the response is written — see
  // buildEnginePrompt.ts's DECISION_LAYER_INSTRUCTIONS for the one line
  // that asks for this, right alongside interventionType/interventionReasoning.
  actProcessesUsed: z
    .array(z.enum(ACT_PROCESS_IDS))
    .describe(
      'Which ACT process(es), if any, this response genuinely drew on — empty array if none apply. Only expected to be non-empty when interventionType is "actIntervention".'
    ),
};
