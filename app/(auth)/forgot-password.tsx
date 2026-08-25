import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Button, BackButton, Toast, ToastMessage } from '../../src/components/ui';
import { Mascot } from '../../src/components/Mascot';
import { AuthTextField } from '../../src/features/auth/AuthTextField';
import { AuthLoadingOverlay } from '../../src/features/auth/AuthLoadingOverlay';
import { useAuthContext } from '../../src/features/auth/AuthProvider';

type Step = 'email' | 'newPassword';

export default function ForgotPasswordScreen() {
  const { color, spacing, typography } = useTheme();
  const router = useRouter();
  const auth = useAuthContext();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  function handleSendCode() {
    if (!email.trim()) {
      setError('Enter your email.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    // No real email exists to click through from, so the mock jumps
    // straight to "set a new password" after this beat instead of
    // dead-ending on a fake inbox screen.
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('newPassword');
    }, 1100);
  }

  function handleResetPassword() {
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      // "Always succeeds" — resetPassword itself never reveals whether the
      // email matched a real account.
      auth.resetPassword({ email, newPassword });
      setIsSubmitting(false);
      setToast({ text: 'Your password has been reset.', variant: 'success' });
      setTimeout(() => router.replace('/(auth)/login'), 1500);
    }, 1100);
  }

  if (isSubmitting) {
    return (
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
        <AuthLoadingOverlay messages={[step === 'email' ? 'Sending a reset code...' : 'Resetting your password...']} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <Toast message={toast} onDismiss={() => setToast(null)} />

      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingBottom: spacing.sm }}>
        <BackButton onPress={() => (step === 'newPassword' ? setStep('email') : router.back())} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            <Mascot size={72} />
            <Text style={[typography.h1, { color: color.textPrimary, textAlign: 'center' }]}>
              {step === 'email' ? 'Reset your password' : 'Choose a new password'}
            </Text>
            <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
              {step === 'email'
                ? "We'll send a reset code to your email."
                : `Almost done — set a new password for ${email || 'your account'}.`}
            </Text>
          </View>

          {step === 'email' ? (
            <View style={{ gap: spacing.lg }}>
              <AuthTextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {error && <Text style={[typography.bodySmall, { color: color.warning }]}>{error}</Text>}
              <Button label="Send Reset Code" onPress={handleSendCode} />
            </View>
          ) : (
            <View style={{ gap: spacing.lg }}>
              <AuthTextField label="New Password" value={newPassword} onChangeText={setNewPassword} placeholder="Create a new password" isPassword />
              <AuthTextField
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Type it again"
                isPassword
              />
              {error && <Text style={[typography.bodySmall, { color: color.warning }]}>{error}</Text>}
              <Button label="Reset Password" onPress={handleResetPassword} />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
