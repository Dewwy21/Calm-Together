import { EventType } from './types';

export interface QuestionConfig {
  key:
    | 'whatHappened'
    | 'before'
    | 'after'
    | 'location'
    | 'whoPresent'
    | 'consequences'
    | 'additionalNotes'
    | 'meaningfulMoment'
    | 'childStrength'
    | 'caregiverContribution'
    | 'feelingReflection'
    | 'memorableDetail'
    | 'repeatStrategy';
  title: string;
  placeholder: string;
  /** whether this field participates in the Save-button gating */
  requiredForSave?: boolean;
}

// Child Meltdown / Parent Emotional Reaction flow — reconstructs what
// happened so a caregiver (and the AI) can analyze and learn from it.
export const CHALLENGE_QUESTION_STEPS: QuestionConfig[] = [
  {
    key: 'whatHappened',
    title: 'What happened?',
    placeholder: 'e.g. He threw his toy across the room and started crying when I said it was time to clean up.',
    requiredForSave: true,
  },
  {
    key: 'before',
    title: 'What happened immediately before?',
    placeholder: 'e.g. I asked him to turn off the TV and get ready for dinner.',
  },
  {
    key: 'after',
    title: 'What happened after the event ended?',
    placeholder: 'e.g. He calmed down after about 10 minutes and apologized on his own.',
  },
  {
    key: 'location',
    title: 'Where did this happen?',
    placeholder: 'e.g. In the living room, right before dinner.',
  },
  {
    key: 'whoPresent',
    title: 'Who else was present?',
    placeholder: 'e.g. Just the two of us, his sister was upstairs.',
  },
  {
    key: 'consequences',
    title: 'Were there any consequences afterward?',
    placeholder: 'e.g. We talked about it calmly once he was ready, no screen time after dinner.',
  },
  {
    key: 'additionalNotes',
    title: 'Anything else you would like to remember?',
    placeholder: 'e.g. This felt different from usual, he seemed more tired than upset.',
  },
];

// Positive Moment flow — deliberately not a smaller version of the
// challenge flow above. There's no "before/after/consequences" here because
// a positive moment isn't a problem to reconstruct; these prompts focus on
// reinforcing strengths, gratitude, and what made the moment work, so
// caregivers (and the AI reflection built from these answers) build on what
// went right instead of analyzing it like an incident.
export const POSITIVE_QUESTION_STEPS: QuestionConfig[] = [
  {
    key: 'meaningfulMoment',
    title: 'What made this moment meaningful?',
    placeholder: 'e.g. She surprised her little brother by including him in her game without being asked.',
    requiredForSave: true,
  },
  {
    key: 'childStrength',
    title: 'What did your child do well?',
    placeholder: "e.g. He stayed patient even when the game didn't go his way.",
  },
  {
    key: 'caregiverContribution',
    title: 'What did you do that helped create this moment?',
    placeholder: 'e.g. I gave him extra time to finish before asking him to transition.',
  },
  {
    key: 'feelingReflection',
    title: 'How did this make you feel?',
    placeholder: 'e.g. Proud, and a little surprised at how smoothly it went.',
  },
  {
    key: 'memorableDetail',
    title: 'What would you like to remember about today?',
    placeholder: 'e.g. The way she laughed when we finished building the fort together.',
  },
  {
    key: 'repeatStrategy',
    title: 'How could you create more moments like this?',
    placeholder: 'e.g. Building in unstructured playtime right after school seems to help.',
  },
];

export function getQuestionSteps(eventType: EventType): QuestionConfig[] {
  return eventType === 'positiveMoment' ? POSITIVE_QUESTION_STEPS : CHALLENGE_QUESTION_STEPS;
}
