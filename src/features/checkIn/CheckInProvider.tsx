import React, { createContext, useContext } from 'react';
import { useCheckInState } from './useCheckInState';

type CheckInContextValue = ReturnType<typeof useCheckInState>;

const CheckInContext = createContext<CheckInContextValue | null>(null);

export function CheckInProvider({ children }: { children: React.ReactNode }) {
  const value = useCheckInState();
  return <CheckInContext.Provider value={value}>{children}</CheckInContext.Provider>;
}

export function useCheckInContext() {
  const ctx = useContext(CheckInContext);
  if (!ctx) throw new Error('useCheckInContext must be used within CheckInProvider');
  return ctx;
}
