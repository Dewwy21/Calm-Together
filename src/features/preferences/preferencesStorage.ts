import AsyncStorage from '@react-native-async-storage/async-storage';
import { AccountInfo, AppPreferences, DEFAULT_ACCOUNT, DEFAULT_PREFERENCES } from './types';

const ACCOUNT_KEY = 'otter-companion/account';
const PREFERENCES_KEY = 'otter-companion/preferences';

export async function loadAccount(): Promise<AccountInfo> {
  try {
    const raw = await AsyncStorage.getItem(ACCOUNT_KEY);
    if (!raw) return DEFAULT_ACCOUNT;
    return { ...DEFAULT_ACCOUNT, ...(JSON.parse(raw) as Partial<AccountInfo>) };
  } catch {
    return DEFAULT_ACCOUNT;
  }
}

export async function persistAccount(account: AccountInfo): Promise<void> {
  try {
    await AsyncStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  } catch {
    // best-effort local persistence only
  }
}

export async function loadPreferences(): Promise<AppPreferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...(JSON.parse(raw) as Partial<AppPreferences>) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function persistPreferences(preferences: AppPreferences): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // best-effort local persistence only
  }
}
