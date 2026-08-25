import React, { createContext, useContext } from 'react';
import { useCourseProgress } from './useCourseProgress';

type CourseProgressContextValue = ReturnType<typeof useCourseProgress>;

const CourseProgressContext = createContext<CourseProgressContextValue | null>(null);

export function CourseProgressProvider({ children }: { children: React.ReactNode }) {
  const value = useCourseProgress();
  return <CourseProgressContext.Provider value={value}>{children}</CourseProgressContext.Provider>;
}

export function useCourseProgressContext() {
  const ctx = useContext(CourseProgressContext);
  if (!ctx) throw new Error('useCourseProgressContext must be used within CourseProgressProvider');
  return ctx;
}
