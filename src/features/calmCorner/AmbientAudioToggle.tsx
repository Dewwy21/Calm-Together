import React from 'react';
import { ToggleChip } from '../../components/ui';
import { SpeakerIcon } from '../../components/icons';
import { useAmbientAudio } from './useAmbientAudio';

export function AmbientAudioToggle() {
  const { isPlaying, toggle } = useAmbientAudio();

  return (
    <ToggleChip
      icon={SpeakerIcon}
      active={isPlaying}
      onPress={toggle}
      activeLabel="Calm sounds on"
      inactiveLabel="Play calm sounds"
    />
  );
}
