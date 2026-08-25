import { z } from 'zod';

export const blueprintSectionEnum = z.enum([
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
]);

export const blueprintPatchSchema = z.object({
  additions: z
    .array(
      z.object({
        section: blueprintSectionEnum,
        text: z
          .string()
          .describe(
            'A short, specific, third-person note to add — e.g. "Responds well to advance warnings before transitions", not a sentence of advice.'
          ),
      })
    )
    .describe('New insights learned from this interaction. Usually 0 to 3 items — only genuinely new and specific, never generic filler.'),
  removals: z
    .array(
      z.object({
        section: blueprintSectionEnum,
        matchingText: z
          .string()
          .describe('The existing insight, or a close paraphrase of it, that this interaction shows is now outdated, resolved, or contradicted.'),
      })
    )
    .describe('Existing insights that no longer hold. Usually empty.'),
  updateSummary: z
    .string()
    .nullable()
    .describe(
      'One short, specific sentence for a "Recently Updated" log describing what was learned or changed this time (e.g. "Learned that bedtime has become a recurring trigger"). Null if nothing meaningful changed.'
    ),
});

export type BlueprintPatchResult = z.infer<typeof blueprintPatchSchema>;
