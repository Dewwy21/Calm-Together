import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConversationQuestion, ConversationDeck } from './conversationCardsData';

export interface RecentUse {
  id: string;
  lastUsedISO: string;
}

export interface ConversationCardsData {
  customCards: ConversationQuestion[];
  favoriteIds: string[];
  hiddenIds: string[];
  recentlyUsed: RecentUse[];
  customDecks: ConversationDeck[];
}

const STORAGE_KEY = 'otter-companion/conversation-cards';
const EMPTY: ConversationCardsData = { customCards: [], favoriteIds: [], hiddenIds: [], recentlyUsed: [], customDecks: [] };

export async function loadConversationCardsData(): Promise<ConversationCardsData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    return { ...EMPTY, ...JSON.parse(raw) } as ConversationCardsData;
  } catch {
    return EMPTY;
  }
}

export async function persistConversationCardsData(data: ConversationCardsData): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // best-effort local persistence only
  }
}
