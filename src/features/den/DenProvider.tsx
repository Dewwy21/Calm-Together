import React, { createContext, useContext } from 'react';
import { useDenState } from './useDenState';

type DenContextValue = ReturnType<typeof useDenState>;

const DenContext = createContext<DenContextValue | null>(null);

// Lifted above (tabs) and (modals) so the Reframe Replay modal can log a
// note into the same state the Den tab reads — the seam that would become
// a real backend/zustand store once this moves past local-only state.
export function DenProvider({ children }: { children: React.ReactNode }) {
  const value = useDenState();
  return <DenContext.Provider value={value}>{children}</DenContext.Provider>;
}

export function useDenContext() {
  const ctx = useContext(DenContext);
  if (!ctx) throw new Error('useDenContext must be used within DenProvider');
  return ctx;
}
