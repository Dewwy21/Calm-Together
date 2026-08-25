import { AdhdStatus, ChildAgeRange, ChildGender, EducationSetting } from './types';

export const AGE_RANGE_OPTIONS: { value: ChildAgeRange; label: string }[] = [
  { value: '2-4', label: '2 to 4 years' },
  { value: '5-7', label: '5 to 7 years' },
  { value: '8-10', label: '8 to 10 years' },
  { value: '11-13', label: '11 to 13 years' },
  { value: '14-17', label: '14 to 17 years' },
  { value: '18+', label: '18 years or older' },
];

export const GENDER_OPTIONS: { value: ChildGender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'nonbinary', label: 'Nonbinary' },
  { value: 'preferNotToSay', label: 'Prefer not to say' },
  { value: 'other', label: 'Other' },
];

export const ADHD_STATUS_OPTIONS: { value: AdhdStatus; label: string }[] = [
  { value: 'yes', label: 'Diagnosed' },
  { value: 'no', label: 'Not diagnosed' },
  { value: 'notSure', label: 'Not sure' },
  { value: 'beingEvaluated', label: 'Being evaluated' },
];

export const EDUCATION_SETTING_OPTIONS: { value: EducationSetting; label: string }[] = [
  { value: 'publicSchool', label: 'Public School' },
  { value: 'privateSchool', label: 'Private School' },
  { value: 'homeschool', label: 'Homeschool' },
  { value: 'onlineSchool', label: 'Online School' },
  { value: 'specialEducation', label: 'Special Education Program' },
  { value: 'notYetSchoolAge', label: 'Not yet school-age' },
  { value: 'other', label: 'Other' },
];

export const YES_NO_OPTIONS: { value: 'yes' | 'no'; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

export function ageRangeLabel(value: ChildAgeRange): string {
  return AGE_RANGE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function adhdStatusLabel(value: AdhdStatus): string {
  return ADHD_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
