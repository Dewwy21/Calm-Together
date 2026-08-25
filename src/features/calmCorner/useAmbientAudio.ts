import { useEffect } from 'react';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

const AMBIENT_SOURCE = require('../../../assets/audio/calm-mind.mp3');

// Shared ambient track for Calm Corner. Off by default: audio should never
// start on its own when a screen opens, only when the caregiver asks for it.
export function useAmbientAudio() {
  const player = useAudioPlayer(AMBIENT_SOURCE);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    player.loop = true;
  }, [player]);

  function toggle() {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  return { isPlaying: status.playing, toggle };
}
