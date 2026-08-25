import { z } from 'zod';
import { askClaudeStructured, ClaudeChatMessage } from '../ai/anthropicClient';
import { AiFeatureId } from './types';

export interface ConversationTurnInput<T extends z.ZodType> {
  /** Which feature is calling through the engine — kept on every call for future logging/telemetry, not currently branched on. */
  feature: AiFeatureId;
  system: string;
  messages: ClaudeChatMessage[];
  schema: T;
  maxTokens?: number;
  thinkingEnabled?: boolean;
}

// The single call-through point for every conversational AI feature in the
// app. Deliberately thin — the actual shared behavior (persona, Decision
// Layer, safety triage, Family Blueprint read/write) lives in
// buildEnginePrompt.ts, safetyTriage.ts, and the Blueprint feature, all of
// which every caller composes together before/after calling this function.
// This function existing as one named seam is what makes it "one engine"
// rather than five copies of the same Anthropic call.
export async function runConversationTurn<T extends z.ZodType>(input: ConversationTurnInput<T>): Promise<z.infer<T>> {
  return askClaudeStructured({
    system: input.system,
    messages: input.messages,
    schema: input.schema,
    maxTokens: input.maxTokens,
    thinkingEnabled: input.thinkingEnabled,
  });
}

export type { ClaudeChatMessage };
