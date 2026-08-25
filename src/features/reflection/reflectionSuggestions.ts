// The reflection *messages* themselves are now real AI output (see
// src/features/ai/aiReflectionEngine.ts, run through the shared AI
// Conversation Engine). What's left here is the deterministic, non-AI
// logic the reflection screen still uses: which in-app activity to
// recommend next, and the screen's title.
import { LoggedEvent, EventType } from '../logEvent/types';
import { getExerciseById } from '../calmCorner/exerciseData';
import { seededPick } from '../../utils/seededPick';
import {
  suggestFamilyActivity,
  suggestRechargeActivity,
  suggestParentLessonForStress,
  suggestConversationDeckForPositiveStreak,
  hasRecentHighStress,
  hasRecentPositiveStreak,
  ConnectSuggestion,
} from '../connect/connectRecommendations';

export function suggestExerciseId(eventType: EventType): string | null {
  switch (eventType) {
    case 'meltdown':
      return 'box-breathing';
    case 'parentReaction':
      return 'self-compassion-break';
    case 'positiveMoment':
      return null;
  }
}

export interface CalmCornerSuggestion {
  kind: 'calmCorner';
  id: string;
  title: string;
  href: string;
}

export interface ParentLessonSuggestion {
  kind: 'parentLesson';
  id: string;
  title: string;
  href: string;
}

export interface ConversationDeckSuggestion {
  kind: 'conversationDeck';
  id: string;
  title: string;
  href: string;
}

export type Suggestion = ConnectSuggestion | CalmCornerSuggestion | ParentLessonSuggestion | ConversationDeckSuggestion;

// A positive moment points to a Family Activity, or — after a run of
// several recent positive moments — sometimes a Conversation Card deck
// instead, to build on the good streak in a different way. A stressful log
// (single high-intensity entry or a recent run of them) points to
// Caregiver Recharge, or sometimes a relevant Parent Learning Series
// lesson. Otherwise falls back to the existing Calm Corner exercise for
// meltdown/parentReaction. The two alternates are seeded per event so the
// same log always resolves to the same suggestion rather than flickering.
export function resolveSuggestion(event: LoggedEvent, pastEvents: LoggedEvent[]): Suggestion | null {
  if (event.eventType === 'positiveMoment') {
    if (hasRecentPositiveStreak(pastEvents, event) && seededPick(['deck', 'family'], `${event.id}:posAlt`) === 'deck') {
      const deck = suggestConversationDeckForPositiveStreak(event);
      return { kind: 'conversationDeck', ...deck };
    }
    return suggestFamilyActivity(event);
  }

  const isStressful = event.intensity >= 7 || hasRecentHighStress(pastEvents, event);
  if (isStressful) {
    if (seededPick(['lesson', 'recharge'], `${event.id}:stressAlt`) === 'lesson') {
      const lesson = suggestParentLessonForStress(event);
      return { kind: 'parentLesson', ...lesson };
    }
    return suggestRechargeActivity(event);
  }

  const exerciseId = suggestExerciseId(event.eventType);
  if (!exerciseId) return null;
  const exercise = getExerciseById(exerciseId);
  if (!exercise) return null;
  return { kind: 'calmCorner', id: exercise.id, title: exercise.title, href: `/(modals)/calm-corner/${exercise.id}` };
}

export function eventTypeReflectionTitle(eventType: EventType): string {
  switch (eventType) {
    case 'meltdown':
      return 'Reflecting on this moment';
    case 'parentReaction':
      return 'Reflecting on your reaction';
    case 'positiveMoment':
      return 'Celebrating this moment';
  }
}
