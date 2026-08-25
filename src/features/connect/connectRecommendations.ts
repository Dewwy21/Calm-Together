import { LoggedEvent } from '../logEvent/types';
import { seededPick } from '../../utils/seededPick';
import { FAMILY_ACTIVITIES } from './familyActivitiesData';
import { RECHARGE_ACTIVITIES } from './rechargeData';
import { BUILT_IN_DECKS } from './conversationCardsData';
import { getParentLessonById } from './parentLearningData';

export interface ConnectSuggestion {
  kind: 'connect';
  category: 'family' | 'recharge';
  id: string;
  title: string;
  href: string;
}

export interface ParentLessonRecommendation {
  id: string;
  title: string;
  href: string;
}

export interface ConversationDeckRecommendation {
  id: string;
  title: string;
  href: string;
}

// Simplified heuristic for "reporting high stress multiple days in a row":
// 2 or more of the last 3 non-positive logs (regardless of exact type) came
// in at high intensity. Good enough for a mock signal without needing
// precise consecutive-calendar-day tracking.
export function hasRecentHighStress(pastEvents: LoggedEvent[], current: LoggedEvent): boolean {
  const recent = [...pastEvents.filter((e) => e.id !== current.id), current]
    .filter((e) => e.eventType !== 'positiveMoment')
    .sort((a, b) => b.occurredAtISO.localeCompare(a.occurredAtISO))
    .slice(0, 3);
  return recent.filter((e) => e.intensity >= 7).length >= 2;
}

// "Several positive family moments in a row": 2 or more of the last 5 logs
// (any type) were positive moments.
export function hasRecentPositiveStreak(pastEvents: LoggedEvent[], current: LoggedEvent): boolean {
  const recent = [...pastEvents.filter((e) => e.id !== current.id), current]
    .sort((a, b) => b.occurredAtISO.localeCompare(a.occurredAtISO))
    .slice(0, 5);
  return recent.filter((e) => e.eventType === 'positiveMoment').length >= 2;
}

export function suggestFamilyActivity(event: LoggedEvent): ConnectSuggestion {
  const activity = seededPick(FAMILY_ACTIVITIES, `${event.id}:family`);
  return { kind: 'connect', category: 'family', id: activity.id, title: activity.title, href: `/(modals)/connect/family/${activity.id}` };
}

export function suggestRechargeActivity(event: LoggedEvent): ConnectSuggestion {
  const activity = seededPick(RECHARGE_ACTIVITIES, `${event.id}:recharge`);
  return { kind: 'connect', category: 'recharge', id: activity.id, title: activity.title, href: `/(modals)/connect/recharge/${activity.id}` };
}

// Positive moments always point toward a Family Activity to build on the
// success; a recent run of high-intensity logs points toward Caregiver
// Recharge before anything else, taking priority over a Calm Corner
// suggestion. Otherwise there's no Connect-specific nudge for this log.
// (Used directly by the Connect tab's own bubble; resolveSuggestion in
// reflectionSuggestions.ts layers Parent Lesson / Conversation Deck
// alternatives on top of this for the reflection screen.)
export function suggestConnectActivity(event: LoggedEvent, pastEvents: LoggedEvent[]): ConnectSuggestion | null {
  if (event.eventType === 'positiveMoment') return suggestFamilyActivity(event);
  if (hasRecentHighStress(pastEvents, event)) return suggestRechargeActivity(event);
  return null;
}

const STRESS_LESSON_IDS = ['caregiver-burnout', 'emotional-regulation-parents', 'responding-not-reacting', 'reducing-shame-guilt'];

export function suggestParentLessonForStress(event: LoggedEvent): ParentLessonRecommendation {
  const lessonId = seededPick(STRESS_LESSON_IDS, `${event.id}:lesson`);
  const lesson = getParentLessonById(lessonId)!;
  return { id: lesson.id, title: lesson.title, href: `/(modals)/connect/learn/${lesson.id}` };
}

export function suggestConversationDeckForPositiveStreak(event: LoggedEvent): ConversationDeckRecommendation {
  const deck = seededPick(BUILT_IN_DECKS, `${event.id}:deck`);
  return { id: deck.id, title: deck.name, href: `/(modals)/connect/conversation-cards?deckId=${deck.id}` };
}
