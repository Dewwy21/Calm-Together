import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, ToggleChip } from '../../../../src/components/ui';
import { WaveformIcon } from '../../../../src/components/icons';
import { useTheme } from '../../../../src/theme';
import { ConnectDetailHeader } from '../../../../src/features/connect/ConnectDetailHeader';
import { getListenScriptById } from '../../../../src/features/connect/listenScriptsData';
import { useSpeech } from '../../../../src/features/voice/useSpeech';
import { MascotMoment } from '../../../../src/features/mascot/MascotMoment';

export default function ListenEpisodeScreen() {
  const { episodeId } = useLocalSearchParams<{ episodeId: string }>();
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const speech = useSpeech();
  const [finished, setFinished] = useState(false);

  const episode = getListenScriptById(episodeId);

  if (!episode) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Episode not found</Text>
        <Button label="Back to Listen Together" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  const paragraphs = episode.script.split('\n\n');

  function toggleReadAloud() {
    if (speech.isSpeaking) {
      speech.stop();
    } else {
      speech.speak(episode!.script, { onFinish: () => setFinished(true) });
    }
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <ConnectDetailHeader onClose={() => router.back()} />

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg }}>
        <View style={{ gap: 4 }}>
          <Text style={[typography.caption, { color: color.textSecondary }]}>{episode.topic.toUpperCase()} · ~{episode.estimatedMinutes} MIN</Text>
          <Text style={[typography.h1, { color: color.textPrimary }]}>{episode.title}</Text>
        </View>

        <ToggleChip
          icon={WaveformIcon}
          active={speech.isSpeaking}
          onPress={toggleReadAloud}
          activeLabel="Stop reading"
          inactiveLabel="Read aloud"
        />

        <View style={{ backgroundColor: color.surface, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.md }}>
          {paragraphs.map((p, i) => (
            <Text key={i} style={[typography.body, { color: color.textPrimary }]}>
              {p}
            </Text>
          ))}
        </View>

        <View style={{ backgroundColor: color.secondaryTint, borderRadius: radii.lg, padding: spacing.lg, gap: spacing.sm }}>
          <Text style={[typography.h3, { color: color.textPrimary }]}>Talk about it</Text>
          {episode.discussionQuestions.map((q, i) => (
            <Text key={i} style={[typography.body, { color: color.textPrimary, fontStyle: 'italic' }]}>
              • {q}
            </Text>
          ))}
        </View>

        {finished && <MascotMoment motion="celebrate" text="Nice, you made it through this one together." />}
      </ScrollView>
    </SafeAreaView>
  );
}
