import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile } from './types';

const PROFILES_KEY = 'otter-companion/child-profiles';
const CURRENT_CHILD_KEY = 'otter-companion/current-child-id';

// Pre-multi-child keys. Any data found here belongs to whichever profile is
// created during the one-time migration in useProfilesState.ts.
const LEGACY_EVENTS_KEY = 'otter-companion/logged-events';
const LEGACY_HELP_BOT_KEY = 'otter-companion/help-bot-messages';

export async function loadProfiles(): Promise<ChildProfile[]> {
  try {
    const raw = await AsyncStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ChildProfile[];
  } catch {
    return [];
  }
}

export async function persistProfiles(profiles: ChildProfile[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  } catch {
    // best-effort local persistence only
  }
}

export async function loadCurrentChildId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CURRENT_CHILD_KEY);
  } catch {
    return null;
  }
}

export async function persistCurrentChildId(childId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(CURRENT_CHILD_KEY, childId);
  } catch {
    // best-effort local persistence only
  }
}

// Moves any pre-multi-child logged events / help bot history onto the given
// child's scoped keys, then clears the old unscoped keys. Safe to call even
// when there's nothing to migrate.
export async function migrateLegacyChildData(childId: string): Promise<void> {
  try {
    const [legacyEvents, legacyMessages] = await Promise.all([
      AsyncStorage.getItem(LEGACY_EVENTS_KEY),
      AsyncStorage.getItem(LEGACY_HELP_BOT_KEY),
    ]);
    if (legacyEvents) {
      await AsyncStorage.setItem(`${LEGACY_EVENTS_KEY}/${childId}`, legacyEvents);
      await AsyncStorage.removeItem(LEGACY_EVENTS_KEY);
    }
    if (legacyMessages) {
      await AsyncStorage.setItem(`${LEGACY_HELP_BOT_KEY}/${childId}`, legacyMessages);
      await AsyncStorage.removeItem(LEGACY_HELP_BOT_KEY);
    }
  } catch {
    // best-effort local persistence only
  }
}
