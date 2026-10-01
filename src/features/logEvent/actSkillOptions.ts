// The six core ACT processes a caregiver might have drawn on today, plus
// "None Today" — ids deliberately match the ones already used for the
// 28-day course system (see actProgramLessons.ts's ACT_PROCESSES) so a
// skill logged here and a course topic can be cross-referenced later,
// minus 'choicePoint' (a meta-process, not something logged as "used").
export type ActSkillId =
  | 'acceptance'
  | 'cognitiveDefusion'
  | 'presentMomentAwareness'
  | 'selfAsContext'
  | 'values'
  | 'committedAction'
  | 'noneToday';

export interface ActSkillOption {
  id: ActSkillId;
  label: string;
}

export const ACT_SKILL_OPTIONS: ActSkillOption[] = [
  { id: 'acceptance', label: 'Acceptance' },
  { id: 'cognitiveDefusion', label: 'Cognitive Defusion' },
  { id: 'presentMomentAwareness', label: 'Present-Moment Awareness' },
  { id: 'selfAsContext', label: 'Self-as-Context' },
  { id: 'values', label: 'Values' },
  { id: 'committedAction', label: 'Committed Action' },
  { id: 'noneToday', label: 'None Today' },
];

export function actSkillLabel(id: ActSkillId): string {
  return ACT_SKILL_OPTIONS.find((o) => o.id === id)?.label ?? id;
}
