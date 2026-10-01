import { z } from 'zod';
import { askClaudeStructured } from '../ai/anthropicClient';
import { assessSafety, getSafetyResponse } from '../aiEngine/safetyTriage';
import { SafetyCategory } from '../aiEngine/types';
import { ACT_COACH_SYSTEM_PROMPT } from './actCoachPrompt';

// This is a standalone ACT coaching tool with its own carefully-authored
// persona/few-shot prompt — it deliberately calls askClaudeStructured
// directly rather than going through runConversationTurn/buildEnginePrompt
// (the generic Otter chat persona + Decision Layer), since wrapping a
// second, different persona around an already-complete system prompt would
// just dilute it. Same pattern as growthEncouragement.ts/patternInsights.ts.
//
// Safety triage still runs first, same local keyword check every other
// text-input AI feature in the app uses, before any AI call — a free-text
// "describe your struggle" field is exactly the input shape that check
// exists for.

const actCoachResponseSchema = z.object({
  process: z
    .string()
    .describe('The primary (and optional secondary) ACT process most relevant to this challenge, e.g. "Primary: Acceptance | Secondary: Committed Action".'),
  logic: z.string().describe('One sentence explaining how these processes manifest in this specific frustration.'),
  response: z
    .string()
    .describe('A brief, warm, non-clinical response: lead with validation, plain language instead of textbook jargon, end with a forward-looking actionable question.'),
});

export type ActCoachResult =
  | { kind: 'safety'; text: string; quickReplies: string[]; category: SafetyCategory }
  | { kind: 'coaching'; process: string; logic: string; response: string; category: SafetyCategory };

export async function getActCoachingResponse(parentMessage: string): Promise<ActCoachResult> {
  const safety = assessSafety(parentMessage);
  if (safety.isSafetyEvent) {
    const safetyResponse = getSafetyResponse(safety.category);
    return { kind: 'safety', text: safetyResponse.text, quickReplies: safetyResponse.quickReplies, category: safety.category };
  }

  const result = await askClaudeStructured({
    system: ACT_COACH_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Parent: ${parentMessage}` }],
    schema: actCoachResponseSchema,
    maxTokens: 512,
    thinkingEnabled: false,
  });

  // 'none' here is deterministic, not computed by the AI — safety.isSafetyEvent
  // was already checked false above, same as helpBotEngine.ts's identical pattern.
  return { kind: 'coaching', ...result, category: 'none' };
}
