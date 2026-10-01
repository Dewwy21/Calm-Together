import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Button, BackButton } from '../../src/components/ui';
import { Mascot } from '../../src/components/Mascot';
import { AuthTextField } from '../../src/features/auth/AuthTextField';
import { AuthLoadingOverlay } from '../../src/features/auth/AuthLoadingOverlay';
import { useAuthContext } from '../../src/features/auth/AuthProvider';

const LOADING_MIN_MS = 1100;

export default function LoginScreen() {
  const { color, spacing, typography } = useTheme();
  const router = useRouter();
  const auth = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleLogIn() {
    setError(null);
    setIsSubmitting(true);
    setTimeout(async () => {
      const result = await auth.logIn({ email, password });
      setIsSubmitting(false);
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong. Please try again.');
        return;
      }
      router.replace('/');
    }, LOADING_MIN_MS);
  }

  if (isSubmitting) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
        <AuthLoadingOverlay messages={['Signing you in...']} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            <Mascot size={72} />
            <Text style={[typography.h1, { color: color.textPrimary, textAlign: 'center' }]}>Welcome back</Text>
          </View>

          <View style={{ gap: spacing.lg }}>
            <AuthTextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AuthTextField label="Password" value={password} onChangeText={setPassword} placeholder="Your password" isPassword />

            {error && <Text style={[typography.bodySmall, { color: color.warning }]}>{error}</Text>}

            <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={[typography.bodySmall, { color: color.primary }]}>Forgot password?</Text>
            </Pressable>

            <Button label="Log In" onPress={handleLogIn} />
          </View>

          <Pressable onPress={() => router.replace('/(auth)/signup')} style={{ alignItems: 'center', padding: spacing.md }}>
            <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
              New here? <Text style={{ color: color.primary }}>Create an account</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
