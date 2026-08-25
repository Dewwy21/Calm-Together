import React, { createContext, useContext } from 'react';
import { useBaselineAssessmentState } from './useBaselineAssessmentState';

type BaselineAssessmentContextValue = ReturnType<typeof useBaselineAssessmentState>;

const BaselineAssessmentContext = createContext<BaselineAssessmentContextValue | null>(null);

export function BaselineAssessmentProvider({ children }: { children: React.ReactNode }) {
  const value = useBaselineAssessmentState();
  return <BaselineAssessmentContext.Provider value={value}>{children}</BaselineAssessmentContext.Provider>;
}

export function useBaselineAssessmentContext() {
  const ctx = useContext(BaselineAssessmentContext);
  if (!ctx) throw new Error('useBaselineAssessmentContext must be used within BaselineAssessmentProvider');
  return ctx;
}
