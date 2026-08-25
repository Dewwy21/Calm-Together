import { LoggedEvent } from '../logEvent/types';
import { firstSentence } from '../logEvent/textUtils';
import { ChildProfile } from '../profiles/types';
import { ageRangeLabel, adhdStatusLabel } from '../profiles/profileOptions';

export interface FamilyContextInput {
  child: ChildProfile | null;
  recentEvents: LoggedEvent[];
  streak: number;
  totalLogs: number;
  completedLessonTitles: string[];
  /** Compact rendering of the Family Blueprint — this family's continuously-updated memory. See src/features/blueprint/. */
  blueprintSummary?: string;
}

// Grounds every AI call in what's already sitting in this family's local
// data — recent logs, the child's profile, their stated goal, and lessons
// already completed — rather than an unbounded memory store. This is what
// "remembers previous logs/lessons/goals" actually means here: recent,
// summarized, and passed in fresh on every call.
export function buildFamilyContext(input: FamilyContextInput): string {
  const lines: string[] = [];

  if (input.child) {
    lines.push(
      `Child: ${input.child.name}, age range ${ageRangeLabel(input.child.ageRange)}, ADHD status: ${adhdStatusLabel(input.child.adhdStatus)}.`
    );
  }

  lines.push(`Logging streak: ${input.streak} day(s), ${input.totalLogs} total entries so far.`);

  if (input.recentEvents.length) {
    const recent = input.recentEvents.slice(-5);
    const summaries = recent.map(
      (e) => `- ${e.eventType} (intensity ${e.intensity}/10): ${firstSentence(e.whatHappened, 100)}`
    );
    lines.push(`Recent Daily Log entries, most recent last:\n${summaries.join('\n')}`);
  }

  if (input.completedLessonTitles.length) {
    lines.push(
      `Parent Learning Series lessons already completed: ${input.completedLessonTitles.join(', ')}. Where relevant, build on these rather than repeating ground already covered.`
    );
  }

  if (input.blueprintSummary) {
    lines.push(
      `\nFamily Blueprint — this family's living memory, built up over every past interaction. Treat this as ground truth about the family, and reference it naturally where it's actually relevant (remind them of a strategy that's worked before, acknowledge real improvement, recognize a recurring challenge) rather than starting over each time:\n${input.blueprintSummary}`
    );
  }

  return lines.join('\n');
}
