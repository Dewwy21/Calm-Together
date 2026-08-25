import { LoggedEvent, EVENT_TYPE_OPTIONS } from '../logEvent/types';
import { firstSentence } from '../logEvent/textUtils';
import { getSubtypeLabel } from '../logEvent/subtypeOptions';
import { HelpBotMessage } from '../helpBot/types';
import { DetectedPattern } from '../patterns/types';

export interface DailyLogSourceOption {
  eventId: string;
  label: string;
  preview: string;
}

export function listDailyLogSourceOptions(events: LoggedEvent[], limit = 20): DailyLogSourceOption[] {
  const sorted = [...events].sort((a, b) => b.occurredAtISO.localeCompare(a.occurredAtISO)).slice(0, limit);
  return sorted.map((e) => {
    const option = EVENT_TYPE_OPTIONS.find((o) => o.type === e.eventType);
    const date = new Date(e.occurredAtISO);
    const dateLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const timeLabel = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
    const subtypeLabel = getSubtypeLabel(e.eventType, e.subtype);
    return {
      eventId: e.id,
      label: `${option?.label ?? e.eventType}${subtypeLabel ? ` · ${subtypeLabel}` : ''} · ${dateLabel}, ${timeLabel}`,
      preview: firstSentence(e.whatHappened, 90) || 'No description added.',
    };
  });
}

export function buildDailyLogSituationDescription(event: LoggedEvent): string {
  const lines = [
    'Source: a Daily Log entry the caregiver saved.',
    `Type of moment: ${event.eventType}${event.subtype ? ` (${getSubtypeLabel(event.eventType, event.subtype)})` : ''}`,
    `Intensity: ${event.intensity}/10`,
    `What happened: ${event.whatHappened}`,
  ];
  if (event.before) lines.push(`Right before: ${event.before}`);
  if (event.after) lines.push(`Right after: ${event.after}`);
  if (event.consequences) lines.push(`What happened next: ${event.consequences}`);
  lines.push('Build the mini-course around this exact situation.');
  return lines.join('\n');
}

export interface HelpBotConversationOption {
  dateKey: string;
  label: string;
  preview: string;
  messages: HelpBotMessage[];
}

function dayKey(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

// There's no explicit "session" boundary in the stored message history —
// grouping by calendar day is the simplest honest stand-in for "which
// conversation" the caregiver means to pick.
export function groupHelpBotConversationsByDay(messages: HelpBotMessage[], limit = 15): HelpBotConversationOption[] {
  const byDay = new Map<string, HelpBotMessage[]>();
  messages.forEach((m) => {
    const key = dayKey(m.createdAtISO);
    if (!byDay.has(key)) byDay.set(key, []);
    byDay.get(key)!.push(m);
  });

  const entries = Array.from(byDay.entries()).sort((a, b) => b[0].localeCompare(a[0]));

  return entries.slice(0, limit).map(([key, msgs]) => {
    const date = new Date(key);
    const dateLabel = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const firstUserMessage = msgs.find((m) => m.role === 'user');
    return {
      dateKey: key,
      label: `${dateLabel} — ${msgs.length} message${msgs.length === 1 ? '' : 's'}`,
      preview: firstUserMessage ? firstSentence(firstUserMessage.text, 90) : 'Conversation with Help Bot',
      messages: msgs,
    };
  });
}

export function buildHelpBotSituationDescription(conversation: HelpBotConversationOption): string {
  const transcript = conversation.messages.map((m) => `${m.role === 'user' ? 'Caregiver' : 'Help Bot'}: ${m.text}`).join('\n');
  return `Source: a Help Bot conversation the caregiver had.\n\nTranscript:\n${transcript}\n\nBuild the mini-course around the situation this conversation was actually about.`;
}

export function buildPatternSituationDescription(pattern: DetectedPattern): string {
  return `Source: a recurring pattern detected in this family's own Daily Log data.\n\nPattern: ${pattern.title}\nWhat the data shows: ${pattern.summary}\n\nBuild the mini-course around this recurring situation.`;
}

// Used when a caregiver jumps straight from a suggestion (e.g. on the
// Patterns screen) with only the suggested topic string in hand, not the
// full DetectedPattern object.
export function buildPatternTopicSituationDescription(topic: string): string {
  return `Source: a recurring pattern noticed in this family's own Daily Log data.\n\nPattern topic: ${topic}\n\nBuild the mini-course around this recurring situation.`;
}

export function buildManualTopicSituationDescription(topic: string): string {
  return `Source: a topic the caregiver typed in themselves.\n\nTopic: ${topic}\n\nBuild the mini-course around this topic, tailored to this family's actual situation using what you know about them.`;
}
