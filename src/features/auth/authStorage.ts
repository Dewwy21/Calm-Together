import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from './types';

// Mock local authentication — accounts and the current session live here,
// entirely on-device, no backend. Scope boundary worth knowing: every
// other feature in this app (kid profiles, Daily Log, Family Blueprint,
// course progress, etc.) still stores its data under one flat, unscoped
// key, not per-account — so two mock accounts on the same device share all
// of that app data. Only identity (name/email) and the session itself are
// actually separated per account. That's a deliberate, confirmed scope
// boundary for this feature, not an oversight.
const USERS_KEY = 'otter-companion/auth-users';
const SESSION_KEY = 'otter-companion/auth-session';

export async function loadUsers(): Promise<AuthUser[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuthUser[];
  } catch {
    return [];
  }
}

export async function persistUsers(users: AuthUser[]): Promise<void> {
  try {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // best-effort local persistence only
  }
}

export async function loadSession(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export async function persistSession(currentUserId: string | null): Promise<void> {
  try {
    if (currentUserId) {
      await AsyncStorage.setItem(SESSION_KEY, currentUserId);
    } else {
      await AsyncStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // best-effort local persistence only
  }
}
