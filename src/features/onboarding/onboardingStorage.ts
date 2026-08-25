import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingAnswers, OnboardingStatus } from './types';

const STATUS_KEY = 'otter-companion/onboarding-status';
const ANSWERS_KEY = 'otter-companion/onboarding-answers';

export async function loadOnboardingStatus(): Promise<OnboardingStatus> {
  try {
    const raw = await AsyncStorage.getItem(STATUS_KEY);
    if (raw === 'skipped' || raw === 'completed') return raw;
    return 'not_started';
  } catch {
    return 'not_started';
  }
}

export async function persistOnboardingStatus(status: OnboardingStatus): Promise<void> {
  try {
    await AsyncStorage.setItem(STATUS_KEY, status);
  } catch {
    // best-effort local persistence only
  }
}

export async function loadOnboardingAnswers(): Promise<OnboardingAnswers> {
  try {
    const raw = await AsyncStorage.getItem(ANSWERS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as OnboardingAnswers;
  } catch {
    return {};
  }
}

export async function persistOnboardingAnswers(answers: OnboardingAnswers): Promise<void> {
  try {
    await AsyncStorage.setItem(ANSWERS_KEY, JSON.stringify(answers));
  } catch {
    // best-effort local persistence only
  }
}
