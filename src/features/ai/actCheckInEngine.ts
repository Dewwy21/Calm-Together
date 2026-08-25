import { ClaudeChatMessage } from './anthropicClient';
import { runConversationTurn } from '../aiEngine/conversationEngine';
import { buildEnginePrompt } from '../aiEngine/buildEnginePrompt';
import { assessSafety } from '../aiEngine/safetyTriage';
import { SafetyTriggeredError } from '../aiEngine/safetyError';
import { helpBotResponseSchema, HelpBotAiResponse } from './responseSchema';
import { buildFamilyContext, FamilyContextInput } from './familyContext';

// The ACT Parenting Check-In's scripted coaching content (see
// actContent.ts) is fixed and never touched by the AI — it's transcribed
// verbatim from the prototype document. This file is the one place the AI
// Conversation Engine actually participates in that assessment: the
// optional "Would you like to tell us more?" box after each multiple-choice
// answer. Its only job is to warmly receive whatever the caregiver adds,
// not to run the ACT steps itself.
const OBJECTIVE = `The caregiver is going through the "ACT Parenting Check-In" — a fixed, pre-written, step-by-step ACT coaching script you do not control and should not try to replicate, extend, or reference by process name. You're only handling one small, optional part: they just answered a multiple-choice question in that script and chose to add something in an optional "tell us more" box. Warmly and briefly acknowledge what they shared, connect it genuinely to what they just chose (don't just repeat it back), and ask ONE clarifying question only if it would genuinely help you understand their situation better — otherwise just validate what they said. Keep it short, a sentence or two. Do not give parenting advice, coping techniques, or try to move them through any ACT process yourself — the caregiver will be handed straight back to the next scripted step right after this, so your only job is the warm, human moment in between.`;

export async function generateActCheckInFollowUp(input: {
  stepLabel: string;
  questionPrompt: string;
  chosenOption: string;
  priorExchange: ClaudeChatMessage[];
  caregiverNote: string;
  familyContextInput: FamilyContextInput;
}): Promise<HelpBotAiResponse> {
  const safety = assessSafety(input.caregiverNote);
  if (safety.isSafetyEvent) {
    throw new SafetyTriggeredError(safety.category);
  }

  const system = buildEnginePrompt({
    objective: OBJECTIVE,
    familyContext: buildFamilyContext(input.familyContextInput),
  });

  const situationContext = `Step in the ACT Check-In: ${input.stepLabel}\nQuestion they were just asked: ${input.questionPrompt}\nWhat they chose: "${input.chosenOption}"`;

  return runConversationTurn({
    feature: 'actCheckIn',
    system,
    messages: [
      { role: 'user', content: situationContext },
      ...input.priorExchange,
      { role: 'user', content: input.caregiverNote },
    ],
    schema: helpBotResponseSchema,
    maxTokens: 512,
  });
}
