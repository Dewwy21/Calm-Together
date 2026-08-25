import { askClaudeStructured } from './anthropicClient';
import { blueprintPatchSchema } from './blueprintSchema';
import { BlueprintPatch, BlueprintSourceType } from '../blueprint/types';

const SOURCE_LABELS: Record<BlueprintSourceType, string> = {
  onboarding: 'the caregiver just finished the onboarding assessment',
  dailyLog: 'the caregiver just saved a Daily Log entry',
  helpBot: 'the caregiver just had an exchange with Help Bot',
  checkIn: 'the caregiver just completed a Weekly Emotional Check-In',
  lesson: 'the caregiver just completed a lesson',
  lessonChat: 'the caregiver just asked the AI a question about a lesson they were going through',
  calmCorner: 'the caregiver just used a Calm Corner exercise',
  simulator: 'the caregiver just finished a Conversation Simulator practice session',
  parentReplay: 'the caregiver just reviewed a Parent Replay of a difficult moment',
  aiReflection: 'the caregiver just had an AI Reflection conversation about a logged moment',
  actCheckIn: 'the caregiver just went through an ACT Parenting Check-In',
};

const SYSTEM = `You maintain the "Family Blueprint" for a family using Otter Companion, an app for caregivers of children with ADHD — a living memory of this specific family that the AI coach reads before every response. It is organized into: Child Strengths, Child Challenges, Caregiver Strengths, Caregiver Growth Areas, Common Triggers, What Usually Helps, Family Goals, Current Priorities, Recent Wins, and Recommended Next Focus.

You are given the current Blueprint and one new interaction. Decide what, if anything, should change.

Rules:
- Only add something if it is genuinely new, specific, and worth remembering — not a restatement of something already there, not generic parenting advice, not a summary of the interaction itself. Each addition should read like a short factual note about this family (e.g. "Responds well to advance warnings before transitions"), never a sentence of advice.
- Most single interactions teach little or nothing new — it is completely normal and expected for "additions" to be empty. Do not force something into every section just because sections exist.
- If this interaction contradicts or resolves something already in the Blueprint (a challenge that's improved, a strategy that stopped working, a priority that's no longer current), remove the outdated item via "removals" rather than leaving two contradictory notes side by side.
- "recentWins" is for real, specific, recent progress — not every positive log qualifies.
- "recommendedNextFocus" should reflect where attention would genuinely help next, updated as priorities shift — not left stale.
- Keep every addition under about 12 words. This is a scannable memory, not a report.
- Do not include internal reasoning or XML-like tags anywhere in the output.`;

export async function updateBlueprintFromInteraction(input: {
  currentBlueprintSummary: string;
  interactionSummary: string;
  sourceType: BlueprintSourceType;
  childDescription: string;
  isFirstEver: boolean;
}): Promise<BlueprintPatch> {
  const intro = input.isFirstEver
    ? 'This is the very first look at this family, right after onboarding — the Blueprint starts empty. Be reasonably generous here: seed 2 to 4 well-grounded starting insights across whichever sections genuinely apply based on what was shared, rather than waiting for more data. It is fine to leave a section empty if nothing shared actually speaks to it.'
    : `Here is what just happened: ${SOURCE_LABELS[input.sourceType]}.`;

  return askClaudeStructured({
    system: `${SYSTEM}\n\n${input.childDescription}`,
    messages: [
      {
        role: 'user',
        content: `${intro}\n\nCurrent Family Blueprint:\n${input.currentBlueprintSummary}\n\nWhat just happened:\n${input.interactionSummary}`,
      },
    ],
    schema: blueprintPatchSchema,
    maxTokens: 1024,
    thinkingEnabled: true,
  });
}
