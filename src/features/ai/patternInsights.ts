import { z } from 'zod';
import { askClaudeStructured } from './anthropicClient';
import { buildFamilyContext, FamilyContextInput } from './familyContext';
import { DetectedPattern, PatternInterpretation } from '../patterns/types';

const patternInsightsSchema = z.object({
  insights: z
    .array(
      z.object({
        patternId: z.string().describe('Must exactly match one of the pattern ids provided in the prompt.'),
        interpretation: z
          .string()
          .describe(
            'One or two warm, plain-language sentences on what this pattern might mean and why it could be happening, grounded in real developmental/behavioral understanding — not alarming, not clinical-sounding.'
          ),
        suggestedLessonTopic: z
          .string()
          .nullable()
          .describe('A short, specific mini-lesson topic this pattern points to, or null if nothing clearly follows from it.'),
      })
    )
    .describe('Exactly one entry per pattern id given, in the same order.'),
});

const SYSTEM = `You are an experienced parenting coach helping a caregiver understand patterns already detected in their own Daily Log and Calm Corner data, inside an app called Otter Companion. The factual numbers in each pattern (counts, times, averages) were computed directly from the caregiver's own data — treat them as ground truth, don't second-guess or restate them, just interpret what they might mean. For each pattern, write one or two warm, specific, plain-language sentences on why this might be happening, drawing on real understanding of ADHD, executive function, and family dynamics. Never sound alarming or clinical. If a pattern clearly points to a useful mini-lesson topic, name a short, specific one; otherwise leave it null — don't force a suggestion that isn't warranted.`;

export async function getPatternInterpretations(
  patterns: DetectedPattern[],
  familyContextInput: FamilyContextInput
): Promise<PatternInterpretation[]> {
  if (patterns.length === 0) return [];

  const context = buildFamilyContext(familyContextInput);
  const patternList = patterns
    .map((p) => `- id: "${p.id}"\n  title: ${p.title}\n  factual summary: ${p.summary}`)
    .join('\n');

  const result = await askClaudeStructured({
    system: `${SYSTEM}\n\nWhat you know about this family:\n${context}`,
    messages: [{ role: 'user', content: `Here are the patterns detected in this family's data:\n\n${patternList}` }],
    schema: patternInsightsSchema,
    maxTokens: 1536,
    thinkingEnabled: true,
  });

  return result.insights;
}
