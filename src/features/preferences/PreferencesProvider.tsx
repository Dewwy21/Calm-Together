import React, { createContext, useContext } from 'react';
import { usePreferencesState } from './usePreferencesState';

type PreferencesContextValue = ReturnType<typeof usePreferencesState>;

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const value = usePreferencesState();
  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferencesContext() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferencesContext must be used within PreferencesProvider');
  return ctx;
}
