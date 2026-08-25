import { StarIcon, ThoughtIcon, ChartIcon, PersonIcon } from '../../components/icons';
import { LessonCard } from '../courses/types';
import { LessonSource, PersonalizedLesson } from '../personalizedLessons/types';
import { createId } from '../logEvent/eventStorage';
import { AiUnavailableError } from './anthropicClient';
import { buildFamilyContext, FamilyContextInput } from './familyContext';
import { personalizedLessonSchema, GeneratedLessonCard } from './personalizedLessonSchema';
import { runConversationTurn } from '../aiEngine/conversationEngine';
import { buildEnginePrompt } from '../aiEngine/buildEnginePrompt';
import { assessSafety } from '../aiEngine/safetyTriage';
import { SafetyTriggeredError } from '../aiEngine/safetyError';

const OBJECTIVE = `You're building a short, personalized mini-course for this caregiver — a "Personalized Lesson". You're given one specific real situation from this family: a logged moment, a Help Bot conversation, a recurring pattern noticed in their own data, or a topic they typed in themselves. Build a focused mini-course of 5 to 10 swipeable cards specifically about THIS situation, not a generic topic that could apply to any family. Reference the specific details given wherever it makes the lesson more useful and concrete. Every card's text should be genuinely bite-sized, a few sentences at most — this is a swipeable card, not an article. You have interactive card kinds available beyond plain text and images: quiz, reflection, comparison, timeline, decisionTree, stat, scenario (a realistic decision point with several response options, each with its own feedback), and sequence (an ordering activity). Use whichever genuinely fit this specific situation.`;

function mapGeneratedCard(raw: GeneratedLessonCard, index: number): LessonCard | null {
  const id = `card-${index}`;
  switch (raw.kind) {
    case 'intro':
      if (!raw.title || !raw.hook) return null;
      return { id, kind: 'intro', title: raw.title, hook: raw.hook, icon: StarIcon };
    case 'concept':
      if (!raw.heading || !raw.body) return null;
      return { id, kind: 'concept', heading: raw.heading, body: raw.body, icon: ThoughtIcon };
    case 'example':
      if (!raw.heading || !raw.scenario || !raw.takeaway) return null;
      return { id, kind: 'example', heading: raw.heading, scenario: raw.scenario, takeaway: raw.takeaway };
    case 'comparison':
      if (!raw.heading || !raw.leftLabel || !raw.leftItems || !raw.rightLabel || !raw.rightItems) return null;
      return {
        id,
        kind: 'comparison',
        heading: raw.heading,
        leftLabel: raw.leftLabel,
        leftItems: raw.leftItems,
        rightLabel: raw.rightLabel,
        rightItems: raw.rightItems,
      };
    case 'timeline':
      if (!raw.heading || !raw.steps || raw.steps.length === 0) return null;
      return { id, kind: 'timeline', heading: raw.heading, steps: raw.steps };
    case 'decisionTree':
      if (!raw.heading || !raw.branches || raw.branches.length === 0) return null;
      return { id, kind: 'decisionTree', heading: raw.heading, branches: raw.branches };
    case 'stat':
      if (!raw.heading || !raw.statText || !raw.detail) return null;
      return { id, kind: 'stat', heading: raw.heading, statText: raw.statText, detail: raw.detail, icon: ChartIcon };
    case 'quiz':
      if (!raw.question || !raw.options || raw.options.length < 2 || raw.correctIndex === null || !raw.explanation) return null;
      return { id, kind: 'quiz', question: raw.question, options: raw.options, correctIndex: raw.correctIndex, explanation: raw.explanation };
    case 'reflection':
      if (!raw.prompt) return null;
      return { id, kind: 'reflection', prompt: raw.prompt };
    case 'exercise':
      if (!raw.title || !raw.instructions) return null;
      return { id, kind: 'exercise', title: raw.title, instructions: raw.instructions };
    case 'scenario':
      if (!raw.heading || !raw.situation || !raw.scenarioOptions || raw.scenarioOptions.length < 2) return null;
      return { id, kind: 'scenario', heading: raw.heading, situation: raw.situation, options: raw.scenarioOptions };
    case 'sequence':
      if (!raw.heading || !raw.steps || raw.steps.length < 2) return null;
      return { id, kind: 'sequence', heading: raw.heading, instructions: raw.instructions ?? undefined, items: raw.steps };
    default:
      return null;
  }
}

export async function generatePersonalizedLesson(input: {
  source: LessonSource;
  situationDescription: string;
  familyContextInput: FamilyContextInput;
}): Promise<PersonalizedLesson> {
  // The situation a lesson is built from can come from a Daily Log entry,
  // a Help Bot conversation, or a detected pattern — any of which could
  // carry a real safety disclosure, not just a live chat message.
  const safety = assessSafety(input.situationDescription);
  if (safety.isSafetyEvent) {
    throw new SafetyTriggeredError(safety.category);
  }

  const context = buildFamilyContext(input.familyContextInput);
  const system = buildEnginePrompt({ objective: OBJECTIVE, familyContext: context });

  const result = await runConversationTurn({
    feature: 'personalizedLesson',
    system,
    messages: [{ role: 'user', content: input.situationDescription }],
    schema: personalizedLessonSchema,
    maxTokens: 3072,
    thinkingEnabled: true,
  });

  const cards = result.cards.map(mapGeneratedCard).filter((c): c is LessonCard => c !== null);
  if (cards.length < 3) {
    throw new AiUnavailableError('The generated lesson came back incomplete. Please try again.');
  }

  return {
    id: createId(),
    courseId: 'personalized',
    title: result.title,
    summary: result.summary,
    estimatedMinutes: result.estimatedMinutes,
    icon: PersonIcon,
    cards,
    source: input.source,
    createdAtISO: new Date().toISOString(),
  };
}
