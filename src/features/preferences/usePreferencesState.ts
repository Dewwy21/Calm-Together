import { useEffect, useState } from 'react';
import { AccountInfo, AppPreferences, DEFAULT_ACCOUNT, DEFAULT_PREFERENCES } from './types';
import { loadAccount, persistAccount, loadPreferences, persistPreferences } from './preferencesStorage';

export function usePreferencesState() {
  const [account, setAccount] = useState<AccountInfo>(DEFAULT_ACCOUNT);
  const [preferences, setPreferences] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([loadAccount(), loadPreferences()]).then(([storedAccount, storedPreferences]) => {
      setAccount(storedAccount);
      setPreferences(storedPreferences);
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) persistAccount(account);
  }, [account, loaded]);

  useEffect(() => {
    if (loaded) persistPreferences(preferences);
  }, [preferences, loaded]);

  function updateAccount(patch: Partial<AccountInfo>) {
    setAccount((prev) => ({ ...prev, ...patch }));
  }

  // Resets device-local display preferences (photo, language,
  // notifications) — not a sign-out. Actual login/logout lives in
  // src/features/auth/ now. Kid profiles and logged data are untouched.
  function resetAccount() {
    setAccount(DEFAULT_ACCOUNT);
  }

  function updatePreference<K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  }

  return { account, updateAccount, resetAccount, preferences, updatePreference };
}
