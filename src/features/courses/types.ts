import type { ComponentType } from 'react';
import { IconProps } from '../../components/icons';
import { LessonQuiz } from './quizTypes';

// The 6 ACT (Acceptance and Commitment Therapy) processes plus Choice Point
// — the 28-day program's 7 weekly topics (see coursePath.ts for how these
// become a single Day 1-28 sequence). 'personalized' is unrelated to the
// program — an AI-generated, on-demand library, unaffected by this
// structure — kept as its own course exactly as before.
export type CourseId =
  | 'presentMomentAwareness'
  | 'selfAsContext'
  | 'acceptance'
  | 'cognitiveDefusion'
  | 'values'
  | 'committedAction'
  | 'choicePoint'
  | 'personalized';

export interface Course {
  id: CourseId;
  title: string;
  subtitle: string;
  description: string;
  icon: ComponentType<IconProps>;
}

export type LessonCardKind =
  | 'intro'
  | 'concept'
  | 'example'
  | 'comparison'
  | 'timeline'
  | 'decisionTree'
  | 'stat'
  | 'quiz'
  | 'reflection'
  | 'exercise'
  | 'scenario'
  | 'sequence'
  | 'media';

interface LessonCardBase {
  id: string;
  kind: LessonCardKind;
}

/** Opening card of a lesson — the hook that frames why this matters. */
export interface IntroCard extends LessonCardBase {
  kind: 'intro';
  title: string;
  hook: string;
  icon: ComponentType<IconProps>;
}

/** A single core idea, explained briefly. */
export interface ConceptCard extends LessonCardBase {
  kind: 'concept';
  heading: string;
  body: string;
  icon: ComponentType<IconProps>;
}

/** A short, concrete real-world scenario illustrating the concept in action. */
export interface ExampleCard extends LessonCardBase {
  kind: 'example';
  heading: string;
  scenario: string;
  takeaway: string;
}

/** "Instead of X, try Y" style two-column comparison. */
export interface ComparisonCard extends LessonCardBase {
  kind: 'comparison';
  heading: string;
  leftLabel: string;
  leftItems: string[];
  rightLabel: string;
  rightItems: string[];
}

/** An ordered sequence of steps, shown as a connected timeline. */
export interface TimelineCard extends LessonCardBase {
  kind: 'timeline';
  heading: string;
  steps: string[];
}

/** A branching "if this, try that" decision guide. */
export interface DecisionTreeCard extends LessonCardBase {
  kind: 'decisionTree';
  heading: string;
  branches: { condition: string; action: string }[];
}

/** A single striking fact or figure, infographic-style. */
export interface StatCard extends LessonCardBase {
  kind: 'stat';
  heading: string;
  statText: string;
  detail: string;
  icon: ComponentType<IconProps>;
}

/** A small multiple-choice check for understanding. */
export interface QuizCard extends LessonCardBase {
  kind: 'quiz';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

/** An open reflection prompt; the caregiver's answer is saved locally. */
export interface ReflectionCard extends LessonCardBase {
  kind: 'reflection';
  prompt: string;
}

/** The closing "try this today" practical exercise. */
export interface ExerciseCard extends LessonCardBase {
  kind: 'exercise';
  title: string;
  instructions: string;
  relatedActivity?: { label: string; href: string };
}

/**
 * A "what would you do?" moment: one situation, several realistic
 * responses. Unlike QuizCard there's no single correct answer — each
 * option has its own feedback, and picking a different option just swaps
 * which feedback is shown rather than locking the card.
 */
export interface ScenarioCard extends LessonCardBase {
  kind: 'scenario';
  heading: string;
  situation: string;
  options: { text: string; feedback: string }[];
}

/**
 * A tap-to-order activity — the practical, dependency-free substitute for
 * drag-and-drop (no native reorder/gesture library is in this project).
 * `items` is authored in the correct order; the UI shuffles it for
 * display and the caregiver taps items into the order they believe is
 * right.
 */
export interface SequenceCard extends LessonCardBase {
  kind: 'sequence';
  heading: string;
  instructions?: string;
  items: string[];
}

/**
 * A video or audio moment in a lesson. `sourceUrl` is intentionally
 * nullable — author the card with `sourceUrl: null` as a placeholder
 * before the real media exists, and it renders a clear "media coming
 * soon" state instead of a broken player. Fill it in later (a YouTube
 * link/ID, or a direct file URL from any external host) without touching
 * anything else about the lesson. See mediaSources.ts for exactly what
 * `sourceUrl` accepts for each `mediaType`, and courseData.ts's top
 * comment for a copy-paste example.
 */
export interface MediaCard extends LessonCardBase {
  kind: 'media';
  mediaType: 'video' | 'audio';
  title: string;
  sourceUrl: string | null;
  caption?: string;
}

export type LessonCard =
  | IntroCard
  | ConceptCard
  | ExampleCard
  | ComparisonCard
  | TimelineCard
  | DecisionTreeCard
  | StatCard
  | QuizCard
  | ReflectionCard
  | ExerciseCard
  | ScenarioCard
  | SequenceCard
  | MediaCard;

// --- Content-authoring contract -------------------------------------------
// A course is just `Course` + `Lesson[]` of plain typed data (see
// courseData.ts) — there is no hardcoded UI logic tied to any specific
// course or lesson. Replacing or expanding a course's content later (e.g.
// once real evidence-based source material is available) means authoring a
// new `Lesson[]` array via `buildLesson()` (lessonHelpers.ts) and nothing
// else: the AI Conversation Engine's in-lesson chat (lessonChatEngine.ts)
// always serializes whatever `Lesson` is actually live, so new content is
// automatically what the AI references — no prompt changes needed.
//
// One caveat when editing an already-shipped lesson: `buildLesson()`
// derives each card's `id` as `${lessonId}-${index}`, so changing card
// order/count shifts ids. Nothing persists per-card except the
// lesson-keyed `reflectionAnswer` (unaffected), but a caregiver's saved
// resume position (`cardIndex`) could land on a different card after an
// edit — this self-corrects the next time they finish or restart the
// lesson, and isn't worth migration logic for.
export interface Lesson {
  id: string;
  courseId: CourseId;
  title: string;
  summary: string;
  estimatedMinutes: number;
  icon: ComponentType<IconProps>;
  cards: LessonCard[];
  /** Optional citation to the source material this lesson was built from, shown subtly in the lesson player when present. */
  sourceRef?: string;
  /** Optional "Check Your Understanding" quiz — see quizTypes.ts. When present, the lesson player shows it automatically once the caregiver reaches the end of the lesson's cards, in place of "Finish Lesson". */
  quiz?: LessonQuiz;
}
