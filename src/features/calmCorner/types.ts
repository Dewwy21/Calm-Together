export type ExerciseStepType = 'instruction' | 'timer';

export interface ExerciseStep {
  type: ExerciseStepType;
  instruction: string;
  /** seconds to count down, only present for timer steps */
  durationSeconds?: number;
}

export interface Exercise {
  id: string;
  title: string;
  /** one sentence, shown on the library card */
  description: string;
  estimatedMinutes: number;
  steps: ExerciseStep[];
  /** require()'d calming photograph shown on the card and runner header */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
}
