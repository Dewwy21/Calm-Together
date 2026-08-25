import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Button, BackButton } from '../../src/components/ui';
import { AnimatedMascot } from '../../src/components/Mascot';
import { useCheckInContext } from '../../src/features/checkIn/CheckInProvider';

export default function WeeklyCheckInScreen() {
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const checkIn = useCheckInContext();

  const [caregiverMoodRating, setCaregiverMoodRating] = useState(6);
  const [childMoodRating, setChildMoodRating] = useState(6);
  const [biggestWin, setBiggestWin] = useState('');
  const [biggestChallenge, setBiggestChallenge] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    checkIn.submitCheckIn({ caregiverMoodRating, childMoodRating, biggestWin: biggestWin.trim(), biggestChallenge: biggestChallenge.trim() });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl }}>
          <AnimatedMascot size={100} motion="celebrate" />
          <Text style={[typography.h2, { color: color.textPrimary, textAlign: 'center' }]}>Thanks for checking in</Text>
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
            This becomes part of your Family Blueprint, so the app keeps getting a clearer picture of how things are really going.
          </Text>
        </View>
        <View style={{ padding: spacing.lg }}>
          <Button label="Done" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <View style={{ marginLeft: spacing.sm, flex: 1 }}>
          <Text style={[typography.h1, { color: color.textPrimary }]}>Weekly Check-In</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>A quick, honest look back at the week.</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.h3, { color: color.textPrimary }]}>How have you been feeling this week?</Text>
            <Slider
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={caregiverMoodRating}
              onValueChange={setCaregiverMoodRating}
              minimumTrackTintColor={color.primary}
              maximumTrackTintColor={color.surfaceAlt}
              thumbTintColor={color.primary}
            />
            <Text style={[typography.body, { color: color.textPrimary, textAlign: 'center' }]}>{caregiverMoodRating}/10</Text>
          </View>

          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.h3, { color: color.textPrimary }]}>How has your child seemed this week?</Text>
            <Slider
              minimumValue={1}
              maximumValue={10}
              step={1}
              value={childMoodRating}
              onValueChange={setChildMoodRating}
              minimumTrackTintColor={color.secondary}
              maximumTrackTintColor={color.surfaceAlt}
              thumbTintColor={color.secondary}
            />
            <Text style={[typography.body, { color: color.textPrimary, textAlign: 'center' }]}>{childMoodRating}/10</Text>
          </View>

          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.h3, { color: color.textPrimary }]}>What's a win from this week, even a small one?</Text>
            <TextInput
              value={biggestWin}
              onChangeText={setBiggestWin}
              placeholder="Something that went well..."
              placeholderTextColor={color.textSecondary}
              multiline
              style={{
                minHeight: 70,
                backgroundColor: color.surface,
                borderRadius: radii.md,
                padding: spacing.md,
                fontFamily: typography.body.fontFamily,
                fontSize: typography.body.fontSize,
                color: color.textPrimary,
                textAlignVertical: 'top',
              }}
            />
          </View>

          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.h3, { color: color.textPrimary }]}>What felt hardest this week?</Text>
            <TextInput
              value={biggestChallenge}
              onChangeText={setBiggestChallenge}
              placeholder="Whatever's been weighing on you..."
              placeholderTextColor={color.textSecondary}
              multiline
              style={{
                minHeight: 70,
                backgroundColor: color.surface,
                borderRadius: radii.md,
                padding: spacing.md,
                fontFamily: typography.body.fontFamily,
                fontSize: typography.body.fontSize,
                color: color.textPrimary,
                textAlignVertical: 'top',
              }}
            />
          </View>

          <Button label="Save Check-In" onPress={handleSubmit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
