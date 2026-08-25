import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useTheme } from '../../theme';
import { AnimatedMascot } from '../../components/Mascot';
import { ShellIcon, BookIcon, RiverIcon, StarIcon } from '../../components/icons';

const MESSAGES = [
  "Getting to know your family's strengths...",
  'Personalizing your experience...',
  'Preparing recommendations just for you...',
  'Almost ready...',
];

// One themed scenery icon per message, so the wait feels like the otter is
// actually doing something (collecting shells, organizing journals,
// floating downriver) rather than staring at a generic spinner.
const ICONS = [ShellIcon, BookIcon, RiverIcon, StarIcon];

const MESSAGE_DURATION_MS = 1750; // 4 messages * 1.75s = 7s total

interface OnboardingProcessingProps {
  onDone: () => void;
}

export function OnboardingProcessing({ onDone }: OnboardingProcessingProps) {
  const { color, spacing, typography } = useTheme();
  const [messageIndex, setMessageIndex] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.15, duration: MESSAGE_DURATION_MS / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: MESSAGE_DURATION_MS / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  useEffect(() => {
    if (messageIndex >= MESSAGES.length - 1) {
      const finishTimer = setTimeout(onDone, MESSAGE_DURATION_MS);
      return () => clearTimeout(finishTimer);
    }
    const timer = setTimeout(() => setMessageIndex((i) => i + 1), MESSAGE_DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageIndex]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['2xl'] }}>
      <View style={{ alignItems: 'center', justifyContent: 'center', height: 180 }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: 999,
            backgroundColor: color.secondaryTint,
            transform: [{ scale }],
          }}
        />
        <AnimatedMascot size={120} motion="float" propIcon={ICONS[messageIndex % ICONS.length]} />
      </View>
      <Text style={[typography.h3, { color: color.textPrimary, textAlign: 'center' }]}>{MESSAGES[messageIndex]}</Text>
    </View>
  );
}
