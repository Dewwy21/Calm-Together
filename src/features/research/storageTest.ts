import AsyncStorage from '@react-native-async-storage/async-storage';

// Researcher-only storage self-test — exercises the app's one real
// persistence mechanism (@react-native-async-storage/async-storage; see the
// storage audit — YouTube playback has no storage of its own to test).
// Genuinely spans a real app reload (not just a second in-memory call)
// between phase 1 and phase 2, so "survives app close/reopen" is actually
// proven rather than assumed. Uses a clearly-labeled, timestamped,
// never-reused key — never touches any real caregiver data.

const PENDING_KEY = 'otter-companion/storage-test-pending';

export interface StorageTestStep {
  step: string;
  pass: boolean;
  detail?: string;
}

export interface StorageTestPendingState {
  testKey: string;
  testValue: string;
  phase1Steps: StorageTestStep[];
}

/** Steps 1-3: write, read back immediately, confirm it matches. Saves a pending marker (step 4's setup) so phase 2 can find the same key after a real reload. */
export async function runStorageTestPhase1(): Promise<StorageTestPendingState> {
  const timestamp = Date.now();
  const testKey = `otter-companion/STORAGE_TEST_${timestamp}`;
  const testValue = `test-value-${timestamp}-${Math.random().toString(36).slice(2, 8)}`;
  const steps: StorageTestStep[] = [];

  try {
    await AsyncStorage.setItem(testKey, testValue);
    steps.push({ step: '1. Write a known test value', pass: true, detail: testKey });
  } catch (err) {
    steps.push({ step: '1. Write a known test value', pass: false, detail: String(err) });
  }

  let readBack: string | null = null;
  try {
    readBack = await AsyncStorage.getItem(testKey);
    steps.push({ step: '2. Read it back immediately', pass: readBack !== null });
  } catch (err) {
    steps.push({ step: '2. Read it back immediately', pass: false, detail: String(err) });
  }

  steps.push({
    step: '3. Confirm the value matches',
    pass: readBack === testValue,
    detail: readBack === testValue ? undefined : `expected "${testValue}", got "${readBack}"`,
  });

  const pending: StorageTestPendingState = { testKey, testValue, phase1Steps: steps };
  await AsyncStorage.setItem(PENDING_KEY, JSON.stringify(pending));
  return pending;
}

/** Checks for a phase-1 test left pending from before a reload (called once, on app/screen load). */
export async function loadPendingStorageTest(): Promise<StorageTestPendingState | null> {
  try {
    const raw = await AsyncStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as StorageTestPendingState) : null;
  } catch {
    return null;
  }
}

/** Steps 5-8, run after a real reload has happened: read again, confirm persistence, delete, confirm it's gone. Cleans up the pending marker either way. */
export async function runStorageTestPhase2(pending: StorageTestPendingState): Promise<StorageTestStep[]> {
  const steps: StorageTestStep[] = [];

  let readAfterReload: string | null = null;
  try {
    readAfterReload = await AsyncStorage.getItem(pending.testKey);
    steps.push({ step: '5. Read the value again (after a real reload)', pass: readAfterReload !== null });
  } catch (err) {
    steps.push({ step: '5. Read the value again (after a real reload)', pass: false, detail: String(err) });
  }

  steps.push({
    step: '6. Confirm persistence',
    pass: readAfterReload === pending.testValue,
    detail: readAfterReload === pending.testValue ? undefined : `expected "${pending.testValue}", got "${readAfterReload}"`,
  });

  try {
    await AsyncStorage.removeItem(pending.testKey);
    steps.push({ step: '7. Delete the test value', pass: true });
  } catch (err) {
    steps.push({ step: '7. Delete the test value', pass: false, detail: String(err) });
  }

  let readAfterDelete: string | null = null;
  try {
    readAfterDelete = await AsyncStorage.getItem(pending.testKey);
    steps.push({
      step: '8. Confirm it is gone',
      pass: readAfterDelete === null,
      detail: readAfterDelete === null ? undefined : `still present: "${readAfterDelete}"`,
    });
  } catch (err) {
    steps.push({ step: '8. Confirm it is gone', pass: false, detail: String(err) });
  }

  await AsyncStorage.removeItem(PENDING_KEY).catch(() => {});
  return steps;
}
