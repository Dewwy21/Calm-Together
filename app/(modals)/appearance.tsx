import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, useThemeSettings, PaletteChoice, FontChoice, RadiusStyle, Density } from '../../src/theme';
import { BackButton, Chip, Card, Button, SpeechBubble } from '../../src/components/ui';
import { AnimatedMascot } from '../../src/components/Mascot';
import { TeacupIcon, LanternIcon, BackpackIcon, BookIcon, CheckIcon, IconProps } from '../../src/components/icons';
import { usePreferencesContext } from '../../src/features/preferences/PreferencesProvider';
import { MascotAccessory } from '../../src/features/preferences/types';

const FONT_OPTIONS: { value: FontChoice; label: string; blurb: string }[] = [
  { value: 'plusJakarta', label: 'Modern', blurb: 'Clean and easy to read' },
  { value: 'quicksand', label: 'Friendly & Rounded', blurb: 'Soft and playful' },
  { value: 'lora', label: 'Warm & Classic', blurb: 'Cozy, book-like feel' },
];

const PALETTE_OPTIONS: { value: PaletteChoice; label: string; swatches: string[] }[] = [
  { value: 'sunset', label: 'Sunset', swatches: ['#C96F4A', '#7C9473', '#B06678'] },
  { value: 'ocean', label: 'Ocean', swatches: ['#2F8F9D', '#5B8FB0', '#7A6FB0'] },
  { value: 'forest', label: 'Forest', swatches: ['#5B8C5A', '#8A9A5B', '#B0703F'] },
];

const SHAPE_OPTIONS: { value: RadiusStyle; label: string; previewRadius: number }[] = [
  { value: 'soft', label: 'Soft', previewRadius: 8 },
  { value: 'rounded', label: 'Rounded', previewRadius: 16 },
  { value: 'playful', label: 'Playful', previewRadius: 26 },
];

const DENSITY_OPTIONS: { value: Density; label: string; description: string }[] = [
  { value: 'compact', label: 'Compact', description: 'Fits more on each screen' },
  { value: 'cozy', label: 'Cozy', description: 'A balanced, comfortable layout' },
  { value: 'spacious', label: 'Spacious', description: 'More room to breathe' },
];

const ACCESSORY_OPTIONS: { value: MascotAccessory; label: string; icon?: React.ComponentType<IconProps> }[] = [
  { value: 'none', label: 'None' },
  { value: 'tea', label: 'Cup of Tea', icon: TeacupIcon },
  { value: 'lantern', label: 'Lantern', icon: LanternIcon },
  { value: 'backpack', label: 'Backpack', icon: BackpackIcon },
  { value: 'book', label: 'Book', icon: BookIcon },
];

export default function AppearanceScreen() {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const {
    paletteChoice,
    setPaletteChoice,
    fontChoice,
    setFontChoice,
    radiusStyle,
    setRadiusStyle,
    density,
    setDensity,
  } = useThemeSettings();
  const { preferences, updatePreference } = usePreferencesContext();

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>Customize Look & Feel</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        <Text style={[typography.body, { color: color.textSecondary }]}>
          Make Otter Companion feel like yours. Every choice below applies right away.
        </Text>

        <Card variant="hero" style={{ alignItems: 'center', gap: spacing.md }}>
          <AnimatedMascot size={80} motion="idle" />
          <Text style={[typography.h2, { color: color.textPrimary, textAlign: 'center' }]}>This is how things look</Text>
          <View style={{ width: '100%' }}>
            <SpeechBubble text="Hi, I'm glad you're customizing this together with me." />
          </View>
          <Button label="Sample Button" onPress={() => {}} />
        </Card>

        <Section title="Text Style">
          <View style={{ gap: spacing.sm }}>
            {FONT_OPTIONS.map((option) => (
              <OptionRow key={option.value} selected={fontChoice === option.value} onPress={() => setFontChoice(option.value)}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fontStyleFor(option.value, 'bold'), fontSize: 17, color: color.textPrimary }}>
                    {option.label}
                  </Text>
                  <Text style={{ fontFamily: fontStyleFor(option.value, 'regular'), fontSize: 13, color: color.textSecondary }}>
                    {option.blurb}
                  </Text>
                </View>
              </OptionRow>
            ))}
          </View>
        </Section>

        <Section title="Color Theme">
          <View style={{ gap: spacing.sm }}>
            {PALETTE_OPTIONS.map((option) => (
              <OptionRow key={option.value} selected={paletteChoice === option.value} onPress={() => setPaletteChoice(option.value)}>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {option.swatches.map((hex) => (
                    <View key={hex} style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: hex }} />
                  ))}
                </View>
                <Text style={[typography.bodyEmphasis, { color: color.textPrimary, flex: 1 }]}>{option.label}</Text>
              </OptionRow>
            ))}
          </View>
        </Section>

        <Section title="Shape Style">
          <View style={{ gap: spacing.sm }}>
            {SHAPE_OPTIONS.map((option) => (
              <OptionRow key={option.value} selected={radiusStyle === option.value} onPress={() => setRadiusStyle(option.value)}>
                <View style={{ width: 32, height: 32, borderRadius: option.previewRadius, backgroundColor: color.secondary }} />
                <Text style={[typography.bodyEmphasis, { color: color.textPrimary, flex: 1 }]}>{option.label}</Text>
              </OptionRow>
            ))}
          </View>
        </Section>

        <Section title="Layout Spacing">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {DENSITY_OPTIONS.map((option) => (
              <Chip key={option.value} label={option.label} active={density === option.value} onPress={() => setDensity(option.value)} />
            ))}
          </ScrollView>
          <Text style={[typography.caption, { color: color.textSecondary }]}>
            {DENSITY_OPTIONS.find((o) => o.value === density)?.description}
          </Text>
        </Section>

        <Section title="Otter's Signature Item">
          <View style={{ gap: spacing.sm }}>
            {ACCESSORY_OPTIONS.map((option) => (
              <OptionRow
                key={option.value}
                selected={preferences.mascotAccessory === option.value}
                onPress={() => updatePreference('mascotAccessory', option.value)}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: radii.pill,
                    backgroundColor: color.surfaceAlt,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {option.icon && <option.icon size={16} color={color.textPrimary} />}
                </View>
                <Text style={[typography.bodyEmphasis, { color: color.textPrimary, flex: 1 }]}>{option.label}</Text>
              </OptionRow>
            ))}
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function fontStyleFor(choice: FontChoice, weight: 'regular' | 'bold'): string {
  if (choice === 'quicksand') return weight === 'bold' ? 'Quicksand_700Bold' : 'Quicksand_400Regular';
  if (choice === 'lora') return weight === 'bold' ? 'Lora_700Bold' : 'Lora_400Regular';
  return weight === 'bold' ? 'PlusJakartaSans_700Bold' : 'PlusJakartaSans_400Regular';
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { color, spacing, typography } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[typography.label, { color: color.textPrimary }]}>{title}</Text>
      {children}
    </View>
  );
}

function OptionRow({ selected, onPress, children }: { selected: boolean; onPress: () => void; children: React.ReactNode }) {
  const { color, spacing, radii, shadows } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing.md,
          backgroundColor: selected ? color.primaryTint : color.surface,
          borderRadius: radii.lg,
          padding: spacing.md,
          borderWidth: selected ? 2 : 0,
          borderColor: color.primary,
        },
        shadows.card,
      ]}
    >
      {children}
      {selected && (
        <View style={{ width: 24, height: 24, borderRadius: radii.pill, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' }}>
          <CheckIcon size={13} color={color.textOnPrimary} />
        </View>
      )}
    </Pressable>
  );
}
