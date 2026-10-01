import { useState } from 'react';
import { useProfilesContext } from '../profiles/ProfilesProvider';
import { useCourseProgressContext } from './CourseProgressProvider';
import { createId } from '../logEvent/eventStorage';
import { loadLessonQuizAttempts, persistLessonQuizAttempts } from './lessonQuizStorage';
import { LessonQuiz, LessonQuizAttempt } from './quizTypes';

export type LessonQuizPhase = 'question' | 'results' | 'review';

// Drives one quiz end-to-end: question-by-question with per-option
// explanations, a results screen, an answer review, and saving the
// attempt to the child's historical record (see lessonQuizStorage.ts) —
// which is also what marks the underlying lesson complete, since for a
// lesson with a quiz, finishing the quiz *is* finishing the lesson.
export function useLessonQuizState(quiz: LessonQuiz, lessonId: string) {
  const { currentChildId } = useProfilesContext();
  const progress = useCourseProgressContext();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<LessonQuizPhase>('question');
  const [saved, setSaved] = useState(false);

  const question = quiz.questions[questionIndex];
  const selectedIndex = selections[question.id];
  const isLastQuestion = questionIndex === quiz.questions.length - 1;
  const correctCount = quiz.questions.filter((q) => selections[q.id] === q.correctIndex).length;

  function selectOption(optionIndex: number) {
    if (selectedIndex !== undefined) return; // already answered — options lock after the first pick
    setSelections((prev) => ({ ...prev, [question.id]: optionIndex }));
  }

  function goToNextQuestion() {
    if (isLastQuestion) {
      finishQuiz();
    } else {
      setQuestionIndex((i) => i + 1);
    }
  }

  function finishQuiz() {
    setPhase('results');
    if (saved || !currentChildId) return;
    setSaved(true);

    const answers = quiz.questions.map((q) => ({
      questionId: q.id,
      selectedIndex: selections[q.id],
      correct: selections[q.id] === q.correctIndex,
    }));
    const attempt: LessonQuizAttempt = {
      id: createId(),
      childId: currentChildId,
      lessonId,
      quizId: quiz.id,
      completedAtISO: new Date().toISOString(),
      answers,
      correctCount: answers.filter((a) => a.correct).length,
      totalQuestions: quiz.questions.length,
    };
    loadLessonQuizAttempts(currentChildId).then((existing) => {
      persistLessonQuizAttempts(currentChildId, [...existing, attempt]);
    });
    progress.completeLesson(lessonId);
  }

  return {
    phase,
    question,
    questionIndex,
    totalQuestions: quiz.questions.length,
    selectedIndex,
    selectOption,
    goToNextQuestion,
    correctCount,
    selections,
    goToReview: () => setPhase('review'),
    backToResults: () => setPhase('results'),
  };
}
