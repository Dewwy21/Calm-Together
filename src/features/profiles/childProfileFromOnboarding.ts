import { OTHER_VALUE } from '../onboarding/OnboardingQuestionCard';
import { OnboardingAnswers } from '../onboarding/types';
import { ChildProfileInput, ChildProfile, ChildAgeRange, AdhdStatus, AvatarColorKey } from './types';

const AVATAR_COLOR_KEYS: AvatarColorKey[] = ['primary', 'secondary', 'accent', 'warning'];

export function pickAvatarColorKey(index: number): AvatarColorKey {
  return AVATAR_COLOR_KEYS[index % AVATAR_COLOR_KEYS.length];
}

// The Baseline Assessment asks the child's age as free text (a number),
// not a bucketed range — this buckets it into the app's existing 6-range
// scale. Falls back to '5-7' on anything unparseable, matching the
// previous fallback-on-undefined behavior.
export function mapAgeToAgeRange(ageText: string | undefined): ChildAgeRange {
  const years = ageText ? parseInt(ageText.trim(), 10) : NaN;
  if (Number.isNaN(years)) return '5-7';
  if (years <= 4) return '2-4';
  if (years <= 7) return '5-7';
  if (years <= 10) return '8-10';
  if (years <= 13) return '11-13';
  if (years <= 17) return '14-17';
  return '18+';
}

// The Baseline Assessment's ADHD question asks about diagnosis *subtype*
// (Inattentive/Hyperactive-Impulsive/Combined/etc.), not diagnosis
// *status* (Yes/No/Not sure/Being evaluated), which is what this app's
// profile field actually stores — there is no way to produce 'no' or
// 'beingEvaluated' from the new question. Confirmed with the caregiver:
// "Not formally diagnosed but suspected" maps to 'notSure'; every other
// option implies a diagnosis exists, so it maps to 'yes'. This only
// affects text interpolated into AI prompts (nothing branches on the
// value), and stays manually editable afterward in Kid Profiles.
export function mapAdhdDiagnosisTypeToStatus(value: string | undefined): AdhdStatus {
  if (value === 'suspectedNotDiagnosed') return 'notSure';
  if (value) return 'yes';
  return 'notSure';
}

// Builds the first child's profile from the Baseline Assessment's answers
// bag. Name is never asked in the assessment (matching the source
// document, which also has no child-name field), so it defaults to a
// placeholder the caregiver can rename anytime from Kid Profiles.
export function childProfileFromOnboardingAnswers(answers: OnboardingAnswers, colorIndex = 0): ChildProfileInput {
  const gender = answers.childGender as string | undefined;
  const educationSetting = answers.educationSetting as string | undefined;

  return {
    name: 'Your Child',
    ageRange: mapAgeToAgeRange(answers.childAge as string | undefined),
    gender: gender ? (gender === OTHER_VALUE ? 'other' : (gender as ChildProfile['gender'])) : undefined,
    genderOther: gender === OTHER_VALUE ? (answers['childGender__other'] as string) : undefined,
    avatarColorKey: pickAvatarColorKey(colorIndex),
    adhdStatus: mapAdhdDiagnosisTypeToStatus(answers.adhdDiagnosisType as string | undefined),
    // No direct equivalent to "is your child in therapy" in the Baseline
    // Assessment (the closest question, strategiesTried, is a different
    // multi-select shape, not a yes/no) — left unset rather than inferred.
    // Caregivers can set this manually in Kid Profiles.
    inTherapy: undefined,
    onMedication: answers.onMedication === 'yes' ? true : answers.onMedication === 'no' ? false : undefined,
    educationSetting: educationSetting
      ? educationSetting === OTHER_VALUE
        ? 'other'
        : (educationSetting as ChildProfile['educationSetting'])
      : undefined,
    educationSettingOther: educationSetting === OTHER_VALUE ? (answers['educationSetting__other'] as string) : undefined,
    hasSiblings: answers.hasSiblings === 'yes' ? true : answers.hasSiblings === 'no' ? false : undefined,
  };
}
