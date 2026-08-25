export type BlueprintSectionKey =
  | 'childStrengths'
  | 'childChallenges'
  | 'caregiverStrengths'
  | 'caregiverGrowthAreas'
  | 'commonTriggers'
  | 'whatUsuallyHelps'
  | 'familyGoals'
  | 'currentPriorities'
  | 'recentWins'
  | 'recommendedNextFocus';

export const BLUEPRINT_SECTION_KEYS: BlueprintSectionKey[] = [
  'childStrengths',
  'childChallenges',
  'caregiverStrengths',
  'caregiverGrowthAreas',
  'commonTriggers',
  'whatUsuallyHelps',
  'familyGoals',
  'currentPriorities',
  'recentWins',
  'recommendedNextFocus',
];

export type BlueprintSourceType =
  | 'onboarding'
  | 'dailyLog'
  | 'helpBot'
  | 'checkIn'
  | 'lesson'
  | 'lessonChat'
  | 'calmCorner'
  | 'simulator'
  | 'parentReplay'
  | 'aiReflection'
  | 'actCheckIn';

export interface BlueprintInsight {
  id: string;
  text: string;
  sourceType: BlueprintSourceType;
  createdAtISO: string;
  updatedAtISO: string;
}

export interface BlueprintUpdateLogEntry {
  id: string;
  summary: string;
  section: BlueprintSectionKey | null;
  sourceType: BlueprintSourceType;
  createdAtISO: string;
  /** Flags an entry raised by the AI Conversation Engine's safety triage — surfaced distinctly in the UI, never silently mixed in with routine updates. */
  isSafetyEvent?: boolean;
}

export type BlueprintSections = Record<BlueprintSectionKey, BlueprintInsight[]>;

export interface FamilyBlueprint extends BlueprintSections {
  childId: string;
  recentlyUpdated: BlueprintUpdateLogEntry[];
  createdAtISO: string;
  lastRefreshedISO: string;
  version: number;
}

export interface BlueprintPatchAddition {
  section: BlueprintSectionKey;
  text: string;
}

export interface BlueprintPatchRemoval {
  section: BlueprintSectionKey;
  matchingText: string;
}

export interface BlueprintPatch {
  additions: BlueprintPatchAddition[];
  removals: BlueprintPatchRemoval[];
  updateSummary: string | null;
}
