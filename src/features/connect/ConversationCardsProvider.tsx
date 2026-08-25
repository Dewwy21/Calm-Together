import React, { createContext, useContext } from 'react';
import { useConversationCardsState } from './useConversationCardsState';

type ConversationCardsContextValue = ReturnType<typeof useConversationCardsState>;

const ConversationCardsContext = createContext<ConversationCardsContextValue | null>(null);

export function ConversationCardsProvider({ children }: { children: React.ReactNode }) {
  const value = useConversationCardsState();
  return <ConversationCardsContext.Provider value={value}>{children}</ConversationCardsContext.Provider>;
}

export function useConversationCardsContext() {
  const ctx = useContext(ConversationCardsContext);
  if (!ctx) throw new Error('useConversationCardsContext must be used within ConversationCardsProvider');
  return ctx;
}
