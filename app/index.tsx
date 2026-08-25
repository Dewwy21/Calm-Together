import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { loadOnboardingStatus } from '../src/features/onboarding/onboardingStorage';
import { useAuthContext } from '../src/features/auth/AuthProvider';

export default function Index() {
  const auth = useAuthContext();
  const [destination, setDestination] = useState<'/(auth)/welcome' | '/onboarding' | '/den' | null>(null);

  useEffect(() => {
    if (!auth.loaded) return;
    if (!auth.currentUser) {
      setDestination('/(auth)/welcome');
      return;
    }
    loadOnboardingStatus().then((status) => {
      setDestination(status === 'not_started' ? '/onboarding' : '/den');
    });
  }, [auth.loaded, auth.currentUser]);

  if (!destination) return null;
  return <Redirect href={destination} />;
}
