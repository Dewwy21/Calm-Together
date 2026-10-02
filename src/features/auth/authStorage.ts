import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from './types';

// Mock local authentication — accounts and the current session live here,
// entirely on-device, no backend. Every other feature's data (kid profiles,
// Daily Log, Family Blueprint, course progress, etc.) is scoped by childId,
// and the child-profile list itself is scoped by accountId (see
// profileStorage.ts), so a new account transitively gets its own empty
// child list and, once a child is added, entirely separate data from every
// other account on the same device.
const USERS_KEY = 'otter-companion/auth-users';
const SESSION_KEY = 'otter-companion/auth-session';

export async function loadUsers(): Promise<AuthUser[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuthUser[];
  } catch (err) {
    // Previously silent — a corrupted/unparseable value here made every
    // existing account look like it never existed, with no way to tell why.
    // eslint-disable-next-line no-console
    console.error('[authStorage] failed to load accounts — treating as empty:', err);
    return [];
  }
}

export async function persistUsers(users: AuthUser[]): Promise<void> {
  try {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (err) {
    // Previously silent — a failed write here (e.g. storage quota exceeded,
    // private-browsing restrictions) made signup look like it succeeded in
    // the UI while the account was never actually saved.
    // eslint-disable-next-line no-console
    console.error('[authStorage] failed to save accounts — this account list will not persist:', err);
  }
}

export async function loadSession(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(SESSION_KEY);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[authStorage] failed to load the active session:', err);
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
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[authStorage] failed to save the active session:', err);
  }
}
