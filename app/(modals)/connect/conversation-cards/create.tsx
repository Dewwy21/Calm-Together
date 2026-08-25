import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../src/theme';
import { Button, BackButton, ConfirmDialog } from '../../../../src/components/ui';
import { ChoiceButton } from '../../../../src/features/onboarding/ChoiceButton';
import { CONVERSATION_CATEGORIES, ConversationCategory } from '../../../../src/features/connect/conversationCardsData';
import { useConversationCardsContext } from '../../../../src/features/connect/ConversationCardsProvider';

export default function CreateConversationCardScreen() {
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const { addCustomCard } = useConversationCardsContext();

  const [text, setText] = useState('');
  const [category, setCategory] = useState<ConversationCategory | undefined>();
  const [note, setNote] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const canSave = text.trim().length > 0 && !!category;

  function handleSave() {
    if (!canSave || !category) return;
    addCustomCard({ text: text.trim(), category, note: note.trim() || undefined });
    setShowCelebration(true);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>New Card</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.label, { color: color.textPrimary }]}>Your question</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="What do you want to ask?"
            placeholderTextColor={color.textSecondary}
            multiline
            style={{
              minHeight: 80,
              textAlignVertical: 'top',
              backgroundColor: color.surface,
              borderRadius: radii.md,
              padding: spacing.md,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              color: color.textPrimary,
            }}
          />
        </View>

        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.label, { color: color.textPrimary }]}>Category</Text>
          {CONVERSATION_CATEGORIES.map((c) => (
            <ChoiceButton key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </View>

        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.label, { color: color.textPrimary }]}>Note (optional)</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Why did you create this one?</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Anything worth remembering about this question..."
            placeholderTextColor={color.textSecondary}
            multiline
            style={{
              minHeight: 60,
              textAlignVertical: 'top',
              backgroundColor: color.surface,
              borderRadius: radii.md,
              padding: spacing.md,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              color: color.textPrimary,
            }}
          />
        </View>

        <Button label="Save Card" onPress={handleSave} disabled={!canSave} />
      </ScrollView>

      <ConfirmDialog
        visible={showCelebration}
        title="Card added!"
        message="Your question is saved and will show up right alongside the rest, including in random sessions."
        confirmLabel="Nice"
        onConfirm={() => {
          setShowCelebration(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}
