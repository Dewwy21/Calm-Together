import { useEffect, useMemo, useState } from 'react';
import {
  PersonalizedLessonsData,
  loadPersonalizedLessonsData,
  persistPersonalizedLessonsData,
} from './personalizedLessonsStorage';
import { hydrateLesson, dehydrateLesson } from './hydrate';
import { PersonalizedLesson } from './types';

export function usePersonalizedLessonsState() {
  const [data, setData] = useState<PersonalizedLessonsData>({ lessons: [], dismissedSuggestionTopics: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadPersonalizedLessonsData().then((stored) => {
      setData(stored);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      persistPersonalizedLessonsData(data);
    }
  }, [data, loaded]);

  const lessons = useMemo(
    () => [...data.lessons].reverse().map(hydrateLesson),
    [data.lessons]
  );

  function getById(lessonId: string): PersonalizedLesson | undefined {
    return lessons.find((l) => l.id === lessonId);
  }

  function addLesson(lesson: PersonalizedLesson) {
    setData((prev) => ({ ...prev, lessons: [...prev.lessons, dehydrateLesson(lesson)] }));
  }

  function removeLesson(lessonId: string) {
    setData((prev) => ({ ...prev, lessons: prev.lessons.filter((l) => l.id !== lessonId) }));
  }

  function dismissSuggestionTopic(topic: string) {
    setData((prev) =>
      prev.dismissedSuggestionTopics.includes(topic)
        ? prev
        : { ...prev, dismissedSuggestionTopics: [...prev.dismissedSuggestionTopics, topic] }
    );
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
