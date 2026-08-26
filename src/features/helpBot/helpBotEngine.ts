// Help Bot's implementation of `HelpBotEngine` (see types.ts), running on
// the shared AI Conversation Engine (src/features/aiEngine/) — the safety
// triage, Decision Layer, and persona all come from there. This file only
// supplies what's actually specific to Help Bot: the objective, the
// Therapist Mode / suggested-activity instructions, and mapping the
// engine's structured output into HelpBotResponse.
import { HelpBotEngine, HelpBotAction } from './types';
import { assessSafety, getSafetyResponse } from '../aiEngine/safetyTriage';
import { runConversationTurn } from '../aiEngine/conversationEngine';
import { buildEnginePrompt } from '../aiEngine/buildEnginePrompt';
import { buildFamilyContext } from '../ai/familyContext';
import { helpBotResponseSchema } from '../ai/responseSchema';
import { hasApiKey } from '../ai/anthropicClient';

const FALLBACK_TEXT = "I'm having a little trouble connecting right now. Mind trying that again in a moment?";
const NO_API_KEY_TEXT =
  "I can't actually think yet — this app doesn't have an AI backend configured right now. Ask whoever set up this app to check its .env file and restart it to turn me on.";

function activityHref(activity: { feature: string; id: string | null }): string {
  switch (activity.feature) {
    case 'calmCorner':
      return activity.id ? `/(modals)/calm-corner/${activity.id}` : '/(modals)/calm-corner';
    case 'conversationCards':
      return '/(modals)/connect/conversation-cards';
    case 'parentLesson':
      return activity.id ? `/(modals)/connect/learn/${activity.id}` : '/(modals)/connect/audio-library';
    case 'dailyLog':
      return '/(modals)/log-event';
    case 'actCheckIn':
      return '/(modals)/act-check-in';
    default:
      return '/den';
  }
}

const THERAPIST_MODE_ON = `Therapist Mode is ON. When your response draws on one of the frameworks above (ACT, CBT, Behavioral Parent Training, PCIT, Triple P, motivational interviewing, emotion coaching), name which one in the "framework" field, in plain language a caregiver would recognize (e.g. "Behavioral Parent Training (Barkley)"), so they can gradually learn the ideas behind the advice. Leave it null if this reply isn't really drawing on any one framework.`;
const THERAPIST_MODE_OFF = `Therapist Mode is OFF. Leave the "framework" field null — don't name clinical frameworks in this response.`;
const ACTIVITY_INSTRUCTION = `Whenever you have a genuinely relevant next step available elsewhere in the app — a Calm Corner exercise, a Conversation Cards deck, a Parent Learning Series lesson, logging this in Daily Log, or (specifically when your "interventionType" is "actIntervention") the guided ACT Parenting Check-In — you may suggest exactly one via the "suggestedActivity" field, with a short reason. Only suggest one when it would actually help; leave it null otherwise. Never pad a response with an activity suggestion just to have one.`;

export const helpBotEngine: HelpBotEngine = {
  async generateResponse(userMessage, history, context) {
    const safety = assessSafety(userMessage);
    if (safety.isSafetyEvent) {
      const response = getSafetyResponse(safety.category);
      return {
        text: response.text,
        quickReplies: response.quickReplies,
        actions: [],
        isCrisisResponse: true,
        framework: null,
        interventionType: null,
        includeDisclaimer: false,
        safetyCategory: safety.category,
      };
    }

    const familyContext = buildFamilyContext({
      child: context.child,
      recentEvents: context.recentEvents,
      streak: context.streak,
      totalLogs: context.totalLogs,
      completedLessonTitles: context.completedLessonTitles,
      blueprintSummary: context.blueprintSummary,
    });

    const system = buildEnginePrompt({
      objective: "You're in an open-ended supportive coaching conversation with this caregiver via chat.",
      familyContext,
      includeDecisionLayer: true,
      includeDisclaimerField: true,
      recentSafetyEvent: context.recentSafetyEvent,
      extraInstructions: `${context.therapistMode ? THERAPIST_MODE_ON : THERAPIST_MODE_OFF}\n${ACTIVITY_INSTRUCTION}`,
    });

    const chatMessages = [
      ...history.map((m) => ({ role: m.role, content: m.text })),
      { role: 'user' as const, content: userMessage },
    ];

    try {
      const parsed = await runConversationTurn({
        feature: 'helpBot',
        system,
        messages: chatMessages,
        schema: helpBotResponseSchema,
        maxTokens: 1024,
      });

      const actions: HelpBotAction[] = parsed.suggestedActivity
        ? [{ label: parsed.suggestedActivity.label, href: activityHref(parsed.suggestedActivity) }]
        : [];

      return {
        text: parsed.reply,
        quickReplies: [],
        actions,
        isCrisisResponse: false,
        framework: parsed.framework,
        interventionType: parsed.interventionType,
        includeDisclaimer: parsed.includeDisclaimer,
        safetyCategory: 'none',
      };
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[helpBotEngine] generateResponse failed:', err);
      return {
        text: hasApiKey() ? FALLBACK_TEXT : NO_API_KEY_TEXT,
        quickReplies: [],
        actions: [],
        isCrisisResponse: false,
        framework: null,
        interventionType: null,
        includeDisclaimer: false,
        safetyCategory: 'none',
      };
    }
  },
};
