import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { BackButton, Card, Button, ConfirmDialog, SpeechBubble } from '../../src/components/ui';
import { AnimatedMascot } from '../../src/components/Mascot';
import { SettingsGroup } from '../../src/features/settings/SettingsGroup';
import { SettingsRow } from '../../src/features/settings/SettingsRow';
import { ChatIcon, ChevronLeftIcon } from '../../src/components/icons';

const FAQ_ITEMS = [
  {
    question: 'Is Otter Companion a diagnosis or medical tool?',
    answer:
      "No. Otter Companion helps you track patterns and get gentle support, but it never diagnoses your child. Always talk to a doctor or therapist for medical guidance.",
  },
  {
    question: 'Can I use this for more than one child?',
    answer:
      'Yes. Add a Kid Profile for each child from Settings, and switch between them anytime — Daily Log, Help Bot, and progress all follow whichever child is selected.',
  },
  {
    question: 'Is my data private?',
    answer:
      "Everything you log stays on this device by default. You can choose to share anonymized data to help improve recommendations from Privacy & Data settings.",
  },
  {
    question: 'What happens if I skip the assessment?',
    answer: 'Nothing is lost — you can complete it anytime from Settings, and the app works fine in the meantime.',
  },
];

export default function SupportScreen() {
  const { color, spacing, typography } = useTheme();
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showThankYou, setShowThankYou] = useState(false);

  function submitFeedback() {
    if (!feedbackText.trim()) return;
    setFeedbackText('');
    setShowThankYou(true);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <AnimatedMascot size={40} motion="idle" />
          <SpeechBubble text="I'm always here if something isn't working, or you just want to say hi." />
        </View>

        <SettingsGroup>
          <SettingsRow
            icon={ChatIcon}
            label="Contact Support"
            onPress={() => setNotice("Live support isn't available yet, but Feedback below reaches our team.")}
          />
        </SettingsGroup>

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.label, { color: color.textPrimary }]}>Frequently Asked Questions</Text>
          <View style={{ gap: spacing.sm }}>
            {FAQ_ITEMS.map((item, i) => {
              const expanded = expandedIndex === i;
              return (
                <Pressable
                  key={item.question}
                  onPress={() => setExpandedIndex(expanded ? null : i)}
                  style={{ backgroundColor: color.surface, borderRadius: 16, padding: spacing.md, gap: spacing.sm }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <Text style={[typography.bodyEmphasis, { color: color.textPrimary, flex: 1 }]}>{item.question}</Text>
                    <View style={{ transform: [{ rotate: expanded ? '90deg' : '-90deg' }] }}>
                      <ChevronLeftIcon size={16} color={color.textSecondary} />
                    </View>
                  </View>
                  {expanded && <Text style={[typography.body, { color: color.textSecondary }]}>{item.answer}</Text>}
                </Pressable>
              );
            })}
          </View>
        </View>

        <Card style={{ gap: spacing.sm, alignItems: 'center' }}>
          <AnimatedMascot size={56} motion="idle" />
          <Text style={[typography.h3, { color: color.textPrimary }]}>About Otter Companion</Text>
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
            Built to help ADHD caregivers feel a little less alone, one small moment at a time.
          </Text>
          <Text style={[typography.caption, { color: color.textSecondary }]}>Version 1.0.0</Text>
        </Card>

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.label, { color: color.textPrimary }]}>Feedback</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
            Tell us what's working, what isn't, or what you wish the app could do.
          </Text>
          <TextInput
            value={feedbackText}
            onChangeText={setFeedbackText}
            placeholder="Share your thoughts..."
            placeholderTextColor={color.textSecondary}
            multiline
            style={{
              minHeight: 90,
              textAlignVertical: 'top',
              backgroundColor: color.surface,
              borderRadius: 16,
              padding: spacing.md,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              color: color.textPrimary,
            }}
          />
          <Button label="Send Feedback" onPress={submitFeedback} />
        </View>
      </ScrollView>

      <ConfirmDialog visible={!!notice} title="Coming soon" message={notice ?? ''} confirmLabel="Got it" onConfirm={() => setNotice(null)} />

      <ConfirmDialog
        visible={showThankYou}
        title="Thank you!"
        message="Your feedback helps shape what we build next. We really appreciate you taking the time."
        confirmLabel="You're welcome"
        onConfirm={() => setShowThankYou(false)}
      />
    </SafeAreaView>
  );
}
