import { useEffect, useMemo, useState } from 'react';
import { useProfilesContext } from '../profiles/ProfilesProvider';
import {
  PersonalizedLessonsData,
  loadPersonalizedLessonsData,
  persistPersonalizedLessonsData,
} from './personalizedLessonsStorage';
import { hydrateLesson, dehydrateLesson } from './hydrate';
import { PersonalizedLesson } from './types';

const EMPTY: PersonalizedLessonsData = { lessons: [], dismissedSuggestionTopics: [] };

export function usePersonalizedLessonsState() {
  const { currentChildId } = useProfilesContext();
  const [data, setData] = useState<PersonalizedLessonsData>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  // Read-only — writes happen explicitly inside each mutator below, scoped
  // to whichever child is current at call time (see courseProgress's
  // useCourseProgress.ts for why this replaced a reactive persist effect).
  useEffect(() => {
    if (!currentChildId) return;
    setLoaded(false);
    loadPersonalizedLessonsData(currentChildId).then((stored) => {
      setData(stored);
      setLoaded(true);
    });
  }, [currentChildId]);

  const lessons = useMemo(
    () => [...data.lessons].reverse().map(hydrateLesson),
    [data.lessons]
  );

  function getById(lessonId: string): PersonalizedLesson | undefined {
    return lessons.find((l) => l.id === lessonId);
  }

  function addLesson(lesson: PersonalizedLesson) {
    if (!currentChildId) return;
    const next: PersonalizedLessonsData = { ...data, lessons: [...data.lessons, dehydrateLesson(lesson)] };
    setData(next);
    persistPersonalizedLessonsData(currentChildId, next);
  }

  function removeLesson(lessonId: string) {
    if (!currentChildId) return;
    const next: PersonalizedLessonsData = { ...data, lessons: data.lessons.filter((l) => l.id !== lessonId) };
    setData(next);
    persistPersonalizedLessonsData(currentChildId, next);
  }

  function dismissSuggestionTopic(topic: string) {
    if (!currentChildId) return;
    if (data.dismissedSuggestionTopics.includes(topic)) return;
    const next: PersonalizedLessonsData = { ...data, dismissedSuggestionTopics: [...data.dismissedSuggestionTopics, topic] };
    setData(next);
    persistPersonalizedLessonsData(currentChildId, next);
  }

  return {
    loaded,
    lessons,
    getById,
    addLesson,
    removeLesson,
    dismissedSuggestionTopics: data.dismissedSuggestionTopics,
    dismissSuggestionTopic,
  };
}
