import { z } from 'zod';
import { decisionLayerShape } from '../aiEngine/decisionSchema';

export const SUGGESTABLE_FEATURES = ['calmCorner', 'conversationCards', 'parentLesson', 'dailyLog', 'actCheckIn'] as const;

export const helpBotResponseSchema = z.object({
  ...decisionLayerShape,
  reply: z.string().describe('The warm, conversational coaching reply to show the caregiver.'),
  clarifyingQuestion: z
    .boolean()
    .describe('True if this reply is primarily asking for more context before advising.'),
  suggestedActivity: z
    .object({
      feature: z.enum(SUGGESTABLE_FEATURES),
      id: z.string().nullable().describe('A specific id if you know one (e.g. a Calm Corner exercise id), otherwise null.'),
      label: z.string().describe('Short button label, e.g. "Try Box Breathing".'),
      reason: z.string().describe('One short sentence on why this would help right now.'),
    })
    .nullable()
    .describe('Exactly one relevant in-app activity to suggest, or null if none is genuinely relevant right now.'),
  framework: z
    .string()
    .nullable()
    .describe('The evidence-based approach behind this reply, only when Therapist Mode is on and genuinely applicable.'),
});

export type HelpBotAiResponse = z.infer<typeof helpBotResponseSchema>;
