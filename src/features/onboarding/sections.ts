import { OnboardingSection } from './types';

const TOTAL_SECTIONS = 5;

// Mirrors the source document's own "SECTION X OF 5" structure. Intro/
// sourceAttribution text is reproduced verbatim where the document has it —
// left undefined where it doesn't (Sections 1-3 have no section-level
// instruction paragraph beyond their title in the source).
export const SECTIONS: OnboardingSection[] = [
  {
    id: 'background',
    sectionNumber: 1,
    totalSections: TOTAL_SECTIONS,
    title: 'Child & Family Background',
    questionIds: [
      'childAge',
      'childGrade',
      'caregiverRole',
      'childGender',
      'hasSiblings',
      'educationSetting',
      'preferredLanguage',
      'adhdDiagnosisType',
      'onMedication',
      'coOccurringConditions',
    ],
  },
  {
    id: 'currentChallenges',
    sectionNumber: 2,
    totalSections: TOTAL_SECTIONS,
    title: 'Your Current Challenges',
    questionIds: ['strategiesTried'],
  },
  {
    id: 'relationship',
    sectionNumber: 3,
    totalSections: TOTAL_SECTIONS,
    title: 'Your Relationship with Your Child',
    questionIds: ['challengingAreas', 'relationshipRating', 'whatWouldFeelDifferent'],
  },
  {
    id: 'parentingStressScale',
    sectionNumber: 4,
    totalSections: TOTAL_SECTIONS,
    title: 'Parenting Stress Scale',
    intro: 'Think of each statement in terms of how your relationship with your child typically is. Indicate how much you agree or disagree with each statement.',
    sourceAttribution:
      'Source: Berry, J. D., & Jones, W. H. (1995). The Parental Stress Scale: Initial psychometric evidence. Journal of Social and Personal Relationships, 12, 463–472.',
    questionIds: Array.from({ length: 18 }, (_, i) => `stressScale${i + 1}`),
  },
  {
    id: 'parentingAcceptance',
    sectionNumber: 5,
    totalSections: TOTAL_SECTIONS,
    title: 'Parenting Acceptance Questionnaire (6-PAQ)',
    intro: 'Choose the answer that best describes your most consistent feelings and reactions over the past few months.',
    sourceAttribution: 'Source: 6-PAQ — Parenting Acceptance Questionnaire. Measures psychological flexibility in parenting.',
    questionIds: Array.from({ length: 18 }, (_, i) => `paq${i + 1}`),
  },
];
