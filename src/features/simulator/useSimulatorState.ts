import { useState } from 'react';
import { SimulatorMessage, SimulatorScenario, SimulatorCoaching } from './types';
import { getChildReply, getCoachingSummary } from '../ai/simulatorEngine';
import { createId } from '../logEvent/eventStorage';
import { ChildProfile } from '../profiles/types';
import { useBlueprintContext } from '../blueprint/BlueprintProvider';
import { serializeBlueprintSections } from '../blueprint/blueprintHelpers';
import { SafetyTriggeredError } from '../aiEngine/safetyError';
import { getSafetyResponse } from '../aiEngine/safetyTriage';

export type SimulatorStatus = 'active' | 'thinking' | 'replyFailed' | 'coaching' | 'coachingFailed' | 'finished' | 'safety';

export function useSimulatorState(scenario: SimulatorScenario, child: ChildProfile | null, therapistMode: boolean, intensity: number) {
  const { blueprint, noteInteraction, noteSafetyEvent } = useBlueprintContext();
  const [messages, setMessages] = useState<SimulatorMessage[]>([]);
  const [status, setStatus] = useState<SimulatorStatus>('active');
  const [coaching, setCoaching] = useState<SimulatorCoaching | null>(null);
  const [safetyText, setSafetyText] = useState<string | null>(null);

  async function requestChildReply(history: SimulatorMessage[]) {
    setStatus('thinking');
    try {
      const reply = await getChildReply(history, scenario, child, intensity);
      setMessages((prev) => [...prev, { id: createId(), role: 'child', text: reply, createdAtISO: new Date().toISOString() }]);
      setStatus('active');
    } catch (err) {
      if (err instanceof SafetyTriggeredError) {
        setSafetyText(getSafetyResponse(err.category).text);
        setStatus('safety');
        noteSafetyEvent('simulator', err.category);
        return;
      }
      setStatus('replyFailed');
    }
  }

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const caregiverMessage: SimulatorMessage = {
      id: createId(),
      role: 'caregiver',
      text: trimmed,
      createdAtISO: new Date().toISOString(),
    };
    const historyForEngine = [...messages, caregiverMessage];
    setMessages(historyForEngine);
    requestChildReply(historyForEngine);
  }

  function retryReply() {
    requestChildReply(messages);
  }

  async function endSession() {
    setStatus('coaching');
    try {
      const blueprintSummary = blueprint ? serializeBlueprintSections(blueprint, 4) : undefined;
      const result = await getCoachingSummary(messages, scenario, therapistMode, blueprintSummary);
      setCoaching(result);
      setStatus('finished');
      const transcript = messages.map((m) => `${m.role === 'caregiver' ? 'Caregiver' : 'Child'}: ${m.text}`).join('\n');
      noteInteraction(
        'simulator',
        `Scenario: ${scenario.title}.\nTranscript:\n${transcript}\n\nCoaching given — what worked: ${result.whatWorked.join('; ')}. Try next time: ${result.tryNextTime.join('; ')}.`
      );
    } catch {
      setStatus('coachingFailed');
    }
  }

  return { messages, status, coaching, safetyText, sendMessage, retryReply, endSession };
}
