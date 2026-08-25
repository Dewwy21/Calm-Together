import { ClaudeChatMessage } from './anthropicClient';
import { runConversationTurn } from '../aiEngine/conversationEngine';
import { assessSafety } from '../aiEngine/safetyTriage';
import { SafetyTriggeredError } from '../aiEngine/safetyError';
import { buildChildSystemPrompt, buildCoachingSystemPrompt } from './simulatorPersona';
import { simulatorChildReplySchema, simulatorCoachingSchema, SimulatorCoachingResult } from './simulatorSchemas';
import { SimulatorScenario, SimulatorMessage } from '../simulator/types';
import { ChildProfile } from '../profiles/types';

function toClaudeMessages(history: SimulatorMessage[]): ClaudeChatMessage[] {
  return history.map((m) => ({
    role: m.role === 'caregiver' ? 'user' : 'assistant',
    content: m.text,
  }));
}

export async function getChildReply(
  history: SimulatorMessage[],
  scenario: SimulatorScenario,
  child: ChildProfile | null,
  intensity: number
): Promise<string> {
  // The caregiver's own typed lines get the same safety triage as any other
  // conversational input, even mid-roleplay — a real disclosure doesn't
  // stop being real just because it was typed inside a practice scenario.
  const lastCaregiverLine = [...history].reverse().find((m) => m.role === 'caregiver');
  if (lastCaregiverLine) {
    const safety = assessSafety(lastCaregiverLine.text);
    if (safety.isSafetyEvent) {
      throw new SafetyTriggeredError(safety.category);
    }
  }

  const parsed = await runConversationTurn({
    feature: 'simulator',
    system: buildChildSystemPrompt({ scenario, child, intensity }),
    messages: toClaudeMessages(history),
    schema: simulatorChildReplySchema,
    maxTokens: 400,
  });
  return parsed.reply;
}

export async function getCoachingSummary(
  history: SimulatorMessage[],
  scenario: SimulatorScenario,
  therapistMode: boolean,
  blueprintSummary?: string
): Promise<SimulatorCoachingResult> {
  const transcript = history.map((m) => `${m.role === 'caregiver' ? 'Caregiver' : 'Child'}: ${m.text}`).join('\n');

  return runConversationTurn({
    feature: 'simulator',
    system: buildCoachingSystemPrompt(therapistMode, blueprintSummary),
    messages: [{ role: 'user', content: `Scenario: ${scenario.title}\n\nHere is the full practice conversation:\n\n${transcript}` }],
    schema: simulatorCoachingSchema,
    maxTokens: 1024,
    thinkingEnabled: true,
  });
}
