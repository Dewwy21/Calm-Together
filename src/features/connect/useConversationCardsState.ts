import { useEffect, useMemo, useState } from 'react';
import {
  ConversationQuestion,
  ConversationDeck,
  ConversationCategory,
  CONVERSATION_QUESTIONS,
  BUILT_IN_DECKS,
  shuffle,
} from './conversationCardsData';
import { ConversationCardsData, loadConversationCardsData, persistConversationCardsData } from './conversationCardsStorage';
import { createId } from '../logEvent/eventStorage';
import { useProfilesContext } from '../profiles/ProfilesProvider';

const EMPTY: ConversationCardsData = { customCards: [], favoriteIds: [], hiddenIds: [], recentlyUsed: [], customDecks: [] };
const MAX_RECENTS = 10;

export function useConversationCardsState() {
  const { currentChildId } = useProfilesContext();
  const [data, setData] = useState<ConversationCardsData>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!currentChildId) return;
    setLoaded(false);
    loadConversationCardsData(currentChildId).then((stored) => {
      setData(stored);
      setLoaded(true);
    });
  }, [currentChildId]);

  useEffect(() => {
    if (loaded && currentChildId) {
      persistConversationCardsData(currentChildId, data);
    }
  }, [data, loaded, currentChildId]);

  const allQuestionsById = useMemo(() => {
    const map = new Map<string, ConversationQuestion>();
    [...CONVERSATION_QUESTIONS, ...data.customCards].forEach((q) => map.set(q.id, q));
    return map;
  }, [data.customCards]);

  const visibleQuestions = useMemo(
    () => [...CONVERSATION_QUESTIONS, ...data.customCards].filter((q) => !data.hiddenIds.includes(q.id)),
    [data.customCards, data.hiddenIds]
  );

  const favoriteQuestions = useMemo(
    () => data.favoriteIds.map((id) => allQuestionsById.get(id)).filter((q): q is ConversationQuestion => !!q),
    [data.favoriteIds, allQuestionsById]
  );

  const recentlyUsedQuestions = useMemo(
    () => data.recentlyUsed.map((r) => allQuestionsById.get(r.id)).filter((q): q is ConversationQuestion => !!q),
    [data.recentlyUsed, allQuestionsById]
  );

  const hiddenQuestions = useMemo(
    () => [...CONVERSATION_QUESTIONS, ...data.customCards].filter((q) => data.hiddenIds.includes(q.id)),
    [data.customCards, data.hiddenIds]
  );

  const allDecks = useMemo(() => [...BUILT_IN_DECKS, ...data.customDecks], [data.customDecks]);

  function isFavorite(id: string) {
    return data.favoriteIds.includes(id);
  }

  function toggleFavorite(id: string) {
    setData((prev) => ({
      ...prev,
      favoriteIds: prev.favoriteIds.includes(id) ? prev.favoriteIds.filter((x) => x !== id) : [...prev.favoriteIds, id],
    }));
  }

  function isHidden(id: string) {
    return data.hiddenIds.includes(id);
  }

  function toggleHidden(id: string) {
    setData((prev) => ({
      ...prev,
      hiddenIds: prev.hiddenIds.includes(id) ? prev.hiddenIds.filter((x) => x !== id) : [...prev.hiddenIds, id],
    }));
  }

  function markUsed(id: string) {
    setData((prev) => {
      const withoutExisting = prev.recentlyUsed.filter((r) => r.id !== id);
      return { ...prev, recentlyUsed: [{ id, lastUsedISO: new Date().toISOString() }, ...withoutExisting].slice(0, MAX_RECENTS) };
    });
  }

  function addCustomCard(input: { text: string; category: ConversationCategory; note?: string }): ConversationQuestion {
    const card: ConversationQuestion = { id: createId(), ...input };
    setData((prev) => ({ ...prev, customCards: [...prev.customCards, card] }));
    return card;
  }

  function addDeck(input: { name: string; description: string; questionIds: string[] }): ConversationDeck {
    const deck: ConversationDeck = { id: createId(), ...input };
    setData((prev) => ({ ...prev, customDecks: [...prev.customDecks, deck] }));
    return deck;
  }

  function updateDeck(id: string, patch: Partial<Omit<ConversationDeck, 'id'>>) {
    setData((prev) => ({ ...prev, customDecks: prev.customDecks.map((d) => (d.id === id ? { ...d, ...patch } : d)) }));
  }

  function deleteDeck(id: string) {
    setData((prev) => ({ ...prev, customDecks: prev.customDecks.filter((d) => d.id !== id) }));
  }

  function pickSession(options?: { category?: ConversationCategory; deckId?: string }): ConversationQuestion[] {
    let pool = visibleQuestions;
    if (options?.deckId) {
      const deck = allDecks.find((d) => d.id === options.deckId);
      const ids = new Set(deck?.questionIds ?? []);
      pool = pool.filter((q) => ids.has(q.id));
    } else if (options?.category) {
      pool = pool.filter((q) => q.category === options.category);
    }

    // Prefer questions not shown in the last few sessions so "new set of 5"
    // actually feels new, rather than reshuffling the same small pool —
    // falling back to the full pool only if there aren't enough fresh ones.
    const recentIds = new Set(data.recentlyUsed.map((r) => r.id));
    const fresh = shuffle(pool.filter((q) => !recentIds.has(q.id))).slice(0, 5);
    if (fresh.length < 5) {
      const chosenIds = new Set(fresh.map((q) => q.id));
      const fillers = shuffle(pool.filter((q) => !chosenIds.has(q.id))).slice(0, 5 - fresh.length);
      return [...fresh, ...fillers];
    }
    return fresh;
  }

  return {
    visibleQuestions,
    favoriteQuestions,
    recentlyUsedQuestions,
    hiddenQuestions,
    allDecks,
    isFavorite,
    toggleFavorite,
    isHidden,
    toggleHidden,
    markUsed,
    addCustomCard,
    addDeck,
    updateDeck,
    deleteDeck,
    pickSession,
  };
}
