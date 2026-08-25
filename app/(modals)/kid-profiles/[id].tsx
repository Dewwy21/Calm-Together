import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { Button, BackButton, ConfirmDialog, AvatarPicker, SpeechBubble } from '../../../src/components/ui';
import { Mascot } from '../../../src/components/Mascot';
import { ChoiceButton } from '../../../src/features/onboarding/ChoiceButton';
import { useProfilesContext } from '../../../src/features/profiles/ProfilesProvider';
import { AvatarColorKey, ChildProfileInput, AdhdStatus, ChildAgeRange, ChildGender, EducationSetting } from '../../../src/features/profiles/types';
import {
  AGE_RANGE_OPTIONS,
  GENDER_OPTIONS,
  ADHD_STATUS_OPTIONS,
  EDUCATION_SETTING_OPTIONS,
  YES_NO_OPTIONS,
} from '../../../src/features/profiles/profileOptions';
import { pickAvatarPhoto } from '../../../src/utils/photoPicker';

const AVATAR_COLOR_KEYS: AvatarColorKey[] = ['primary', 'secondary', 'accent', 'warning'];

export default function KidProfileFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { color, spacing, typography } = useTheme();
  const router = useRouter();
  const { profiles, addChild, updateChild, archiveChild, unarchiveChild, deleteChild, switchChild } = useProfilesContext();

  const existing = !isNew ? profiles.find((p) => p.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? '');
  const [avatarUri, setAvatarUri] = useState(existing?.avatarUri);
  const [avatarColorKey, setAvatarColorKey] = useState<AvatarColorKey>(
    existing?.avatarColorKey ?? AVATAR_COLOR_KEYS[profiles.length % AVATAR_COLOR_KEYS.length]
  );
  const [ageRange, setAgeRange] = useState<ChildAgeRange | undefined>(existing?.ageRange);
  const [gender, setGender] = useState<ChildGender | undefined>(existing?.gender);
  const [genderOther, setGenderOther] = useState(existing?.genderOther ?? '');
  const [adhdStatus, setAdhdStatus] = useState<AdhdStatus | undefined>(existing?.adhdStatus);
  const [inTherapy, setInTherapy] = useState<boolean | undefined>(existing?.inTherapy);
  const [onMedication, setOnMedication] = useState<boolean | undefined>(existing?.onMedication);
  const [educationSetting, setEducationSetting] = useState<EducationSetting | undefined>(existing?.educationSetting);
  const [educationSettingOther, setEducationSettingOther] = useState(existing?.educationSettingOther ?? '');
  const [hasSiblings, setHasSiblings] = useState<boolean | undefined>(existing?.hasSiblings);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  if (!isNew && !existing) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: color.background, alignItems: 'center', justifyContent: 'center', gap: spacing.md }}>
        <Text style={[typography.h2, { color: color.textPrimary }]}>Profile not found</Text>
        <Button label="Back to Kid Profiles" onPress={() => router.back()} />
      </SafeAreaView>
    );
  }

  async function handlePickPhoto() {
    const uri = await pickAvatarPhoto();
    if (uri) setAvatarUri(uri);
  }

  function buildInput(): ChildProfileInput {
    return {
      name: name.trim() || 'Your Child',
      ageRange: ageRange ?? '5-7',
      gender,
      genderOther: gender === 'other' ? genderOther : undefined,
      avatarUri,
      avatarColorKey,
      adhdStatus: adhdStatus ?? 'notSure',
      inTherapy,
      onMedication,
      educationSetting,
      educationSettingOther: educationSetting === 'other' ? educationSettingOther : undefined,
      hasSiblings,
    };
  }

  function handleSave() {
    const input = buildInput();
    if (isNew) {
      const created = addChild(input);
      switchChild(created.id);
      setShowCelebration(true);
    } else {
      updateChild(existing!.id, input);
      router.back();
    }
  }

  function handleArchiveToggle() {
    if (!existing) return;
    if (existing.archived) unarchiveChild(existing.id);
    else archiveChild(existing.id);
    router.back();
  }

  function confirmDelete() {
    if (!existing) return;
    deleteChild(existing.id);
    setConfirmingDelete(false);
    router.back();
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
        <Text style={[typography.h1, { color: color.textPrimary, marginLeft: spacing.sm }]}>
          {isNew ? 'Add a Child' : name || existing?.name}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }}>
        {isNew && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Mascot size={44} />
            <SpeechBubble text="Let's set up a profile so I can get to know them too. There's no rush and nothing here is permanent." />
          </View>
        )}

        <AvatarPicker
          name={name || 'Child'}
          avatarUri={avatarUri}
          avatarColorKey={avatarColorKey}
          onPickPhoto={handlePickPhoto}
          onRemovePhoto={() => setAvatarUri(undefined)}
          onChangeColor={setAvatarColorKey}
        />

        <View style={{ gap: spacing.xs }}>
          <Text style={[typography.label, { color: color.textPrimary }]}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Child's name"
            placeholderTextColor={color.textSecondary}
            style={{
              backgroundColor: color.surface,
              borderRadius: 14,
              padding: spacing.md,
              fontFamily: typography.body.fontFamily,
              fontSize: typography.body.fontSize,
              color: color.textPrimary,
            }}
          />
        </View>

        <FormSection title="Age">
          {AGE_RANGE_OPTIONS.map((o) => (
            <ChoiceButton key={o.value} label={o.label} selected={ageRange === o.value} onPress={() => setAgeRange(o.value)} />
          ))}
        </FormSection>

        <FormSection title="Gender">
          {GENDER_OPTIONS.map((o) => (
            <ChoiceButton key={o.value} label={o.label} selected={gender === o.value} onPress={() => setGender(o.value)} />
          ))}
          {gender === 'other' && (
            <TextInput
              value={genderOther}
              onChangeText={setGenderOther}
              placeholder="Tell me a bit more..."
              placeholderTextColor={color.textSecondary}
              style={{
                backgroundColor: color.surface,
                borderRadius: 14,
                padding: spacing.md,
                fontFamily: typography.body.fontFamily,
                fontSize: typography.body.fontSize,
                color: color.textPrimary,
              }}
            />
          )}
        </FormSection>

        <FormSection title="ADHD status">
          {ADHD_STATUS_OPTIONS.map((o) => (
            <ChoiceButton key={o.value} label={o.label} selected={adhdStatus === o.value} onPress={() => setAdhdStatus(o.value)} />
          ))}
        </FormSection>

        <FormSection title="Currently working with a therapist?">
          {YES_NO_OPTIONS.map((o) => (
            <ChoiceButton
              key={o.value}
              label={o.label}
              selected={inTherapy === (o.value === 'yes')}
              onPress={() => setInTherapy(o.value === 'yes')}
            />
          ))}
        </FormSection>

        <FormSection title="Currently taking ADHD medication?">
          {YES_NO_OPTIONS.map((o) => (
            <ChoiceButton
              key={o.value}
              label={o.label}
              selected={onMedication === (o.value === 'yes')}
              onPress={() => setOnMedication(o.value === 'yes')}
            />
          ))}
        </FormSection>

        <FormSection title="Educational setting">
          {EDUCATION_SETTING_OPTIONS.map((o) => (
            <ChoiceButton
              key={o.value}
              label={o.label}
              selected={educationSetting === o.value}
              onPress={() => setEducationSetting(o.value)}
            />
          ))}
          {educationSetting === 'other' && (
            <TextInput
              value={educationSettingOther}
              onChangeText={setEducationSettingOther}
              placeholder="Tell me a bit more..."
              placeholderTextColor={color.textSecondary}
              style={{
                backgroundColor: color.surface,
                borderRadius: 14,
                padding: spacing.md,
                fontFamily: typography.body.fontFamily,
                fontSize: typography.body.fontSize,
                color: color.textPrimary,
              }}
            />
          )}
        </FormSection>

        <FormSection title="Does this child have siblings?">
          {YES_NO_OPTIONS.map((o) => (
            <ChoiceButton
              key={o.value}
              label={o.label}
              selected={hasSiblings === (o.value === 'yes')}
              onPress={() => setHasSiblings(o.value === 'yes')}
            />
          ))}
        </FormSection>

        <Button label={isNew ? 'Create Profile' : 'Save Changes'} onPress={handleSave} />

        {!isNew && existing && (
          <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
            <Button
              label={existing.archived ? 'Restore Profile' : 'Archive Profile'}
              variant="secondary"
              onPress={handleArchiveToggle}
            />
            <Button label="Delete Profile" variant="ghost" textColor={color.warning} onPress={() => setConfirmingDelete(true)} />
          </View>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={confirmingDelete}
        title="Delete this profile?"
        message="This removes their Daily Log, Help Bot history, and progress. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />

      <ConfirmDialog
        visible={showCelebration}
        title="Profile created!"
        message={`${name.trim() || 'Your child'}'s space is ready. Everything from here logs just for them.`}
        confirmLabel="Let's go"
        onConfirm={() => {
          setShowCelebration(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  const { color, spacing, typography } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[typography.label, { color: color.textPrimary }]}>{title}</Text>
      <View style={{ gap: spacing.sm }}>{children}</View>
    </View>
  );
}
