import React, { useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Button, BackButton, ConfirmDialog, Card } from '../../src/components/ui';
import { AnimatedMascot } from '../../src/components/Mascot';
import { DisclaimerNote } from '../../src/features/aiEngine/DisclaimerNote';
import { getActCoachingResponse, ActCoachResult } from '../../src/features/actCoach/actCoachEngine';
import { sanitizeParentMessage, MAX_MESSAGE_LENGTH } from '../../src/features/actCoach/sanitizeInput';
import { AiUnavailableError } from '../../src/features/ai/anthropicClient';
import { handleComposerKeyPress } from '../../src/utils/composerKeyPress';
import { MASCOT_POSES } from '../../src/components/Mascot';

type Status = 'idle' | 'loading' | 'ready' | 'error';

export default function ActCoachScreen() {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();

  const [inputText, setInputText] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [result, setResult] = useState<ActCoachResult | null>(null);
  const [lastMessage, setLastMessage] = useState('');
  const [showEmptyNotice, setShowEmptyNotice] = useState(false);
  // A ref, not state — guards against a single Enter keypress (or a fast
  // double-tap on the button) firing two submissions before React has
  // re-rendered with status:'loading'. State reads inside the same
  // synchronous burst would still see the old 'idle' value; a ref mutates
  // immediately, so the second call sees it and bails.
  const submittingRef = useRef(false);

  async function submit(message: string) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setLastMessage(message);
    setStatus('loading');
    try {
      const r = await getActCoachingResponse(message);
      setResult(r);
      setStatus('ready');
    } catch (err) {
      setStatus('error');
      // eslint-disable-next-line no-console
      if (!(err instanceof AiUnavailableError)) console.error('[ActCoach] unexpected error:', err);
    } finally {
      submittingRef.current = false;
    }
  }

  function handleSubmit() {
    const cleaned = sanitizeParentMessage(inputText);
    if (!cleaned) {
      setShowEmptyNotice(true);
      return;
    }
    setInputText('');
    submit(cleaned);
  }

  function handleKeyPress(e: any) {
    handleComposerKeyPress(e, handleSubmit);
  }

  function askAnother() {
    setStatus('idle');
    setResult(null);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <View style={{ marginLeft: spacing.sm }}>
          <Text style={[typography.h1, { color: color.textPrimary }]}>ACT Parenting Coach</Text>
          <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Describe what's going on — get an ACT-based read on it</Text>
        </View>
      </View>

      {status === 'idle' && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1 }}>
            <Text style={[typography.body, { color: color.textSecondary }]}>
              Tell me what's happening with your child or in your own reactions right now. I'll reflect back which ACT process is at
              play and offer a small next step.
            </Text>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              onKeyPress={handleKeyPress}
              placeholder="What's the challenge right now?"
              placeholderTextColor={color.textSecondary}
              multiline
              maxLength={MAX_MESSAGE_LENGTH}
              style={{
                minHeight: 140,
                backgroundColor: color.surface,
                borderRadius: radii.lg,
                padding: spacing.lg,
                fontFamily: typography.body.fontFamily,
                fontSize: typography.body.fontSize,
                color: color.textPrimary,
                textAlignVertical: 'top',
              }}
            />
            <Text style={[typography.caption, { color: color.textSecondary, textAlign: 'right' }]}>
              {inputText.length} / {MAX_MESSAGE_LENGTH}
            </Text>
          </ScrollView>

          <View style={{ padding: spacing.lg }}>
            <Pressable
              onPress={handleSubmit}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                backgroundColor: color.primary,
                borderRadius: radii.lg,
                paddingVertical: spacing.md,
              }}
            >
              <Text style={[typography.bodyEmphasis, { color: color.textOnPrimary }]}>Get Coaching</Text>
              <Text style={{ color: color.textOnPrimary, fontSize: 16 }}>→</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}

      {status === 'loading' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
          <AnimatedMascot size={90} motion={MASCOT_POSES.thinking.motion} propIcon={MASCOT_POSES.thinking.propIcon} />
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl }]}>
            Thinking this through...
          </Text>
        </View>
      )}

      {status === 'error' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl }}>
          <AnimatedMascot size={90} motion="idle" />
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
            I'm having trouble putting this together right now. Mind trying again in a moment?
          </Text>
          <Button label="Try Again" onPress={() => submit(lastMessage)} />
          <Button label="Back" variant="secondary" onPress={() => setStatus('idle')} />
        </View>
      )}

      {status === 'ready' && result && (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
          {result.kind === 'safety' ? (
            <>
              <AnimatedMascot size={90} motion="idle" />
              <Text style={[typography.body, { color: color.textPrimary }]}>{result.text}</Text>
            </>
          ) : (
            <>
              <Card>
                <Text style={[typography.label, { color: color.textSecondary, letterSpacing: 1 }]}>IDENTIFIED PROCESS(ES)</Text>
                <Text style={[typography.bodyEmphasis, { color: color.textPrimary, marginTop: 4 }]}>{result.process}</Text>
              </Card>
              <Card>
                <Text style={[typography.label, { color: color.textSecondary, letterSpacing: 1 }]}>CLINICAL LOGIC</Text>
                <Text style={[typography.body, { color: color.textPrimary, marginTop: 4 }]}>{result.logic}</Text>
              </Card>
              <View
                style={[
                  { backgroundColor: color.accentTint, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.xs },
                  shadows.card,
                ]}
              >
                <Text style={[typography.label, { color: color.textSecondary, letterSpacing: 1 }]}>INTERVENTION RESPONSE</Text>
                <Text style={[typography.body, { color: color.textPrimary }]}>{result.response}</Text>
              </View>
              <DisclaimerNote style={{ textAlign: 'center', marginTop: spacing.sm }} />
            </>
          )}

          <Button label="Ask About Something Else" onPress={askAnother} style={{ marginTop: spacing.md }} />
        </ScrollView>
      )}

      <ConfirmDialog
        visible={showEmptyNotice}
        title="Nothing to send yet"
        message="Type what's going on first, then I can take a look."
        confirmLabel="Got it"
        onConfirm={() => setShowEmptyNotice(false)}
      />
    </SafeAreaView>
  );
}
