import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile } from './types';

const PROFILES_KEY = 'otter-companion/child-profiles';
const CURRENT_CHILD_KEY = 'otter-companion/current-child-id';

// Pre-multi-child keys. Any data found here belongs to whichever profile is
// created during the one-time migration in useProfilesState.ts.
const LEGACY_EVENTS_KEY = 'otter-companion/logged-events';
const LEGACY_HELP_BOT_KEY = 'otter-companion/help-bot-messages';

// Both loaders below self-heal from this app's earlier design, where the
// child-profile list (and which child was "current") lived under one flat
// key shared by every account — meaning any account signed in on the same
// device could see every other account's kids and data. Scoping these by
// accountId is the actual account/data-separation boundary the rest of the
// app's per-child storage relies on: every other feature already scopes
// its own storage by childId alone, so once the list of "which child IDs
// belong to this account" is itself correctly separated, everything under
// those IDs is transitively separated too — no other feature file needs to
// change. Whichever account happens to load first after this upgrade
// inherits the old shared list (rather than it silently vanishing); every
// other account starts fresh, exactly like every other legacy-key
// migration already in this codebase (see migrateLegacyChildData below).
export async function loadProfiles(accountId: string): Promise<ChildProfile[]> {
  const scopedKey = `${PROFILES_KEY}/${accountId}`;
  try {
    const raw = await AsyncStorage.getItem(scopedKey);
    if (raw) return JSON.parse(raw) as ChildProfile[];
  } catch {
    return [];
  }

  try {
    const legacyRaw = await AsyncStorage.getItem(PROFILES_KEY);
    if (!legacyRaw) return [];
    await AsyncStorage.setItem(scopedKey, legacyRaw);
    await AsyncStorage.removeItem(PROFILES_KEY);
    return JSON.parse(legacyRaw) as ChildProfile[];
  } catch {
    return [];
  }
}

export async function persistProfiles(accountId: string, profiles: ChildProfile[]): Promise<void> {
  try {
    await AsyncStorage.setItem(`${PROFILES_KEY}/${accountId}`, JSON.stringify(profiles));
  } catch {
    // best-effort local persistence only
  }
}

export async function loadCurrentChildId(accountId: string): Promise<string | null> {
  const scopedKey = `${CURRENT_CHILD_KEY}/${accountId}`;
  try {
    const raw = await AsyncStorage.getItem(scopedKey);
    if (raw) return raw;
  } catch {
    return null;
  }

  try {
    const legacyRaw = await AsyncStorage.getItem(CURRENT_CHILD_KEY);
    if (!legacyRaw) return null;
    await AsyncStorage.setItem(scopedKey, legacyRaw);
    await AsyncStorage.removeItem(CURRENT_CHILD_KEY);
    return legacyRaw;
  } catch {
    return null;
  }
}

export async function persistCurrentChildId(accountId: string, childId: string): Promise<void> {
  try {
    await AsyncStorage.setItem(`${CURRENT_CHILD_KEY}/${accountId}`, childId);
  } catch {
    // best-effort local persistence only
  }
}

// Moves any pre-multi-child logged events / help bot history onto the given
// child's scoped keys, then clears the old unscoped keys. Safe to call even
// when there's nothing to migrate. Unrelated to the accountId scoping
// above — this is the older, separate childId-level migration.
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
