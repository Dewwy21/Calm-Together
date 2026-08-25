import { ClaudeChatMessage } from './anthropicClient';
import { runConversationTurn } from '../aiEngine/conversationEngine';
import { buildEnginePrompt } from '../aiEngine/buildEnginePrompt';
import { assessSafety } from '../aiEngine/safetyTriage';
import { SafetyTriggeredError } from '../aiEngine/safetyError';
import { helpBotResponseSchema, HelpBotAiResponse } from './responseSchema';
import { buildFamilyContext, FamilyContextInput } from './familyContext';
import { getSubtypeLabel } from '../logEvent/subtypeOptions';
import { EventType, LoggedEvent } from '../logEvent/types';

// AI Reflections shares Help Bot's exact response shape (reply,
// suggestedActivity, framework, plus the Decision Layer fields) — same
// engine, same schema, a different objective. The screen only ever uses
// `reply`/`framework`/`includeDisclaimer` from it; the deterministic
// `resolveSuggestion` logic already covers Daily Log's own activity
// recommendation, so `suggestedActivity` here is left unused by design
// rather than showing two competing suggestions.
//
// Positive Moments get a genuinely different objective, not just a softer
// version of the challenge-event one — celebration and reinforcement
// instead of analysis, per the caregiver-facing design intent for that flow.
const CHALLENGE_OBJECTIVE = `You're helping a caregiver reflect on something difficult they just logged in their Daily Log — an "AI Reflection". Open with a warm, specific reflection: acknowledge what happened, notice something real and specific about it (not generic), and if it would genuinely help, offer one grounded next step or a short script they could use. If they reply with a follow-up message, continue the conversation naturally from there rather than repeating the opening reflection.`;

const POSITIVE_OBJECTIVE = `You're helping a caregiver reflect on a Positive Moment they just logged in their Daily Log — an "AI Reflection". This is a celebration, not an analysis: genuinely celebrate what went well, and be specific about it rather than generically positive. Name a real strength you notice in the child based on what they're describing, and a real strength or positive parenting behavior you notice in the caregiver themselves — caregivers rarely get to hear what they're doing right. Reinforce whatever contributed to the moment (a strategy, a choice, a way they responded) and gently encourage them to keep doing it. Do not pivot into problem-solving, coping strategies, or "things to work on" — there is no problem here to solve. If they reply with a follow-up message, continue the conversation in that same celebratory, strengths-focused spirit.`;

const THERAPIST_MODE_ON = `Therapist Mode is on: populate "framework" with the specific approach your reflection draws on, when genuinely applicable.`;
const THERAPIST_MODE_OFF = `Therapist Mode is off: leave "framework" null.`;

function summarizeEventForReflection(event: LoggedEvent): string {
  const subtypeLabel = getSubtypeLabel(event.eventType, event.subtype);

  if (event.eventType === 'positiveMoment') {
    const lines = [
      `The caregiver just logged a Positive Moment${subtypeLabel ? ` (${subtypeLabel})` : ''}.`,
      `What made it meaningful: ${event.meaningfulMoment}`,
    ];
    if (event.childStrength) lines.push(`What the child did well: ${event.childStrength}`);
    if (event.caregiverContribution) lines.push(`What the caregiver did that helped create it: ${event.caregiverContribution}`);
    if (event.feelingReflection) lines.push(`How it made the caregiver feel: ${event.feelingReflection}`);
    if (event.memorableDetail) lines.push(`What they want to remember about it: ${event.memorableDetail}`);
    if (event.repeatStrategy) lines.push(`Their own idea for creating more moments like this: ${event.repeatStrategy}`);
    return lines.join('\n');
  }

  const lines = [
    `The caregiver just logged: a ${event.eventType}${subtypeLabel ? ` (${subtypeLabel})` : ''}, intensity ${event.intensity}/10.`,
    `What happened: ${event.whatHappened}`,
  ];
  if (event.before) lines.push(`Right before: ${event.before}`);
  if (event.after) lines.push(`Right after: ${event.after}`);
  if (event.consequences) lines.push(`What happened next: ${event.consequences}`);
  return lines.join('\n');
}

function buildSystem(eventType: EventType, familyContextInput: FamilyContextInput, therapistMode: boolean): string {
  return buildEnginePrompt({
    objective: eventType === 'positiveMoment' ? POSITIVE_OBJECTIVE : CHALLENGE_OBJECTIVE,
    familyContext: buildFamilyContext(familyContextInput),
    includeDecisionLayer: true,
    includeDisclaimerField: true,
    extraInstructions: therapistMode ? THERAPIST_MODE_ON : THERAPIST_MODE_OFF,
  });
}

function safetyScanText(event: LoggedEvent): string {
  return [
    event.whatHappened,
    event.before,
    event.after,
    event.consequences,
    event.additionalNotes,
    event.meaningfulMoment,
    event.childStrength,
    event.caregiverContribution,
    event.feelingReflection,
    event.memorableDetail,
    event.repeatStrategy,
  ]
    .filter(Boolean)
    .join(' ');
}

export async function generateInitialReflection(
  event: LoggedEvent,
  familyContextInput: FamilyContextInput,
  therapistMode: boolean
): Promise<HelpBotAiResponse> {
  const eventSummary = summarizeEventForReflection(event);
  const safety = assessSafety(safetyScanText(event));
  if (safety.isSafetyEvent) {
    throw new SafetyTriggeredError(safety.category);
  }

  return runConversationTurn({
    feature: 'aiReflection',
    system: buildSystem(event.eventType, familyContextInput, therapistMode),
    messages: [{ role: 'user', content: eventSummary }],
    schema: helpBotResponseSchema,
    maxTokens: 1024,
    thinkingEnabled: true,
  });
}

export async function generateReflectionReply(
  eventType: EventType,
  history: ClaudeChatMessage[],
  userMessage: string,
  familyContextInput: FamilyContextInput,
  therapistMode: boolean
): Promise<HelpBotAiResponse> {
  const safety = assessSafety(userMessage);
  if (safety.isSafetyEvent) {
    throw new SafetyTriggeredError(safety.category);
  }

  return runConversationTurn({
    feature: 'aiReflection',
    system: buildSystem(eventType, familyContextInput, therapistMode),
    messages: [...history, { role: 'user', content: userMessage }],
    schema: helpBotResponseSchema,
    maxTokens: 1024,
  });
}
