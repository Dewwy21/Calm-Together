import { AiVoiceStyle, ReadingSpeed } from '../preferences/types';

// Baseline narration voice — used whenever no preference has loaded yet.
// Slightly slower and very slightly lower than the default (1.0 / 1.0):
// reads as calmer and more patient without sounding artificially slow or
// robotic. "Warm" + "normal" below reproduce this baseline exactly.
export const VOICE_CONFIG = {
  /**
   * A specific platform voice identifier, as returned by
   * expo-speech's `Speech.getAvailableVoicesAsync()`. Leave as `null` to
   * use the system default voice.
   */
  voiceIdentifier: null as string | null,
  language: 'en-US',
  rate: 0.92,
  pitch: 0.95,
} as const;

// Small deltas layered on the baseline above, driven by the caregiver's
// "Preferred AI Voice" and "Reading Speed" settings (see Preferences
// screen). Kept as gentle nudges rather than wildly different voices, since
// the underlying system voice doesn't change — only its pacing/pitch.
const VOICE_STYLE_PITCH_DELTA: Record<AiVoiceStyle, number> = {
  warm: 0,
  calm: -0.06,
  bright: 0.08,
};

const READING_SPEED_RATE_MULTIPLIER: Record<ReadingSpeed, number> = {
  slower: 0.85,
  normal: 1,
  faster: 1.2,
};

export function resolveVoiceParams(aiVoiceStyle: AiVoiceStyle, readingSpeed: ReadingSpeed) {
  return {
    voiceIdentifier: VOICE_CONFIG.voiceIdentifier,
    language: VOICE_CONFIG.language,
    rate: VOICE_CONFIG.rate * READING_SPEED_RATE_MULTIPLIER[readingSpeed],
    pitch: VOICE_CONFIG.pitch + VOICE_STYLE_PITCH_DELTA[aiVoiceStyle],
  };
}
