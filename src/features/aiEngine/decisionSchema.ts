import { z } from 'zod';
import { INTERVENTION_TYPES } from './types';

export const interventionTypeSchema = z.enum(INTERVENTION_TYPES);

// Spread into any feature's response schema (`z.object({ ...decisionLayerShape, reply: z.string(), ... })`)
// so the Decision Layer's choice travels with every engine response in the same shape.
export const decisionLayerShape = {
  interventionType: interventionTypeSchema.describe('The Decision Layer\'s choice of response type for this turn.'),
  interventionReasoning: z.string().describe('One short internal sentence on why — not shown to the caregiver verbatim.'),
  includeDisclaimer: z
    .boolean()
    .describe('True only if this response gives real advice/guidance a caregiver might mistake for professional clinical guidance.'),
};
