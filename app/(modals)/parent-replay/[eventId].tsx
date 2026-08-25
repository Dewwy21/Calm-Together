import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Button, BackButton } from '../../../src/components/ui';
import { AnimatedMascot } from '../../../src/components/Mascot';
import { useDenContext } from '../../../src/features/den/DenProvider';
import { usePreferencesContext } from '../../../src/features/preferences/PreferencesProvider';
import { useFamilyContextInput } from '../../../src/features/ai/useFamilyContextInput';
import { generateParentReplay, ParentReplayResult } from '../../../src/features/ai/parentReplay';
import { useBlueprintContext } from '../../../src/features/blueprint/BlueprintProvider';
import { SafetyTriggeredError } from '../../../src/features/aiEngine/safetyError';
import { getSafetyResponse } from '../../../src/features/aiEngine/safetyTriage';
import { DisclaimerNote } from '../../../src/features/aiEngine/DisclaimerNote';

export default function ParentReplayScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const den = useDenContext();
  const { preferences } = usePreferencesContext();
  const familyContext = useFamilyContextInput();
  const { noteInteraction, noteSafetyEvent } = useBlueprintContext();

  const event = den.events.find((e) => e.id === eventId);

  const [status, setStatus] = useState<'loading' | 'error' | 'ready' | 'safety'>('loading');
  const [result, setResult] = useState<ParentReplayResult | null>(null);
  const [safetyText, setSafetyText] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!event) return;
    let cancelled = false;
    setStatus('loading');
    generateParentReplay(event, familyContext, preferences.therapistMode)
      .then((r) => {
        if (cancelled) return;
        setResult(r);
        setStatus('ready');
        const moments = r.keyMoments.map((m) => `Alternative: "${m.alternative}" — ${m.reasoning}`).join('\n');
        noteInteraction('parentReplay', `Reviewed a Parent Replay of a ${event.eventType} (intensity ${event.intensity}/10): ${event.whatHappened}\n\nKey moments identified:\n${moments}`);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof SafetyTriggeredError) {
          setSafetyText(getSafetyResponse(err.category).text);
          setStatus('safety');
          noteSafetyEvent('parentReplay', err.category);
          return;
        }
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?.id, attempt]);

  function toggleMoment(turnIndex: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(turnIndex)) next.delete(turnIndex);
      else next.add(turnIndex);
      return next;
    });
  }

  if (!event) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Entry not found</Text>
        <Button label="Back" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>Parent Replay</Text>
      </View>

      {status === 'loading' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
          <AnimatedMascot size={90} motion="sway" />
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl }]}>
            Piecing this moment back together...
          </Text>
        </View>
      )}

      {status === 'error' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg, padding: spacing.xl }}>
          <AnimatedMascot size={90} motion="idle" />
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
            I'm having trouble putting this together right now. Mind trying again in a moment?
          </Text>
          <Button label="Try Again" onPress={() => setAttempt((n) => n + 1)} />
        </View>
      )}

      {status === 'safety' && safetyText && (
        <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg, flexGrow: 1, justifyContent: 'center' }}>
          <AnimatedMascot size={90} motion="idle" />
          <Text style={[typography.body, { color: color.textPrimary }]}>{safetyText}</Text>
          <Button label="Back" variant="secondary" onPress={() => router.back()} />
        </ScrollView>
      )}

      {status === 'ready' && result && (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
          <Text style={[typography.body, { color: color.textSecondary }]}>
            Here's roughly how this moment likely played out, based on what you logged. Tap a highlighted moment to see another way it could have gone.
          </Text>

          {result.turns.map((turn, i) => {
            const moment = result.keyMoments.find((km) => km.turnIndex === i);
            const isCaregiver = turn.speaker === 'caregiver';
            const isExpanded = expanded.has(i);
            return (
              <View key={i} style={{ gap: spacing.xs }}>
                <View
                  style={[
                    {
                      alignSelf: isCaregiver ? 'flex-end' : 'flex-start',
                      maxWidth: '82%',
                      backgroundColor: isCaregiver ? color.primary : color.surface,
                      borderRadius: radii.lg,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                    },
                    !isCaregiver ? shadows.card : null,
                    moment ? { borderWidth: 1.5, borderColor: color.accent } : null,
                  ]}
                >
                  <Text style={[typography.caption, { color: isCaregiver ? color.textOnPrimary : color.textSecondary, opacity: 0.8 }]}>
                    {isCaregiver ? 'You' : 'Your child'}
                  </Text>
                  <Text style={[typography.body, { color: isCaregiver ? color.textOnPrimary : color.textPrimary }]}>{turn.text}</Text>
                </View>

                {moment && (
                  <Pressable
                    onPress={() => toggleMoment(i)}
                    style={[
                      {
                        alignSelf: isCaregiver ? 'flex-end' : 'flex-start',
                        maxWidth: '82%',
                        backgroundColor: color.accentTint,
                        borderRadius: radii.md,
                        padding: spacing.sm,
                      },
                    ]}
                  >
                    <Text style={[typography.caption, { color: color.textPrimary, fontFamily: typography.bodyEmphasis.fontFamily }]}>
                      {isExpanded ? 'Hide alternative' : 'A different response here might have helped — tap to see'}
                    </Text>
                    {isExpanded && (
                      <View style={{ marginTop: spacing.xs, gap: 4 }}>
                        <Text style={[typography.bodySmall, { color: color.textPrimary, fontStyle: 'italic' }]}>"{moment.alternative}"</Text>
                        <Text style={[typography.bodySmall, { color: color.textSecondary }]}>{moment.reasoning}</Text>
                        {moment.framework && (
                          <Text style={[typography.caption, { color: color.textSecondary, fontStyle: 'italic' }]}>Based on: {moment.framework}</Text>
                        )}
                      </View>
                    )}
                  </Pressable>
                )}
              </View>
            );
          })}

          {result.includeDisclaimer && <DisclaimerNote style={{ textAlign: 'center', marginTop: spacing.sm }} />}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
