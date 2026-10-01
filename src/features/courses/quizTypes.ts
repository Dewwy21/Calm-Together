// A dedicated post-lesson quiz — richer than the single-question `quiz`
// LessonCard (one shared explanation, embedded in the card carousel):
// multi-question, one explanation PER ANSWER CHOICE (matching source
// documents that explain why each wrong option is wrong, not just why the
// right one is right), its own results/review screen, and a saved,
// datable attempt. Attach one to any lesson via `Lesson.quiz` — the
// player shows it automatically once the caregiver reaches the end of the
// lesson's cards, in place of the normal "Finish Lesson" action.
export interface LessonQuizOption {
  text: string;
  /** Shown immediately after this option is picked, whether it's the correct one or not — verbatim from the source content, not a single generic explanation. */
  explanation: string;
}

export interface LessonQuizQuestion {
  id: string;
  question: string;
  options: LessonQuizOption[];
  correctIndex: number;
}

export interface LessonQuiz {
  id: string;
  title: string;
  questions: LessonQuizQuestion[];
}

export interface LessonQuizAnswer {
  questionId: string;
  selectedIndex: number;
  correct: boolean;
}

// One saved attempt — see lessonQuizStorage.ts. Every attempt is kept
// (never overwritten), same as every other historical record in the app.
export interface LessonQuizAttempt {
  id: string;
  childId: string;
  lessonId: string;
  quizId: string;
  completedAtISO: string;
  answers: LessonQuizAnswer[];
  correctCount: number;
  totalQuestions: number;
}
