import AsyncStorage from '@react-native-async-storage/async-storage';

// Researcher-only: wipes everything local that makes this account/device
// look like an existing user, so the app behaves exactly like a brand-new
// caregiver's first launch — see app/(modals)/preferences.tsx for the
// confirmation-gated control that calls this. Reuses the exact storage key
// list every other feature in the app already established (see each
// feature's own *Storage.ts file) rather than inventing a new one.
//
// Deliberately does NOT touch:
// - otter-companion/auth-users / otter-companion/auth-session — the test
//   account's login itself is left intact and still signed in, so the
//   researcher re-lands straight on onboarding (the app's actual
//   first-use experience) instead of having to sign up again with a new
//   email every single reset. Nothing in the reset spec asked for the
//   account/credentials themselves to be deleted.
// - otter-companion/research-log-retry-queue — this holds research
//   records that already exist but haven't successfully reached Google
//   Sheets yet. Clearing it would silently lose that data; it also isn't
//   "user state" in any caregiver-facing sense, so leaving it alone can't
//   make the app look like an existing user either way.
// - Anything in Google Sheets — this function only ever calls AsyncStorage.

// Every per-child key prefix in the app (one entry per `src/features/*/​
// *Storage.ts` file that scopes by childId) — keep this in sync if a new
// per-child storage key is ever added elsewhere.
const PER_CHILD_KEY_PREFIXES = [
  'otter-companion/act-check-in-sessions',
  'otter-companion/baseline-assessments',
  'otter-companion/family-blueprint',
  'otter-companion/calm-corner',
  'otter-companion/weekly-check-ins',
  'otter-companion/conversation-cards',
  'otter-companion/parent-learning-completed',
  'otter-companion/course-progress',
  'otter-companion/lesson-quiz-attempts',
  'otter-companion/help-bot-conversations',
  'otter-companion/logged-events',
  'otter-companion/last-celebrated-streak',
  'otter-companion/personalized-lessons',
  'otter-companion/simulator-sessions',
];

// Every per-account key prefix (scoped by accountId, not childId).
const PER_ACCOUNT_KEY_PREFIXES = ['otter-companion/child-profiles', 'otter-companion/current-child-id', 'otter-companion/onboarding-status', 'otter-companion/onboarding-answers'];

// Device-level keys with no per-account/per-child scoping at all.
const DEVICE_LEVEL_KEYS = ['otter-companion/account', 'otter-companion/preferences'];

// Pre-multi-child/pre-multi-account legacy keys that self-heal via
// migration elsewhere (profileStorage.ts, onboardingStorage.ts) — included
// here too in case a reset happens to run before that migration ever did.
const LEGACY_GLOBAL_KEYS = ['otter-companion/help-bot-messages'];

export async function resetTestUser(accountId: string): Promise<void> {
  // Read the account's own child list BEFORE removing it, so only this
  // account's children's data is touched — never another account's.
  const profilesRaw = await AsyncStorage.getItem(`otter-companion/child-profiles/${accountId}`);
  const childIds: string[] = profilesRaw
    ? (JSON.parse(profilesRaw) as Array<{ id: string }>).map((p) => p.id)
    : [];

  const keysToRemove: string[] = [];
  for (const childId of childIds) {
    for (const prefix of PER_CHILD_KEY_PREFIXES) {
      keysToRemove.push(`${prefix}/${childId}`);
    }
  }
  for (const prefix of PER_ACCOUNT_KEY_PREFIXES) {
    keysToRemove.push(`${prefix}/${accountId}`);
  }
  keysToRemove.push(...DEVICE_LEVEL_KEYS, ...LEGACY_GLOBAL_KEYS);

  await AsyncStorage.multiRemove(keysToRemove);
}
