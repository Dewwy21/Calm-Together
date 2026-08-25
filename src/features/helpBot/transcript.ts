import { HelpBotConversation } from './types';

// Plain-text rendering used by "Copy Chat" — a caregiver can paste this into
// a message to a partner or therapist. Deliberately not stored anywhere;
// it's built fresh each time the action is used.
export function formatConversationTranscript(conversation: HelpBotConversation): string {
  const lines = conversation.messages.map((m) => `${m.role === 'assistant' ? 'Help Bot' : 'You'}: ${m.text}`);
  return [conversation.title, '', ...lines].join('\n');
}
