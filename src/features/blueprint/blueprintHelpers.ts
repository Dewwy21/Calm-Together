import type { ComponentType } from 'react';
import {
  IconProps,
  StarIcon,
  WaveIcon,
  HeartIcon,
  LeafIcon,
  FlameIcon,
  CheckIcon,
  ChartIcon,
  BellIcon,
  TrophyIcon,
  ArrowRightIcon,
  PersonIcon,
  ChatIcon,
  BookIcon,
  PeopleIcon,
  SwirlIcon,
  ThoughtIcon,
  HandsIcon,
} from '../../components/icons';
import { createId } from '../logEvent/eventStorage';
import { SafetyCategory } from '../aiEngine/types';
import {
  BLUEPRINT_SECTION_KEYS,
  BlueprintInsight,
  BlueprintPatch,
  BlueprintSectionKey,
  BlueprintSections,
  BlueprintSourceType,
  BlueprintUpdateLogEntry,
  FamilyBlueprint,
} from './types';

const MAX_PER_SECTION = 8;
const MAX_UPDATE_LOG = 30;

export const SECTION_META: Record<BlueprintSectionKey, { label: string; description: string; icon: ComponentType<IconProps> }> = {
  childStrengths: { label: 'Child Strengths', description: "What's genuinely going well for your child.", icon: StarIcon },
  childChallenges: { label: 'Child Challenges', description: 'Recurring struggles worth keeping in view.', icon: WaveIcon },
  caregiverStrengths: { label: 'Caregiver Strengths', description: "What you're already doing well.", icon: HeartIcon },
  caregiverGrowthAreas: { label: 'Caregiver Growth Areas', description: "Places you've said you want to grow.", icon: LeafIcon },
  commonTriggers: { label: 'Common Triggers', description: 'Situations that tend to set off hard moments.', icon: FlameIcon },
  whatUsuallyHelps: { label: 'What Usually Helps', description: 'Strategies that have actually worked for your family.', icon: CheckIcon },
  familyGoals: { label: 'Family Goals', description: "What you're working toward together.", icon: ChartIcon },
  currentPriorities: { label: 'Current Priorities', description: 'What matters most right now.', icon: BellIcon },
  recentWins: { label: 'Recent Wins', description: 'Progress worth celebrating.', icon: TrophyIcon },
  recommendedNextFocus: { label: 'Recommended Next Focus', description: "Where it's worth focusing next.", icon: ArrowRightIcon },
};

export const SOURCE_META: Record<BlueprintSourceType, { label: string; icon: ComponentType<IconProps> }> = {
  onboarding: { label: 'Onboarding', icon: PersonIcon },
  dailyLog: { label: 'Daily Log', icon: ChartIcon },
  helpBot: { label: 'Help Bot', icon: ChatIcon },
  checkIn: { label: 'Weekly Check-In', icon: HeartIcon },
  lesson: { label: 'Lesson', icon: BookIcon },
  lessonChat: { label: 'Lesson Chat', icon: ChatIcon },
  calmCorner: { label: 'Calm Corner', icon: LeafIcon },
  simulator: { label: 'Simulator', icon: PeopleIcon },
  parentReplay: { label: 'Parent Replay', icon: SwirlIcon },
  aiReflection: { label: 'AI Reflection', icon: ThoughtIcon },
  actCheckIn: { label: 'ACT Parenting Check-In', icon: HandsIcon },
};

export function createEmptyBlueprint(childId: string): FamilyBlueprint {
  const now = new Date().toISOString();
  const sections = Object.fromEntries(BLUEPRINT_SECTION_KEYS.map((key) => [key, [] as BlueprintInsight[]])) as BlueprintSections;
  return { ...sections, childId, recentlyUpdated: [], createdAtISO: now, lastRefreshedISO: now, version: 0 };
}

function normalize(text: string): string {
  return text.trim().toLowerCase();
}

// Deliberately simple (no fuzzy NLP) — a case-insensitive equality/substring
// check is enough to stop the same insight being added twice in slightly
// different wording, and to let a removal match a close paraphrase.
function isCloseMatch(a: string, b: string): boolean {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

export function applyBlueprintPatch(blueprint: FamilyBlueprint, patch: BlueprintPatch, sourceType: BlueprintSourceType): FamilyBlueprint {
  const now = new Date().toISOString();
  const next: FamilyBlueprint = { ...blueprint };

  patch.removals.forEach((removal) => {
    const list = next[removal.section];
    next[removal.section] = list.filter((item) => !isCloseMatch(item.text, removal.matchingText));
  });

  patch.additions.forEach((addition) => {
    const list = next[addition.section];
    if (list.some((item) => isCloseMatch(item.text, addition.text))) return;
    const insight: BlueprintInsight = { id: createId(), text: addition.text, sourceType, createdAtISO: now, updatedAtISO: now };
    next[addition.section] = [...list, insight].slice(-MAX_PER_SECTION);
  });

  if (patch.updateSummary) {
    const entry: BlueprintUpdateLogEntry = {
      id: createId(),
      summary: patch.updateSummary,
      section: patch.additions[0]?.section ?? null,
      sourceType,
      createdAtISO: now,
    };
    next.recentlyUpdated = [entry, ...blueprint.recentlyUpdated].slice(0, MAX_UPDATE_LOG);
  }

  next.lastRefreshedISO = now;
  next.version = blueprint.version + 1;
  return next;
}

const SAFETY_CATEGORY_LABELS: Record<Exclude<SafetyCategory, 'none'>, string> = {
  selfHarm: 'a self-harm safety conversation',
  harmToChild: 'a safety conversation about harming their child',
  domesticViolence: 'a safety conversation about their own safety',
};

// Recorded directly, deterministically, with no AI call — a safety flag
// should never wait on (or be shaped by) a model response. Still lands in
// the same Blueprint the rest of the app reads, marked so it's never
// mistaken for a routine insight.
export function applySafetyEvent(
  blueprint: FamilyBlueprint,
  sourceType: BlueprintSourceType,
  category: Exclude<SafetyCategory, 'none'>
): FamilyBlueprint {
  const now = new Date().toISOString();
  const note = `Had ${SAFETY_CATEGORY_LABELS[category]} on ${new Date(now).toLocaleDateString()} — flagged for extra support and gentle follow-up.`;

  const entry: BlueprintUpdateLogEntry = {
    id: createId(),
    summary: note,
    section: 'currentPriorities',
    sourceType,
    createdAtISO: now,
    isSafetyEvent: true,
  };
  const priorityInsight: BlueprintInsight = { id: createId(), text: note, sourceType, createdAtISO: now, updatedAtISO: now };

  return {
    ...blueprint,
    currentPriorities: [...blueprint.currentPriorities, priorityInsight].slice(-MAX_PER_SECTION),
    recentlyUpdated: [entry, ...blueprint.recentlyUpdated].slice(0, MAX_UPDATE_LOG),
    lastRefreshedISO: now,
    version: blueprint.version + 1,
  };
}

/** A compact bullet-list rendering of the Blueprint, used both as AI prompt context and nowhere else — the display screen reads the structured sections directly. */
export function serializeBlueprintSections(blueprint: FamilyBlueprint, maxItemsPerSection = 5): string {
  const lines: string[] = [];
  BLUEPRINT_SECTION_KEYS.forEach((key) => {
    const items = blueprint[key];
    if (items.length === 0) return;
    const shown = items.slice(-maxItemsPerSection).map((i) => i.text);
    lines.push(`${SECTION_META[key].label}: ${shown.join('; ')}`);
  });
  return lines.length ? lines.join('\n') : 'Nothing recorded yet — this is a brand new family profile.';
}

export function blueprintCompletenessRatio(blueprint: FamilyBlueprint): number {
  const filled = BLUEPRINT_SECTION_KEYS.filter((key) => blueprint[key].length > 0).length;
  return filled / BLUEPRINT_SECTION_KEYS.length;
}
