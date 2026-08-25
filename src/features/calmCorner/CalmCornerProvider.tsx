import React, { createContext, useContext } from 'react';
import { useCalmCornerState } from './useCalmCornerState';

type CalmCornerContextValue = ReturnType<typeof useCalmCornerState>;

const CalmCornerContext = createContext<CalmCornerContextValue | null>(null);

export function CalmCornerProvider({ children }: { children: React.ReactNode }) {
  const value = useCalmCornerState();
  return <CalmCornerContext.Provider value={value}>{children}</CalmCornerContext.Provider>;
}

export function useCalmCornerContext() {
  const ctx = useContext(CalmCornerContext);
  if (!ctx) throw new Error('useCalmCornerContext must be used within CalmCornerProvider');
  return ctx;
}
