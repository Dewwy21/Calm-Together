import { OnboardingQuestion } from './types';

// The Baseline Assessment ("Calm Together — Parent Baseline Questionnaire /
// Pre-Intervention Assessment"), reproduced verbatim from the source
// document across its 5 sections. Every question, answer choice, and scale
// label below matches the source exactly — nothing added, nothing removed.
// See sections.ts for the section-level intro/instruction/citation text.

const STRESS_SCALE_OPTIONS = [
  { value: '1', label: '1 – Strongly Disagree' },
  { value: '2', label: '2 – Disagree' },
  { value: '3', label: '3 – Undecided' },
  { value: '4', label: '4 – Agree' },
  { value: '5', label: '5 – Strongly Agree' },
];

const PAQ_SCALE_OPTIONS = [
  { value: '1', label: '1 – Strongly Disagree / Never' },
  { value: '2', label: '2 – Disagree / Infrequently' },
  { value: '3', label: '3 – Agree / Often' },
  { value: '4', label: '4 – Strongly Agree / Almost Always' },
];

// Parenting Stress Scale statements, in source order. Items 1, 2, 5, 6, 7,
// 8, 17, 18 are reverse scored per the source document's scoring note
// (inert metadata only — see OnboardingQuestion.reverseScored).
const STRESS_SCALE_STATEMENTS = [
  'I am happy in my role as a parent.',
  "There is little or nothing I wouldn't do for my child if it was necessary.",
  'Caring for my child sometimes takes more time and energy than I have to give.',
  'I sometimes worry whether I am doing enough for my child.',
  'I feel close to my child.',
  'I enjoy spending time with my child.',
  'My child is an important source of affection for me.',
  'Having a child gives me a more certain and optimistic view for the future.',
  'The major source of stress in my life is my child.',
  'Having a child leaves little time and flexibility in my life.',
  'Having a child has been a financial burden.',
  'It is difficult to balance different responsibilities because of my child.',
  'The behavior of my child is often embarrassing or stressful to me.',
  'If I had it to do over again, I might decide not to have children.',
  'I feel overwhelmed by the responsibility of being a parent.',
  'Having a child has meant having too few choices and too little control over my life.',
  'I am satisfied as a parent.',
  'I find my child enjoyable.',
];
const STRESS_REVERSE_SCORED_ITEMS = new Set([1, 2, 5, 6, 7, 8, 17, 18]);

// 6-PAQ (Parenting Acceptance Questionnaire) statements, in source order.
// Items 3, 4, 6, 8, 9, 11, 12, 13, 14, 16, 17 are reverse scored per the
// source document's scoring note (inert metadata only).
const PAQ_STATEMENTS = [
  'When interacting with my child, I focus on our time together.',
  'I am consistent in my parenting practices.',
  "I would rather give in to my child than have him/her make a scene in public.",
  "I get upset if things don't go my way when I interact with my child.",
  'I can clearly state my values related to parenting.',
  'If someone criticizes my parenting, I must be a bad parent.',
  'My parenting behaviors are based on what matters to me rather than how I feel in the moment.',
  'I feel like my mind is somewhere else when I spend time with my child.',
  'When my child misbehaves, I find myself wrapped up in my emotions rather than dealing with the behavior.',
  'My actions as a parent are consistent with my values.',
  'I have negative thoughts about myself when my child behaves in a negative way.',
  "It is difficult to initiate or maintain routines because I don't want to deal with my child's reactions.",
  'When parenting does not go as I had planned, I feel like a failure.',
  'I avoid taking my child to places for fear of how they will behave.',
  'I am able to sacrifice convenience for effective discipline.',
  'I feel like a bad parent when my child misbehaves.',
  'When spending time with my child, I find myself distracted by other things I need to get done.',
  'I have clear parenting values that guide my interactions with my child.',
];
const PAQ_REVERSE_SCORED_ITEMS = new Set([3, 4, 6, 8, 9, 11, 12, 13, 14, 16, 17]);

export const QUESTIONS: OnboardingQuestion[] = [
  // === SECTION 1 OF 5 — Child & Family Background ===
  {
    id: 'childAge',
    type: 'shortText',
    prompt: "Child's age",
    placeholder: 'e.g. 7',
    options: [],
  },
  {
    id: 'childGrade',
    type: 'shortText',
    prompt: "Child's current grade or school year",
    placeholder: 'e.g. 2nd grade',
    options: [],
  },
  {
    id: 'caregiverRole',
    type: 'single',
    prompt: 'Who are you to this child?',
    options: [
      { value: 'mother', label: 'Mother' },
      { value: 'father', label: 'Father' },
      { value: 'stepparent', label: 'Stepparent' },
      { value: 'grandparent', label: 'Grandparent' },
      { value: 'fosterParent', label: 'Foster Parent' },
      { value: 'otherCaregiver', label: 'Other Caregiver' },
    ],
    allowOther: true,
  },
  {
    id: 'childGender',
    type: 'single',
    prompt: "What is your child's gender?",
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'nonbinary', label: 'Nonbinary' },
      { value: 'preferNotToSay', label: 'Prefer not to say' },
    ],
    allowOther: true,
  },
  {
    id: 'hasSiblings',
    type: 'single',
    prompt: 'Does your child have siblings?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    id: 'educationSetting',
    type: 'single',
    prompt: 'What type of educational setting does your child attend?',
    options: [
      { value: 'publicSchool', label: 'Public school' },
      { value: 'privateSchool', label: 'Private school' },
      { value: 'homeschool', label: 'Homeschool' },
      { value: 'onlineSchool', label: 'Online school' },
      { value: 'specialEducation', label: 'Special education program' },
      { value: 'notYetSchoolAge', label: 'Not yet school-age' },
    ],
    allowOther: true,
  },
  {
    id: 'preferredLanguage',
    type: 'single',
    prompt: 'Preferred language for the app',
    options: [
      { value: 'english', label: 'English' },
      { value: 'chinese', label: 'Chinese (中文)' },
      { value: 'both', label: 'Both' },
    ],
  },
  {
    id: 'adhdDiagnosisType',
    type: 'single',
    prompt: 'ADHD diagnosis type — please check one',
    options: [
      { value: 'inattentive', label: 'Inattentive (difficulty focusing, easily distracted)' },
      { value: 'hyperactiveImpulsive', label: 'Hyperactive-Impulsive (restless, acts without thinking)' },
      { value: 'combined', label: 'Combined (both inattentive and hyperactive-impulsive)' },
      { value: 'diagnosedUnspecified', label: 'Diagnosed with ADHD — type not specified' },
      { value: 'suspectedNotDiagnosed', label: 'Not formally diagnosed but suspected' },
    ],
  },
  {
    id: 'onMedication',
    type: 'single',
    prompt: 'Is your child currently on ADHD medication?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
      { value: 'inProcess', label: 'In the process of deciding' },
    ],
  },
  {
    id: 'coOccurringConditions',
    type: 'multi',
    prompt: 'Co-occurring conditions — check all that apply',
    options: [
      { value: 'anxiety', label: 'Anxiety' },
      { value: 'depression', label: 'Depression' },
      { value: 'odd', label: 'Oppositional Defiant Disorder (ODD)' },
      { value: 'asd', label: 'Autism Spectrum Disorder (ASD)' },
      { value: 'learningDisabilities', label: 'Learning disabilities' },
      { value: 'sleepDifficulties', label: 'Sleep difficulties' },
      { value: 'none', label: 'None' },
      { value: 'preferNotToSay', label: 'Prefer not to say' },
    ],
    allowOther: true,
  },

  // === SECTION 2 OF 5 — Your Current Challenges ===
  {
    id: 'strategiesTried',
    type: 'multi',
    prompt: 'What strategies have you already tried? Check all that apply.',
    options: [
      { value: 'rewardCharts', label: 'Reward charts' },
      { value: 'timers', label: 'Timers' },
      { value: 'routinesSchedules', label: 'Routines and schedules' },
      { value: 'parentingBooks', label: 'Parenting books or courses' },
      { value: 'individualTherapy', label: 'Individual therapy for my child' },
      { value: 'familyTherapy', label: 'Family therapy' },
      { value: 'parentTrainingProgram', label: 'Parent training program (e.g. PCIT, Triple P, STAND)' },
      { value: 'adhdCoaching', label: 'ADHD coaching for my child' },
      { value: 'schoolAccommodations', label: 'School accommodations or IEP' },
      { value: 'medication', label: 'Medication' },
      { value: 'nothingYet', label: 'Nothing yet — just starting out' },
    ],
    allowOther: true,
  },

  // === SECTION 3 OF 5 — Your Relationship with Your Child ===
  {
    id: 'challengingAreas',
    type: 'multi',
    prompt: 'Select up to 3 areas that feel most challenging for your child or you right now.',
    maxSelections: 3,
    options: [
      { value: 'gettingStarted', label: 'Getting started and following through on tasks' },
      { value: 'bigEmotions', label: 'Big emotions and meltdowns' },
      { value: 'motivationConfidence', label: 'Motivation, confidence, and avoidance' },
      { value: 'screenTime', label: 'Screen time and technology' },
      { value: 'schoolExecutiveFunction', label: 'School and executive function' },
      { value: 'parentChildRelationship', label: 'Parent-child relationship' },
      { value: 'socialFamilyRelationships', label: 'Social and family relationships' },
      { value: 'anxietyEmotionalWellbeing', label: 'Anxiety and emotional well-being' },
      { value: 'dailyRoutinesIndependence', label: 'Daily routines and independence' },
      { value: 'caringForSelf', label: 'Taking care of myself as a parent' },
    ],
  },
  {
    id: 'relationshipRating',
    type: 'single',
    prompt: 'Overall, how would you describe your relationship with your child right now? Please circle the number that best applies.',
    options: [
      { value: '1', label: '1 — Very strained and difficult' },
      { value: '2', label: '2 — Often difficult' },
      { value: '3', label: '3 — More difficult than positive' },
      { value: '4', label: '4 — Mixed — some good moments, some difficult' },
      { value: '5', label: '5 — More positive than difficult' },
      { value: '6', label: '6 — Mostly warm and connected' },
      { value: '7', label: '7 — Very warm, close, and connected' },
    ],
  },
  {
    id: 'whatWouldFeelDifferent',
    type: 'longText',
    prompt: 'What would feel different if this app was helping you?',
    helperText: 'There are no right or wrong answers — share whatever comes to mind.',
    placeholder: 'Whatever comes to mind...',
    options: [],
  },

  // === SECTION 4 OF 5 — Parenting Stress Scale ===
  ...STRESS_SCALE_STATEMENTS.map(
    (statement, i): OnboardingQuestion => ({
      id: `stressScale${i + 1}`,
      type: 'single',
      prompt: statement,
      options: STRESS_SCALE_OPTIONS,
      reverseScored: STRESS_REVERSE_SCORED_ITEMS.has(i + 1),
    })
  ),

  // === SECTION 5 OF 5 — Parenting Acceptance Questionnaire (6-PAQ) ===
  ...PAQ_STATEMENTS.map(
    (statement, i): OnboardingQuestion => ({
      id: `paq${i + 1}`,
      type: 'single',
      prompt: statement,
      options: PAQ_SCALE_OPTIONS,
      reverseScored: PAQ_REVERSE_SCORED_ITEMS.has(i + 1),
    })
  ),
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

export function getQuestionOptionLabel(question: OnboardingQuestion, value: string): string {
  return question.options.find((o) => o.value === value)?.label ?? value;
}
