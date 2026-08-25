import React from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { CloseButton } from '../../../src/components/ui';
import { Mascot } from '../../../src/components/Mascot';
import { useCalmCornerContext } from '../../../src/features/calmCorner/CalmCornerProvider';
import { EXERCISES } from '../../../src/features/calmCorner/exerciseData';
import { ExerciseCard } from '../../../src/features/calmCorner/ExerciseCard';
import { AmbientAudioToggle } from '../../../src/features/calmCorner/AmbientAudioToggle';

const HERO_IMAGE = require('../../../assets/calm/lotus.jpg');

export default function CalmCornerLibraryScreen() {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const calmCorner = useCalmCornerContext();

  function openExercise(id: string) {
    router.push(`/(modals)/calm-corner/${id}`);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ height: 130 }}>
        <Image source={HERO_IMAGE} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(20,15,10,0.25)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            top: spacing.sm,
            left: spacing.lg,
            right: spacing.lg,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <View>
            <Text style={[typography.h1, { color: '#fff' }]}>Calm Corner</Text>
            <Text style={[typography.bodySmall, { color: '#fff', opacity: 0.9 }]}>A short exercise, whenever you need one.</Text>
          </View>
          <CloseButton onDark onPress={() => router.back()} />
        </View>
      </View>
      <View
        style={[
          {
            alignSelf: 'center',
            marginTop: -26,
            width: 52,
            height: 52,
            borderRadius: radii.pill,
            backgroundColor: color.surface,
            alignItems: 'center',
            justifyContent: 'center',
          },
          shadows.card,
        ]}
      >
        <Mascot size={40} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        <AmbientAudioToggle />

        {calmCorner.recentlyUsedExercises.length > 0 && (
          <Section title="Recently used" theme={{ color, spacing, typography }}>
            {calmCorner.recentlyUsedExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isFavorite={calmCorner.isFavorite(exercise.id)}
                onToggleFavorite={() => calmCorner.toggleFavorite(exercise.id)}
                onPress={() => openExercise(exercise.id)}
              />
            ))}
          </Section>
        )}

        {calmCorner.favoriteExercises.length > 0 && (
          <Section title="Favorites" theme={{ color, spacing, typography }}>
            {calmCorner.favoriteExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isFavorite
                onToggleFavorite={() => calmCorner.toggleFavorite(exercise.id)}
                onPress={() => openExercise(exercise.id)}
              />
            ))}
          </Section>
        )}

        <Section title="All exercises" theme={{ color, spacing, typography }}>
          {EXERCISES.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isFavorite={calmCorner.isFavorite(exercise.id)}
              onToggleFavorite={() => calmCorner.toggleFavorite(exercise.id)}
              onPress={() => openExercise(exercise.id)}
            />
          ))}
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  theme,
  children,
}: {
  title: string;
  theme: { color: ReturnType<typeof useTheme>['color']; spacing: ReturnType<typeof useTheme>['spacing']; typography: ReturnType<typeof useTheme>['typography'] };
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: theme.spacing.md }}>
      <Text style={[theme.typography.h3, { color: theme.color.textPrimary }]}>{title}</Text>
      <View style={{ gap: theme.spacing.md }}>{children}</View>
    </View>
  );
}
