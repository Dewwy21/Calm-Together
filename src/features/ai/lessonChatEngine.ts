// The in-lesson "ask about this" chat, running on the shared AI
// Conversation Engine — same persona/safety/family-context plumbing as
// every other conversational feature, scoped to one lesson's content.
import { ClaudeChatMessage } from './anthropicClient';
import { runConversationTurn } from '../aiEngine/conversationEngine';
import { buildEnginePrompt } from '../aiEngine/buildEnginePrompt';
import { assessSafety, getSafetyResponse } from '../aiEngine/safetyTriage';
import { SafetyCategory } from '../aiEngine/types';
import { helpBotResponseSchema } from './responseSchema';
import { buildFamilyContext, FamilyContextInput } from './familyContext';
import { serializeLessonForAi } from '../courses/lessonHelpers';
import { Lesson } from '../courses/types';
import { hasApiKey } from './anthropicClient';

const FALLBACK_TEXT = "I'm having a little trouble connecting right now. Mind trying that again in a moment?";
const NO_API_KEY_TEXT =
  "I can't actually think yet — this app doesn't have an AI backend configured right now. Ask whoever set up this app to check its .env file and restart it to turn me on.";

const OBJECTIVE = `You're answering a caregiver's question about a specific lesson they're currently going through in the Otter Companion Parent Learning Series. This is scoped, in-context lesson support, not an open-ended coaching conversation. Treat the lesson content given below as your primary reference: when the caregiver asks for clarification, an example, or how something applies to their family, draw from what the lesson actually says first, then personalize using what you know about this family. If they ask something genuinely unrelated to the lesson, answer briefly and warmly, then gently steer back toward the lesson. Keep answers focused and conversational — a few sentences, since this is a quick in-context question, not a new lesson.`;

const THERAPIST_MODE_ON = `Therapist Mode is ON. When your answer draws on one of the frameworks above (ACT, CBT, Behavioral Parent Training, PCIT, Triple P, motivational interviewing, emotion coaching), name it in the "framework" field. Leave it null otherwise.`;
const THERAPIST_MODE_OFF = `Therapist Mode is OFF. Leave the "framework" field null.`;

export interface LessonChatResponse {
  text: string;
  framework: string | null;
  includeDisclaimer: boolean;
  isSafetyEvent: boolean;
  safetyCategory: SafetyCategory;
}

export async function generateLessonChatReply(
  lesson: Lesson,
  currentCardIndex: number,
  history: ClaudeChatMessage[],
  userMessage: string,
  familyContextInput: FamilyContextInput,
  therapistMode: boolean
): Promise<LessonChatResponse> {
  // Mirrors helpBotEngine's inline safety pattern (not SafetyTriggeredError,
  // which is for single-shot generators) — this is a live chat, so a
  // safety-flagged message returns a response the chat keeps rendering
  // rather than throwing to an error state.
  const safety = assessSafety(userMessage);
  if (safety.isSafetyEvent) {
    const response = getSafetyResponse(safety.category);
    return { text: response.text, framework: null, includeDisclaimer: false, isSafetyEvent: true, safetyCategory: safety.category };
  }

  const lessonContentBlock = `Here is the full content of the lesson the caregiver is currently going through, with the card they're looking at right now marked:\n\n${serializeLessonForAi(lesson, currentCardIndex)}`;

  const system = buildEnginePrompt({
    objective: OBJECTIVE,
    familyContext: buildFamilyContext(familyContextInput),
    includeDisclaimerField: true,
    extraInstructions: `${lessonContentBlock}\n\n${therapistMode ? THERAPIST_MODE_ON : THERAPIST_MODE_OFF}`,
  });

  try {
    const parsed = await runConversationTurn({
      feature: 'lessonChat',
      system,
      messages: [...history, { role: 'user', content: userMessage }],
      schema: helpBotResponseSchema,
      maxTokens: 1024,
    });

    // suggestedActivity/clarifyingQuestion/interventionType come along on
    // the reused schema but are deliberately ignored here, same as
    // aiReflectionEngine.ts — this feature's whole point is staying inside
    // the lesson, not routing the caregiver elsewhere.
    return {
      text: parsed.reply,
      framework: parsed.framework,
      includeDisclaimer: parsed.includeDisclaimer,
      isSafetyEvent: false,
      safetyCategory: 'none',
    };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[lessonChatEngine] generateLessonChatReply failed:', err);
    return {
      text: hasApiKey() ? FALLBACK_TEXT : NO_API_KEY_TEXT,
      framework: null,
      includeDisclaimer: false,
      isSafetyEvent: false,
      safetyCategory: 'none',
    };
  }
}
