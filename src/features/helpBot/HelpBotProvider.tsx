import React, { createContext, useContext } from 'react';
import { useHelpBotState } from './useHelpBotState';

type HelpBotContextValue = ReturnType<typeof useHelpBotState>;

const HelpBotContext = createContext<HelpBotContextValue | null>(null);

export function HelpBotProvider({ children }: { children: React.ReactNode }) {
  const value = useHelpBotState();
  return <HelpBotContext.Provider value={value}>{children}</HelpBotContext.Provider>;
}

export function useHelpBotContext() {
  const ctx = useContext(HelpBotContext);
  if (!ctx) throw new Error('useHelpBotContext must be used within HelpBotProvider');
  return ctx;
}
