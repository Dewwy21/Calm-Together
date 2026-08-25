import { z } from 'zod';

// A deliberately flat schema (every card is one object shape with mostly
// nullable fields, tagged by `kind`) rather than a discriminated union —
// structured-output JSON schemas are most reliable when they stay simple.
// generatePersonalizedLesson.ts maps this into the app's real, narrower
// LessonCard union afterward.
export const generatedLessonCardSchema = z.object({
  kind: z.enum([
    'intro',
    'concept',
    'example',
    'comparison',
    'timeline',
    'decisionTree',
    'stat',
    'quiz',
    'reflection',
    'exercise',
    'scenario',
    'sequence',
  ]),
  title: z.string().nullable().describe('Used by "intro" (the opening title) and "exercise" (the exercise title). Null for every other kind.'),
  hook: z.string().nullable().describe('Used by "intro" only: one warm sentence framing why this lesson matters. Null otherwise.'),
  heading: z
    .string()
    .nullable()
    .describe(
      'Used by "concept", "example", "comparison", "timeline", "decisionTree", "stat", "scenario", and "sequence" as the card heading. Null otherwise.'
    ),
  body: z.string().nullable().describe('Used by "concept" only: 2-4 sentences explaining one idea. Null otherwise.'),
  scenario: z.string().nullable().describe('Used by "example" only: a short, concrete real-world scenario. Null otherwise.'),
  takeaway: z.string().nullable().describe('Used by "example" only: one sentence on what to take from the scenario. Null otherwise.'),
  leftLabel: z.string().nullable().describe('Used by "comparison" only.'),
  leftItems: z.array(z.string()).nullable().describe('Used by "comparison" only.'),
  rightLabel: z.string().nullable().describe('Used by "comparison" only.'),
  rightItems: z.array(z.string()).nullable().describe('Used by "comparison" only.'),
  steps: z
    .array(z.string())
    .nullable()
    .describe(
      'Used by "timeline" (an ordered sequence of steps, shown in that order) and "sequence" (the same kind of ordered list, but shown shuffled and the caregiver taps them back into the order given here — so still author these in the single correct order). Null otherwise.'
    ),
  branches: z
    .array(z.object({ condition: z.string(), action: z.string() }))
    .nullable()
    .describe('Used by "decisionTree" only: 2-4 "if this, try that" branches.'),
  statText: z.string().nullable().describe('Used by "stat" only: a short, striking figure or fact, e.g. "2-3 wks".'),
  detail: z.string().nullable().describe('Used by "stat" only: one sentence of context for the figure.'),
  question: z.string().nullable().describe('Used by "quiz" only.'),
  options: z.array(z.string()).nullable().describe('Used by "quiz" only: 3-4 answer choices.'),
  correctIndex: z.number().nullable().describe('Used by "quiz" only: index into options of the correct answer.'),
  explanation: z.string().nullable().describe('Used by "quiz" only: why that answer is correct, shown after the caregiver picks.'),
  prompt: z.string().nullable().describe('Used by "reflection" only: one open reflection question.'),
  instructions: z
    .string()
    .nullable()
    .describe(
      'Used by "exercise" (one concrete, doable practice exercise to try with the family today) and optionally by "sequence" (a short instruction like "put these in the order they should happen"). Null otherwise.'
    ),
  situation: z
    .string()
    .nullable()
    .describe('Used by "scenario" only: a short, realistic situation the caregiver has to respond to. Null otherwise.'),
  scenarioOptions: z
    .array(z.object({ text: z.string(), feedback: z.string() }))
    .nullable()
    .describe(
      'Used by "scenario" only: 2-4 realistic response options, each with its own feedback explaining what tends to happen with that response — there is no single "correct" option like a quiz. Null otherwise.'
    ),
});

export const personalizedLessonSchema = z.object({
  title: z.string().describe('A short, specific lesson title naming this exact situation, not a generic topic.'),
  summary: z.string().describe('One sentence describing what this mini-course covers.'),
  estimatedMinutes: z.number().describe('Roughly how many minutes this lesson takes to go through, typically 4 to 8.'),
  cards: z
    .array(generatedLessonCardSchema)
    .min(5)
    .max(10)
    .describe(
      'Between 5 and 10 cards forming one complete, focused mini-course on this specific situation. Together they should cover, in a natural order: why the situation likely happened, the relevant psychological or developmental concept behind it, an evidence-based strategy, step-by-step actions to take, a common mistake to avoid, a practice exercise, a reflection question, and a suggested next step. Not every single one of those needs its own card — combine or prioritize based on what is most useful for this specific situation — but the sequence should feel complete, specific to what was described, and never generic or repetitive. Reach for "scenario" (a realistic decision-point with several response options and per-option feedback) and "sequence" (an ordering activity for a set of steps) wherever they would genuinely fit this specific situation better than a plain concept or timeline card — not on every lesson, only when they add real interactivity.'
    ),
});

export type PersonalizedLessonAiResult = z.infer<typeof personalizedLessonSchema>;
export type GeneratedLessonCard = z.infer<typeof generatedLessonCardSchema>;
