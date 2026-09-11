export type ChildAgeRange = '2-4' | '5-7' | '8-10' | '11-13' | '14-17' | '18+';
export type ChildGender = 'male' | 'female' | 'nonbinary' | 'preferNotToSay' | 'other';
export type AdhdStatus = 'yes' | 'no' | 'notSure' | 'beingEvaluated';
export type EducationSetting =
  | 'publicSchool'
  | 'privateSchool'
  | 'homeschool'
  | 'onlineSchool'
  | 'specialEducation'
  | 'notYetSchoolAge'
  | 'other';

// One of the app's semantic theme colors, resolved at render time so an
// avatar's color stays correct across light/dark mode instead of freezing a
// hex value at creation time.
export type AvatarColorKey = 'primary' | 'secondary' | 'accent' | 'warning';

export interface ChildProfile {
  id: string;
  name: string;
  ageRange: ChildAgeRange;
  gender?: ChildGender;
  genderOther?: string;
  avatarUri?: string;
  avatarColorKey: AvatarColorKey;
  adhdStatus: AdhdStatus;
  inTherapy?: boolean;
  onMedication?: boolean;
  educationSetting?: EducationSetting;
  educationSettingOther?: string;
  hasSiblings?: boolean;
  archived: boolean;
  createdAtISO: string;
  /**
   * Set the first time this child's caregiver opens any lesson (see
   * app/(modals)/courses/[courseId]/[lessonId].tsx) — the start of the
   * 28-day intervention window that Day 14/28 Baseline Assessment
   * checkpoints are calculated from (see baselineAssessment/checkpoints.ts).
   * Unset until then; never reset by a retake.
   */
  interventionStartDateISO?: string;
}

export type ChildProfileInput = Omit<ChildProfile, 'id' | 'archived' | 'createdAtISO'>;
