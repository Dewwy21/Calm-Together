import { z } from 'zod';
import { runConversationTurn } from '../aiEngine/conversationEngine';
import { buildEnginePrompt } from '../aiEngine/buildEnginePrompt';
import { assessSafety } from '../aiEngine/safetyTriage';
import { SafetyTriggeredError } from '../aiEngine/safetyError';
import { buildFamilyContext, FamilyContextInput } from './familyContext';
import { LoggedEvent } from '../logEvent/types';

export const parentReplaySchema = z.object({
  includeDisclaimer: z
    .boolean()
    .describe('True whenever this replay includes real advice or psychological reasoning a caregiver might mistake for professional guidance — almost always true here.'),
  turns: z
    .array(
      z.object({
        speaker: z.enum(['child', 'caregiver']),
        text: z.string(),
      })
    )
    .describe('A plausible reconstructed back-and-forth of how this moment likely unfolded, based on what the caregiver described.'),
  keyMoments: z
    .array(
      z.object({
        turnIndex: z.number().describe('Index into turns where a different response may have changed the outcome.'),
        alternative: z.string().describe('An alternative way the caregiver could have responded at that moment.'),
        reasoning: z.string().describe('Plain-language explanation of why this alternative might have helped.'),
        framework: z.string().nullable(),
      })
    )
    .describe('One or two moments worth highlighting, never more.'),
});

export type ParentReplayResult = z.infer<typeof parentReplaySchema>;

const OBJECTIVE = `You're helping a caregiver reflect on a specific difficult moment with their child that they already logged — a "Parent Replay". You're given their own account of what happened. Reconstruct a plausible, natural back-and-forth conversation (a handful of turns, alternating child and caregiver) consistent with what they described — you're dramatizing their own account so they can see it played out, not inventing a different story. Then identify one or two specific moments where a different caregiver response might have changed how things went, with a concrete alternative wording and the psychological reasoning behind it. Be compassionate, never critical — this is for learning, not for pointing out what they did wrong.`;

function summarizeEvent(event: LoggedEvent): string {
  const lines = [`Type of moment: ${event.eventType}`, `Intensity: ${event.intensity}/10`, `What happened: ${event.whatHappened}`];
  if (event.before) lines.push(`Right before: ${event.before}`);
  if (event.after) lines.push(`Right after: ${event.after}`);
  if (event.whoPresent) lines.push(`Who was present: ${event.whoPresent}`);
  if (event.consequences) lines.push(`What happened next: ${event.consequences}`);
  return lines.join('\n');
}

export async function generateParentReplay(
  event: LoggedEvent,
  familyContextInput: FamilyContextInput,
  therapistMode: boolean
): Promise<ParentReplayResult> {
  const eventSummary = summarizeEvent(event);

  // A Parent Replay dramatizes the logged moment — if the moment itself
  // describes real harm, reconstructing it as a normal learning scenario
  // would be inappropriate. Safety triage runs before any AI call, same as
  // everywhere else in the engine.
  const safety = assessSafety(`${eventSummary} ${event.additionalNotes}`);
  if (safety.isSafetyEvent) {
    throw new SafetyTriggeredError(safety.category);
  }

  const context = buildFamilyContext(familyContextInput);
  const therapistInstruction = therapistMode
    ? 'Therapist Mode is on: populate "framework" for each key moment with the specific approach it draws on.'
    : 'Therapist Mode is off: leave "framework" null for every key moment.';

  const system = buildEnginePrompt({
    objective: OBJECTIVE,
    familyContext: context,
    includeDisclaimerField: true,
    extraInstructions: therapistInstruction,
  });

  return runConversationTurn({
    feature: 'parentReplay',
    system,
    messages: [{ role: 'user', content: `Here is what the caregiver logged about this moment:\n\n${eventSummary}` }],
    schema: parentReplaySchema,
    maxTokens: 2048,
    thinkingEnabled: true,
  });
}
