export type OnboardingQuestionType = 'single' | 'multi' | 'shortText' | 'longText';

export interface OnboardingOption {
  value: string;
  label: string;
}

export interface OnboardingFollowUpText {
  placeholder: string;
  helperText: string;
}

export interface OnboardingQuestion {
  id: string;
  type: OnboardingQuestionType;
  prompt: string;
  helperText?: string;
  /** Required for 'single'/'multi', unused for 'shortText'/'longText'. */
  options: OnboardingOption[];
  allowOther?: boolean;
  /** an always-visible optional free-text field beneath the options, for the rare case a bit more detail genuinely helps */
  followUpText?: OnboardingFollowUpText;
  /** 'multi' only — caps how many options can be selected at once (e.g. "select up to 3"). */
  maxSelections?: number;
  /** placeholder for 'shortText'/'longText' questions. */
  placeholder?: string;
  /**
   * Inert metadata carried over from the Baseline Assessment's source
   * document scoring notes — not read or acted on anywhere in this version.
   * Exists so a future scoring feature doesn't have to re-derive reverse
   * scoring from the source document again. Do not compute or display
   * anything from this now.
   */
  reverseScored?: boolean;
}

export interface OnboardingSection {
  id: string;
  sectionNumber: number;
  totalSections: number;
  title: string;
  /** Section-level instructions/context shown once, before its questions. Real content from the source document — never invented. */
  intro?: string;
  /** Citation/attribution line, present only for sections that have one in the source document. */
  sourceAttribution?: string;
  questionIds: string[];
}

// A flat bag: `${questionId}` -> selected value(s), `${questionId}__other`
// -> free text if "Other" was picked, `${questionId}__note` -> a follow-up
// text answer.
export type OnboardingAnswers = Record<string, string | string[] | undefined>;

export type OnboardingStatus = 'not_started' | 'skipped' | 'completed';
