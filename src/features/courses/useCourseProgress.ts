import { useEffect, useMemo, useState } from 'react';
import { useProfilesContext } from '../profiles/ProfilesProvider';
import { CourseProgressData, LessonProgress, loadCourseProgress, persistCourseProgress } from './courseProgressStorage';
import { computeStreak } from '../den/weekUtils';
import { CourseId } from './types';
import { getLessonsForCourse } from './courseData';

const EMPTY: CourseProgressData = { lessons: {} };

export function useCourseProgress() {
  const { currentChildId } = useProfilesContext();
  const [data, setData] = useState<CourseProgressData>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  // Read-only — writes happen explicitly inside each mutator below, scoped
  // to whichever child is current at call time. A reactive "persist
  // whenever `data` changes" effect used to live here too, but that's
  // exactly the pattern that raced against a child-switch load elsewhere
  // in this app (see useBaselineAssessmentState.ts's history) and silently
  // clobbered just-saved data — keeping storage writes to one path per
  // mutator removes the race.
  useEffect(() => {
    if (!currentChildId) return;
    setLoaded(false);
    loadCourseProgress(currentChildId).then((stored) => {
      setData(stored);
      setLoaded(true);
    });
  }, [currentChildId]);

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
    if (!currentChildId) return;
    const next: CourseProgressData = {
      lessons: {
        ...data.lessons,
        [lessonId]: { ...data.lessons[lessonId], lessonId, cardIndex, completed: data.lessons[lessonId]?.completed ?? false },
      },
    };
    setData(next);
    persistCourseProgress(currentChildId, next);
  }

  function completeLesson(lessonId: string) {
    if (!currentChildId) return;
    if (data.lessons[lessonId]?.completed) return;
    const next: CourseProgressData = {
      lessons: {
        ...data.lessons,
        [lessonId]: {
          ...data.lessons[lessonId],
          lessonId,
          cardIndex: data.lessons[lessonId]?.cardIndex ?? 0,
          completed: true,
          completedAtISO: new Date().toISOString(),
        },
      },
    };
    setData(next);
    persistCourseProgress(currentChildId, next);
  }

  function saveReflectionAnswer(lessonId: string, text: string) {
    if (!currentChildId) return;
    const next: CourseProgressData = {
      lessons: {
        ...data.lessons,
        [lessonId]: {
          ...data.lessons[lessonId],
          lessonId,
          cardIndex: data.lessons[lessonId]?.cardIndex ?? 0,
          completed: data.lessons[lessonId]?.completed ?? false,
          reflectionAnswer: text,
        },
      },
    };
    setData(next);
    persistCourseProgress(currentChildId, next);
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
