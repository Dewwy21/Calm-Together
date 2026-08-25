import React, { createContext, useContext } from 'react';
import { usePersonalizedLessonsState } from './usePersonalizedLessonsState';

type PersonalizedLessonsContextValue = ReturnType<typeof usePersonalizedLessonsState>;

const PersonalizedLessonsContext = createContext<PersonalizedLessonsContextValue | null>(null);

export function PersonalizedLessonsProvider({ children }: { children: React.ReactNode }) {
  const value = usePersonalizedLessonsState();
  return <PersonalizedLessonsContext.Provider value={value}>{children}</PersonalizedLessonsContext.Provider>;
}

export function usePersonalizedLessonsContext() {
  const ctx = useContext(PersonalizedLessonsContext);
  if (!ctx) throw new Error('usePersonalizedLessonsContext must be used within PersonalizedLessonsProvider');
  return ctx;
}
