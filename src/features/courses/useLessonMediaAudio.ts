import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

// expo-audio's useAudioPlayer accepts a remote HTTPS URL directly (also
// `null`, for the not-yet-provided placeholder state) — no download step,
// no new dependency beyond what Calm Corner's ambient audio already uses.
export function useLessonMediaAudio(sourceUrl: string | null) {
  const player = useAudioPlayer(sourceUrl);
  const status = useAudioPlayerStatus(player);

  function toggle() {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  return { isPlaying: status.playing, toggle };
}
