import { useEffect, useMemo, useState } from 'react';
import { CourseProgressData, LessonProgress, loadCourseProgress, persistCourseProgress } from './courseProgressStorage';
import { computeStreak } from '../den/weekUtils';
import { CourseId } from './types';
import { getLessonsForCourse } from './courseData';

export function useCourseProgress() {
  const [data, setData] = useState<CourseProgressData>({ lessons: {} });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCourseProgress().then((stored) => {
      setData(stored);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      persistCourseProgress(data);
    }
  }, [data, loaded]);

  function getLessonProgress(lessonId: string): LessonProgress | undefined {
    return data.lessons[lessonId];
  }

  function getCardIndex(lessonId: string): number {
    return data.lessons[lessonId]?.cardIndex ?? 0;
  }

  function isLessonCompleted(lessonId: string): boolean {
    return !!data.lessons[lessonId]?.completed;
  }

  function setCardIndex(lessonId: string, cardIndex: number) {
    setData((prev) => ({
      lessons: {
        ...prev.lessons,
        [lessonId]: { ...prev.lessons[lessonId], lessonId, cardIndex, completed: prev.lessons[lessonId]?.completed ?? false },
      },
    }));
  }

  function completeLesson(lessonId: string) {
    setData((prev) => {
      if (prev.lessons[lessonId]?.completed) return prev;
      return {
        lessons: {
          ...prev.lessons,
          [lessonId]: {
            ...prev.lessons[lessonId],
            lessonId,
            cardIndex: prev.lessons[lessonId]?.cardIndex ?? 0,
            completed: true,
            completedAtISO: new Date().toISOString(),
          },
        },
      };
    });
  }

  function saveReflectionAnswer(lessonId: string, text: string) {
    setData((prev) => ({
      lessons: {
        ...prev.lessons,
        [lessonId]: {
          ...prev.lessons[lessonId],
          lessonId,
          cardIndex: prev.lessons[lessonId]?.cardIndex ?? 0,
          completed: prev.lessons[lessonId]?.completed ?? false,
          reflectionAnswer: text,
        },
      },
    }));
  }

  function courseStats(courseId: CourseId) {
    const lessons = getLessonsForCourse(courseId);
    const completed = lessons.filter((l) => data.lessons[l.id]?.completed).length;
    const total = lessons.length;
    return { completed, total, percent: total === 0 ? 0 : completed / total };
  }

  const completedDates = useMemo(
    () =>
      Object.values(data.lessons)
        .filter((l) => l.completed && l.completedAtISO)
        .map((l) => new Date(l.completedAtISO as string)),
    [data.lessons]
  );

  const streak = useMemo(() => computeStreak(completedDates), [completedDates]);
  const totalCompletedLessons = completedDates.length;

  return {
    loaded,
    getLessonProgress,
    getCardIndex,
    setCardIndex,
    isLessonCompleted,
    completeLesson,
    saveReflectionAnswer,
    courseStats,
    streak,
    totalCompletedLessons,
    completedDates,
  };
}
