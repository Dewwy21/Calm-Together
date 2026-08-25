import type { ComponentType } from 'react';
import { IconProps } from '../../components/icons';

// The 7 ACT processes the caregiver moves through inside one scenario,
// plus "Situation Selection" as the entry point before a scenario begins.
// Matches the ACT Parenting Check-In prototype document exactly.
export type ActStepId =
  | 'acceptance'
  | 'cognitiveDefusion'
  | 'presentMomentAwareness'
  | 'selfAsContext'
  | 'values'
  | 'committedAction'
  | 'lookingBack';

export const ACT_STEP_LABELS: Record<ActStepId, string> = {
  acceptance: 'Acceptance',
  cognitiveDefusion: 'Cognitive Defusion',
  presentMomentAwareness: 'Present-Moment Awareness',
  selfAsContext: 'Self-as-Context',
  values: 'Values',
  committedAction: 'Committed Action',
  lookingBack: 'Looking Back & Moving Forward',
};

export const ACT_STEP_ORDER: ActStepId[] = [
  'acceptance',
  'cognitiveDefusion',
  'presentMomentAwareness',
  'selfAsContext',
  'values',
  'committedAction',
  'lookingBack',
];

// One of the 10 parenting-challenge categories from the prototype's
// Situation Selection menu. Every field is verbatim from the source
// document. Categories without a scenario yet (see ACT_SCENARIOS) still
// display here, honestly marked as not yet available.
export interface ActCategory {
  id: string;
  order: number;
  title: string;
  /** Not every category has one in the source document (category 10 doesn't) — never invented when absent. */
  tagline?: string;
  typicalScenarios: string[];
  commonParentThoughts: string[];
  icon: ComponentType<IconProps>;
}

interface ActBeatBase {
  id: string;
  step: ActStepId;
}

/** The ACT coach speaking — no choice to make, just read and continue. */
export interface ActNarrativeBeat extends ActBeatBase {
  kind: 'narrative';
  text: string;
}

/** The "what I can observe" vs. "what my mind is adding" side-by-side from Present-Moment Awareness. */
export interface ActReflectionListBeat extends ActBeatBase {
  kind: 'reflectionList';
  lists: { heading: string; items: string[] }[];
}

/** A guided multiple-choice moment. Options are shown exactly as written; the coach's next beat does not change based on which one is picked (see actContent.ts for why). */
export interface ActQuestionBeat extends ActBeatBase {
  kind: 'question';
  prompt: string;
  options: string[];
}

export type ActBeat = ActNarrativeBeat | ActReflectionListBeat | ActQuestionBeat;

// One fully scripted ACT coaching conversation, tied to a category. This is
// the unit the framework is designed to add more of later — a new
// scenario is just a new ActScenario entry with its own situationText and
// beats; nothing about the player screen, engine, or Blueprint wiring
// needs to change.
export interface ActScenario {
  id: string;
  categoryId: string;
  title: string;
  situationText: string;
  beats: ActBeat[];
}

export interface ActAnswerRecord {
  beatId: string;
  step: ActStepId;
  prompt: string;
  chosenOption: string;
  note?: string;
  aiReply?: string;
}

export interface ActSessionRecord {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  categoryTitle: string;
  startedAtISO: string;
  completedAtISO: string;
  answers: ActAnswerRecord[];
}
