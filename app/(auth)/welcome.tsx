import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Button, SpeechBubble } from '../../src/components/ui';
import { Mascot } from '../../src/components/Mascot';

export default function WelcomeScreen() {
  const { color, spacing, typography } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.xl, padding: spacing.xl }}>
        <Mascot size={130} />
        <Text style={[typography.h1, { color: color.textPrimary, textAlign: 'center' }]}>Welcome to Otter Companion</Text>
        <SpeechBubble text="A calm, steady companion for the everyday work of raising a kid with ADHD. Let's get you set up." />
      </View>

      <View style={{ padding: spacing.lg, gap: spacing.md }}>
        <Button label="Log In" onPress={() => router.push('/(auth)/login')} />
        <Button label="Create Account" variant="secondary" onPress={() => router.push('/(auth)/signup')} />
      </View>
    </SafeAreaView>
  );
}
