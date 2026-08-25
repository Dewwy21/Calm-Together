import { useEffect, useRef, useState } from 'react';
import * as Speech from 'expo-speech';
import { resolveVoiceParams } from './voiceConfig';
import { usePreferencesContext } from '../preferences/PreferencesProvider';

// Thin wrapper around expo-speech. Callers decide *when* to speak (a
// reflection message arriving, a new exercise step); this hook just tracks
// speaking state and guarantees cleanup on unmount so nothing keeps talking
// after a caregiver navigates away. Rate/pitch come from the caregiver's
// "Preferred AI Voice" and "Reading Speed" settings (see voiceConfig.ts),
// so changing either in Preferences immediately changes narration
// everywhere this hook is used.
export function useSpeech() {
  const { preferences } = usePreferencesContext();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      Speech.stop();
    };
  }, []);

  function speak(text: string, options?: { onFinish?: () => void }) {
    Speech.stop();
    setIsSpeaking(true);
    const handleFinished = () => {
      if (mountedRef.current) setIsSpeaking(false);
    };
    const voiceParams = resolveVoiceParams(preferences.aiVoiceStyle, preferences.readingSpeed);
    Speech.speak(text, {
      language: voiceParams.language,
      rate: voiceParams.rate,
      pitch: voiceParams.pitch,
      voice: voiceParams.voiceIdentifier ?? undefined,
      // Only a genuine finish (onDone) counts as "completed" — a manual
      // stop or an error shouldn't trigger a completion celebration.
      onDone: () => {
        handleFinished();
        if (mountedRef.current) options?.onFinish?.();
      },
      onStopped: handleFinished,
      onError: handleFinished,
    });
  }

  function stop() {
    Speech.stop();
    setIsSpeaking(false);
  }

  return { isSpeaking, speak, stop };
}
