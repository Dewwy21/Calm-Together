import { z } from 'zod';

export const simulatorChildReplySchema = z.object({
  reply: z.string().describe("The child's in-character spoken reply, and only that — no narration outside the character."),
});

export const simulatorCoachingSchema = z.object({
  includeDisclaimer: z
    .boolean()
    .describe('True whenever this coaching includes real psychological guidance a caregiver might mistake for professional advice — almost always true here.'),
  whatWorked: z
    .array(z.string())
    .describe('One or two specific things the caregiver did well in this practice session.'),
  tryNextTime: z
    .array(z.string())
    .describe('One or two specific, concrete things to try differently next time.'),
  framework: z
    .string()
    .nullable()
    .describe('The evidence-based approach this coaching draws on, only when Therapist Mode is on and genuinely applicable.'),
});

export type SimulatorCoachingResult = z.infer<typeof simulatorCoachingSchema>;
