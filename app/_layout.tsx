import { useEffect, useCallback } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { Quicksand_400Regular, Quicksand_500Medium, Quicksand_600SemiBold, Quicksand_700Bold } from '@expo-google-fonts/quicksand';
import { Lora_400Regular, Lora_500Medium, Lora_600SemiBold, Lora_700Bold } from '@expo-google-fonts/lora';
import { ThemeProvider, useTheme } from '../src/theme';
import { PreferencesProvider } from '../src/features/preferences/PreferencesProvider';
import { AuthProvider } from '../src/features/auth/AuthProvider';
import { ProfilesProvider } from '../src/features/profiles/ProfilesProvider';
import { BlueprintProvider } from '../src/features/blueprint/BlueprintProvider';
import { DenProvider } from '../src/features/den/DenProvider';
import { HelpBotProvider } from '../src/features/helpBot/HelpBotProvider';
import { CalmCornerProvider } from '../src/features/calmCorner/CalmCornerProvider';
import { ConversationCardsProvider } from '../src/features/connect/ConversationCardsProvider';
import { CourseProgressProvider } from '../src/features/courses/CourseProgressProvider';
import { PersonalizedLessonsProvider } from '../src/features/personalizedLessons/PersonalizedLessonsProvider';
import { CheckInProvider } from '../src/features/checkIn/CheckInProvider';
import { BaselineAssessmentProvider } from '../src/features/baselineAssessment/BaselineAssessmentProvider';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Quicksand_400Regular,
    Quicksand_500Medium,
    Quicksand_600SemiBold,
    Quicksand_700Bold,
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <PreferencesProvider>
        <AuthProvider>
          <ProfilesProvider>
            <BlueprintProvider>
              <DenProvider>
                <HelpBotProvider>
                  <CalmCornerProvider>
                    <ConversationCardsProvider>
                      <CourseProgressProvider>
                        <PersonalizedLessonsProvider>
                          <CheckInProvider>
                            <BaselineAssessmentProvider>
                              <AppChrome />
                            </BaselineAssessmentProvider>
                          </CheckInProvider>
                        </PersonalizedLessonsProvider>
                      </CourseProgressProvider>
                    </ConversationCardsProvider>
                  </CalmCornerProvider>
                </HelpBotProvider>
              </DenProvider>
            </BlueprintProvider>
          </ProfilesProvider>
        </AuthProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}

function AppChrome() {
  const { color, mode } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
