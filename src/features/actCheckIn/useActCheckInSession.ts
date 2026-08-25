import { useState } from 'react';
import { useProfilesContext } from '../profiles/ProfilesProvider';
import { useFamilyContextInput } from '../ai/useFamilyContextInput';
import { useBlueprintContext } from '../blueprint/BlueprintProvider';
import { generateActCheckInFollowUp } from '../ai/actCheckInEngine';
import { SafetyTriggeredError } from '../aiEngine/safetyError';
import { getSafetyResponse } from '../aiEngine/safetyTriage';
import { createId } from '../logEvent/eventStorage';
import { ACT_STEP_LABELS, ActAnswerRecord, ActScenario, ActSessionRecord } from './types';
import { getCategoryById } from './actContent';
import { loadActCheckInSessions, persistActCheckInSessions } from './actCheckInStorage';

interface QuestionAnswerState {
  chosen: string;
  note: string;
  submittedNote?: string;
  aiReply?: string;
  sending: boolean;
  safetyText?: string;
}

export function useActCheckInSession(scenario: ActScenario) {
  const { currentChildId } = useProfilesContext();
  const familyContext = useFamilyContextInput();
  const { noteInteraction, noteSafetyEvent } = useBlueprintContext();

  const [beatIndex, setBeatIndex] = useState(0);
  const [answersByBeat, setAnswersByBeat] = useState<Record<string, QuestionAnswerState>>({});
  const [startedAtISO] = useState(() => new Date().toISOString());
  const [completed, setCompleted] = useState(false);

  const beat = scenario.beats[beatIndex];
  const isLast = beatIndex === scenario.beats.length - 1;
  const currentAnswer = beat.kind === 'question' ? answersByBeat[beat.id] : undefined;
  const canContinue = beat.kind !== 'question' || !!currentAnswer?.chosen;

  function chooseOption(option: string) {
    if (beat.kind !== 'question') return;
    setAnswersByBeat((prev) => ({ ...prev, [beat.id]: { chosen: option, note: '', sending: false } }));
  }

  function setNoteText(text: string) {
    if (beat.kind !== 'question') return;
    setAnswersByBeat((prev) => ({ ...prev, [beat.id]: { ...prev[beat.id], note: text } }));
  }

  async function submitNote() {
    if (beat.kind !== 'question') return;
    const current = answersByBeat[beat.id];
    const note = current?.note.trim();
    if (!current || !note) return;

    setAnswersByBeat((prev) => ({ ...prev, [beat.id]: { ...prev[beat.id], sending: true } }));
    try {
      const response = await generateActCheckInFollowUp({
        stepLabel: ACT_STEP_LABELS[beat.step],
        questionPrompt: beat.prompt,
        chosenOption: current.chosen,
        priorExchange: [],
        caregiverNote: note,
        familyContextInput: familyContext,
      });
      setAnswersByBeat((prev) => ({
        ...prev,
        [beat.id]: { ...prev[beat.id], sending: false, submittedNote: note, aiReply: response.reply },
      }));
    } catch (err) {
      if (err instanceof SafetyTriggeredError) {
        setAnswersByBeat((prev) => ({
          ...prev,
          [beat.id]: { ...prev[beat.id], sending: false, submittedNote: note, safetyText: getSafetyResponse(err.category).text },
        }));
        noteSafetyEvent('actCheckIn', err.category);
        return;
      }
      setAnswersByBeat((prev) => ({
        ...prev,
        [beat.id]: {
          ...prev[beat.id],
          sending: false,
          submittedNote: note,
          aiReply: "I'm having a little trouble connecting right now, but I heard you — let's keep going.",
        },
      }));
    }
  }

  function finishSession() {
    setCompleted(true);
    const answers: ActAnswerRecord[] = scenario.beats
      .filter((b) => b.kind === 'question')
      .map((b) => {
        const a = answersByBeat[b.id];
        return {
          beatId: b.id,
          step: b.step,
          prompt: b.kind === 'question' ? b.prompt : '',
          chosenOption: a?.chosen ?? '',
          note: a?.submittedNote,
          aiReply: a?.aiReply,
        };
      });

    const record: ActSessionRecord = {
      id: createId(),
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      categoryTitle: getCategoryById(scenario.categoryId)?.title ?? '',
      startedAtISO,
      completedAtISO: new Date().toISOString(),
      answers,
    };

    if (currentChildId) {
      loadActCheckInSessions(currentChildId).then((existing) => persistActCheckInSessions(currentChildId, [...existing, record]));
    }

    const summaryLines = answers.map((a) => `${ACT_STEP_LABELS[a.step]}: chose "${a.chosenOption}"${a.note ? ` — added: ${a.note}` : ''}`);
    noteInteraction(
      'actCheckIn',
      `Completed the ACT Parenting Check-In for "${scenario.title}".\n${summaryLines.join('\n')}`
    );
  }

  function goNext() {
    if (!canContinue) return;
    if (isLast) {
      finishSession();
      return;
    }
    setBeatIndex((i) => i + 1);
  }

  function goBack() {
    setBeatIndex((i) => Math.max(0, i - 1));
  }

  return {
    beat,
    beatIndex,
    totalBeats: scenario.beats.length,
    currentAnswer,
    canContinue,
    completed,
    chooseOption,
    setNoteText,
    submitNote,
    goNext,
    goBack,
  };
}
