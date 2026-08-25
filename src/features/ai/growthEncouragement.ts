import { z } from 'zod';
import { askClaudeStructured } from './anthropicClient';
import { buildFamilyContext, FamilyContextInput } from './familyContext';
import { GrowthDimension } from '../growth/types';

const growthEncouragementSchema = z.object({
  message: z
    .string()
    .describe(
      'One to three warm, specific sentences for the caregiver, grounded only in the real data given — never generic, never invented improvement that isn\'t actually there. If the data is mixed or flat, focus on effort and consistency rather than manufacturing a win.'
    ),
  strategyReminder: z
    .string()
    .nullable()
    .describe('A brief reminder of one specific strategy that has evidently helped this family before, only if one is clearly evident from their history — otherwise null.'),
});

const SYSTEM = `You are an experienced parenting coach reviewing a caregiver's own progress over the last several weeks, inside an app called Otter Companion — not the child's behavior, the CAREGIVER'S growth: their regulation, consistency, confidence, communication, and stress recovery. These are proxy measurements computed from real app usage, not a clinical assessment, so don't overstate precision. Your job is to notice something real and specific in the data and reflect it back warmly, remind the caregiver that progress in this work is gradual and non-linear, and — only when genuinely evident from their history — remind them of one strategy that has helped before. Never invent a win that isn't in the data. If the numbers are flat or mixed, it is completely fine, and more honest, to acknowledge the effort of showing up consistently rather than claiming improvement that didn't happen.`;

export async function getGrowthEncouragement(
  dimensions: GrowthDimension[],
  familyContextInput: FamilyContextInput
): Promise<{ message: string; strategyReminder: string | null }> {
  const context = buildFamilyContext(familyContextInput);
  const dimensionSummary = dimensions
    .map(
      (d) =>
        `- ${d.label}: ${d.trend}${d.overallScore !== null ? `, recent score ${d.overallScore}/100` : ', not enough data yet'} (${d.description})${
          d.trendExplanation ? ` Real change observed: ${d.trendExplanation}` : ''
        }`
    )
    .join('\n');

  return askClaudeStructured({
    system: `${SYSTEM}\n\nWhat you know about this family:\n${context}`,
    messages: [{ role: 'user', content: `Here is this caregiver's growth data over the last several weeks:\n\n${dimensionSummary}` }],
    schema: growthEncouragementSchema,
    maxTokens: 768,
    thinkingEnabled: false,
  });
}
