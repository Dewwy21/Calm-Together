import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingAnswers, OnboardingStatus } from './types';

const STATUS_KEY = 'otter-companion/onboarding-status';
const ANSWERS_KEY = 'otter-companion/onboarding-answers';

// Scoped per account so a brand-new account actually goes through
// onboarding (and gets its own first child profile) instead of inheriting
// whatever the previously-signed-in account already completed — these used
// to be flat, unscoped keys shared by every account on the device. Same
// self-healing migration idiom as profileStorage.ts: whichever account
// loads first after this upgrade inherits the old shared status/answers;
// every other account starts fresh.
export async function loadOnboardingStatus(accountId: string): Promise<OnboardingStatus> {
  const scopedKey = `${STATUS_KEY}/${accountId}`;
  try {
    const raw = await AsyncStorage.getItem(scopedKey);
    if (raw === 'skipped' || raw === 'completed') return raw;
  } catch {
    return 'not_started';
  }

  try {
    const legacyRaw = await AsyncStorage.getItem(STATUS_KEY);
    if (legacyRaw === 'skipped' || legacyRaw === 'completed') {
      await AsyncStorage.setItem(scopedKey, legacyRaw);
      await AsyncStorage.removeItem(STATUS_KEY);
      return legacyRaw;
    }
    return 'not_started';
  } catch {
    return 'not_started';
  }
}

export async function persistOnboardingStatus(accountId: string, status: OnboardingStatus): Promise<void> {
  try {
    await AsyncStorage.setItem(`${STATUS_KEY}/${accountId}`, status);
  } catch {
    // best-effort local persistence only
  }
}

export async function loadOnboardingAnswers(accountId: string): Promise<OnboardingAnswers> {
  const scopedKey = `${ANSWERS_KEY}/${accountId}`;
  try {
    const raw = await AsyncStorage.getItem(scopedKey);
    if (raw) return JSON.parse(raw) as OnboardingAnswers;
  } catch {
    return {};
  }

  try {
    const legacyRaw = await AsyncStorage.getItem(ANSWERS_KEY);
    if (!legacyRaw) return {};
    await AsyncStorage.setItem(scopedKey, legacyRaw);
    await AsyncStorage.removeItem(ANSWERS_KEY);
    return JSON.parse(legacyRaw) as OnboardingAnswers;
  } catch {
    return {};
  }
}

export async function persistOnboardingAnswers(accountId: string, answers: OnboardingAnswers): Promise<void> {
  try {
    await AsyncStorage.setItem(`${ANSWERS_KEY}/${accountId}`, JSON.stringify(answers));
  } catch {
    // best-effort local persistence only
  }
}
