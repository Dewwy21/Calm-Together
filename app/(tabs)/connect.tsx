import React from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '../../src/components/ui';
import { useTheme } from '../../src/theme';
import { useDenContext } from '../../src/features/den/DenProvider';
import { ConnectMascotBubble } from '../../src/features/connect/ConnectMascotBubble';
import { CategoryCard } from '../../src/features/connect/CategoryCard';
import { suggestConnectActivity } from '../../src/features/connect/connectRecommendations';
import { CardsIcon, HeadphonesIcon, PeopleIcon, BatteryIcon } from '../../src/components/icons';

const DEFAULT_BUBBLE_TEXT = "Whatever kind of day it's been, there's something here, for the two of you, or just for you.";

export default function ConnectScreen() {
  const { color, spacing, typography } = useTheme();
  const router = useRouter();
  const den = useDenContext();

  const mostRecentEvent = den.events[den.events.length - 1];
  const suggestion = mostRecentEvent ? suggestConnectActivity(mostRecentEvent, den.events) : null;

  const bubbleText = suggestion
    ? suggestion.category === 'family'
      ? `That last moment you logged sounded like a good one. Want to try ${suggestion.title} to build on it?`
      : `Your recent logs have felt heavy. ${suggestion.title} might be worth doing before anything else.`
    : DEFAULT_BUBBLE_TEXT;

  return (
    <Screen>
      <View>
        <Text style={[typography.h1, { color: color.textPrimary }]}>Connect</Text>
        <Text style={[typography.body, { color: color.textSecondary }]}>
          For the relationship, not just the routine.
        </Text>
      </View>

      <ConnectMascotBubble
        text={bubbleText}
        pose={suggestion ? 'guiding' : 'happy'}
        onPress={suggestion ? () => router.push(suggestion.href) : undefined}
      />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: spacing.md }}>
        <CategoryCard
          icon={CardsIcon}
          title="Conversation Cards"
          description="Spark a real conversation with a flip of a card."
          tint={color.primaryTint}
          onPress={() => router.push('/(modals)/connect/conversation-cards')}
        />
        <CategoryCard
          icon={HeadphonesIcon}
          title="Audio Library"
          description="Family stories to share, plus short coaching sessions just for you."
          tint={color.secondaryTint}
          onPress={() => router.push('/(modals)/connect/audio-library')}
        />
        <CategoryCard
          icon={PeopleIcon}
          title="Family Activities"
          description="Simple ways to build connection through play."
          tint={color.accentTint}
          onPress={() => router.push('/(modals)/connect/family')}
        />
        <CategoryCard
          icon={BatteryIcon}
          title="Caregiver Recharge"
          description="Small moments to restore yourself, not just cope."
          tint={color.primaryTint}
          onPress={() => router.push('/(modals)/connect/recharge')}
        />
      </View>
    </Screen>
  );
}
