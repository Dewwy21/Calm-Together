import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, Easing } from 'react-native';
import { useTheme } from '../../theme';
import { AnimatedMascot } from '../../components/Mascot';
import { StarIcon, HeartIcon } from '../../components/icons';

const ICONS = [StarIcon, HeartIcon];

interface AuthLoadingOverlayProps {
  messages: string[];
}

// The same "make a wait feel intentional" recipe as onboarding's
// OnboardingProcessing (pulsing circle + floating mascot + rotating short
// messages), at a smaller scale — used for signup/login/reset submissions
// instead of a bare spinner, which this app never uses anywhere else.
export function AuthLoadingOverlay({ messages }: AuthLoadingOverlayProps) {
  const { color, spacing, typography } = useTheme();
  const [messageIndex, setMessageIndex] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;
  const messageDuration = 900;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.12, duration: messageDuration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: messageDuration / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => setMessageIndex((i) => (i + 1) % messages.length), messageDuration);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl }}>
      <View style={{ alignItems: 'center', justifyContent: 'center', height: 130 }}>
        <Animated.View
          style={{
            position: 'absolute',
            width: 110,
            height: 110,
            borderRadius: 999,
            backgroundColor: color.secondaryTint,
            transform: [{ scale }],
          }}
        />
        <AnimatedMascot size={80} motion="float" propIcon={ICONS[messageIndex % ICONS.length]} />
      </View>
      <Text style={[typography.bodyEmphasis, { color: color.textPrimary, textAlign: 'center' }]}>{messages[messageIndex]}</Text>
    </View>
  );
}
