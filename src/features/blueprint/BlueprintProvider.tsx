import React, { createContext, useContext } from 'react';
import { useBlueprintState } from './useBlueprintState';

type BlueprintContextValue = ReturnType<typeof useBlueprintState>;

const BlueprintContext = createContext<BlueprintContextValue | null>(null);

export function BlueprintProvider({ children }: { children: React.ReactNode }) {
  const value = useBlueprintState();
  return <BlueprintContext.Provider value={value}>{children}</BlueprintContext.Provider>;
}

export function useBlueprintContext() {
  const ctx = useContext(BlueprintContext);
  if (!ctx) throw new Error('useBlueprintContext must be used within BlueprintProvider');
  return ctx;
}
