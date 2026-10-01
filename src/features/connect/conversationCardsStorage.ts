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

// Was a single global key (no childId) — meaning custom cards, favorites,
// hidden cards, and custom decks were shared by every account and every
// child on the device, so a brand-new account/child inherited another
// account's content. Migrates any data found under the old key onto the
// requesting child's own key, once, the first time it's asked for. See
// calmCornerStorage.ts's loadCalmCornerData for the same pattern.
export async function loadConversationCardsData(childId: string): Promise<ConversationCardsData> {
  try {
    const scopedKey = `${STORAGE_KEY}/${childId}`;
    const raw = await AsyncStorage.getItem(scopedKey);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) } as ConversationCardsData;

    const legacy = await AsyncStorage.getItem(STORAGE_KEY);
    if (legacy) {
      await AsyncStorage.setItem(scopedKey, legacy);
      await AsyncStorage.removeItem(STORAGE_KEY);
      return { ...EMPTY, ...JSON.parse(legacy) } as ConversationCardsData;
    }

    return EMPTY;
  } catch {
    return EMPTY;
  }
}

export async function persistConversationCardsData(childId: string, data: ConversationCardsData): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STORAGE_KEY}/${childId}`, JSON.stringify(data));
  } catch {
    // best-effort local persistence only
  }
}
