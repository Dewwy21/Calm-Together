import AsyncStorage from '@react-native-async-storage/async-storage';
import { HelpBotConversation, HelpBotMessage } from './types';
import { deriveConversationTitle } from './conversationTitle';

// Conversations persist locally, scoped per child, same as the rest of
// Daily Log/Help Bot data. A future upgrade (server-synced history) would
// replace this file's internals without touching useHelpBotState.ts.
const STORAGE_KEY = 'otter-companion/help-bot-conversations';
const LEGACY_SINGLE_THREAD_KEY = 'otter-companion/help-bot-messages';
const MAX_MESSAGES_PER_CONVERSATION = 50;
const MAX_CONVERSATIONS = 200;

export async function loadHelpBotConversations(childId: string): Promise<HelpBotConversation[]> {
  try {
    const raw = await AsyncStorage.getItem(`${STORAGE_KEY}/${childId}`);
    if (raw) return JSON.parse(raw) as HelpBotConversation[];
  } catch {
    return [];
  }

  // One-time migration: earlier versions of Help Bot kept a single
  // continuous message thread per child. If that's all that exists, wrap
  // it into the first conversation rather than losing that history.
  try {
    const legacyRaw = await AsyncStorage.getItem(`${LEGACY_SINGLE_THREAD_KEY}/${childId}`);
    if (!legacyRaw) return [];
    const legacyMessages = JSON.parse(legacyRaw) as HelpBotMessage[];
    if (legacyMessages.length === 0) return [];

    const firstUserMessage = legacyMessages.find((m) => m.role === 'user');
    const migrated: HelpBotConversation = {
      id: 'migrated-conversation',
      title: firstUserMessage ? deriveConversationTitle(firstUserMessage.text) : 'New Conversation',
      messages: legacyMessages,
      createdAtISO: legacyMessages[0].createdAtISO,
      updatedAtISO: legacyMessages[legacyMessages.length - 1].createdAtISO,
      archived: false,
    };
    await persistHelpBotConversations(childId, [migrated]);
    await AsyncStorage.removeItem(`${LEGACY_SINGLE_THREAD_KEY}/${childId}`);
    return [migrated];
  } catch {
    return [];
  }
}

// Flattened view across every conversation (active and archived), oldest
// first — for features that reason about the caregiver's overall Help Bot
// usage (Growth Timeline, personalized-lesson sourcing) rather than any one
// thread.
export async function loadAllHelpBotMessages(childId: string): Promise<HelpBotMessage[]> {
  const conversations = await loadHelpBotConversations(childId);
  return conversations
    .flatMap((c) => c.messages)
    .sort((a, b) => a.createdAtISO.localeCompare(b.createdAtISO));
}

export async function persistHelpBotConversations(childId: string, conversations: HelpBotConversation[]): Promise<void> {
  try {
    const trimmed = conversations
      .slice(-MAX_CONVERSATIONS)
      .map((c) => ({ ...c, messages: c.messages.slice(-MAX_MESSAGES_PER_CONVERSATION) }));
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, JSON.stringify(trimmed));
  } catch {
    // best-effort local persistence only
  }
}
