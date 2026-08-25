import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Button, BackButton, Toast, ToastMessage } from '../../src/components/ui';
import { Mascot } from '../../src/components/Mascot';
import { AuthTextField } from '../../src/features/auth/AuthTextField';
import { AuthLoadingOverlay } from '../../src/features/auth/AuthLoadingOverlay';
import { useAuthContext } from '../../src/features/auth/AuthProvider';

const LOADING_MIN_MS = 1300;

export default function SignupScreen() {
  const { color, spacing, typography } = useTheme();
  const router = useRouter();
  const auth = useAuthContext();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  function handleCreateAccount() {
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const result = auth.signUp({ name, email, password });
      setIsSubmitting(false);
      if (!result.ok) {
        setError(result.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setToast({ text: 'Verification email sent! (Just a demo — no real email was sent.)', variant: 'success' });
      setTimeout(() => router.replace('/'), 1800);
    }, LOADING_MIN_MS);
  }

  if (isSubmitting) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
        <AuthLoadingOverlay messages={['Creating your account...', 'Almost there...']} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <Toast message={toast} onDismiss={() => setToast(null)} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => router.back()} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            <Mascot size={72} />
            <Text style={[typography.h1, { color: color.textPrimary, textAlign: 'center' }]}>Create your account</Text>
            <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
              Everything stays on this device.
            </Text>
          </View>

          <View style={{ gap: spacing.lg }}>
            <AuthTextField label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
            <AuthTextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AuthTextField label="Password" value={password} onChangeText={setPassword} placeholder="Create a password" isPassword />
            <AuthTextField
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Type it again"
              isPassword
            />

            {error && <Text style={[typography.bodySmall, { color: color.warning }]}>{error}</Text>}

            <Button label="Create Account" onPress={handleCreateAccount} />
          </View>

          <Pressable onPress={() => router.replace('/(auth)/login')} style={{ alignItems: 'center', padding: spacing.md }}>
            <Text style={[typography.bodySmall, { color: color.textSecondary }]}>
              Already have an account? <Text style={{ color: color.primary }}>Log In</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
