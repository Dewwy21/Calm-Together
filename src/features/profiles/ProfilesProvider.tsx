import React, { createContext, useContext } from 'react';
import { useProfilesState } from './useProfilesState';

type ProfilesContextValue = ReturnType<typeof useProfilesState>;

const ProfilesContext = createContext<ProfilesContextValue | null>(null);

// Lifted above DenProvider/HelpBotProvider so switching the current child
// can drive both of those to reload their child-scoped storage.
export function ProfilesProvider({ children }: { children: React.ReactNode }) {
  const value = useProfilesState();
  return <ProfilesContext.Provider value={value}>{children}</ProfilesContext.Provider>;
}

export function useProfilesContext() {
  const ctx = useContext(ProfilesContext);
  if (!ctx) throw new Error('useProfilesContext must be used within ProfilesProvider');
  return ctx;
}
