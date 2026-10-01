import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { Button, Toast, ToastMessage } from '../../src/components/ui';
import { Mascot } from '../../src/components/Mascot';
import { useAuthContext } from '../../src/features/auth/AuthProvider';

const RESEND_COOLDOWN_MS = 30 * 1000;

export default function VerifyEmailScreen() {
  const { color, spacing, typography, radii } = useTheme();
  const router = useRouter();
  const auth = useAuthContext();

  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [cooldownMsLeft, setCooldownMsLeft] = useState(0);

  useEffect(() => {
    if (cooldownMsLeft <= 0) return;
    const timer = setInterval(() => {
      setCooldownMsLeft((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownMsLeft]);

  // Guards against landing here with no session (shouldn't normally happen —
  // app/index.tsx only routes here for a logged-in, unverified user).
  if (!auth.loaded) return null;
  if (!auth.currentUser) return <Redirect href="/(auth)/welcome" />;
  const user = auth.currentUser;

  async function handleVerify() {
    setError(null);
    setIsVerifying(true);
    const result = auth.verifyEmailCode(user.id, code);
    setIsVerifying(false);
    if (!result.ok) {
      setError(result.error ?? 'Something went wrong. Please try again.');
      return;
    }
    router.replace('/');
  }

  async function handleResend() {
    setError(null);
    setIsResending(true);
    const result = await auth.sendVerificationCode(user.email);
    setIsResending(false);
    if (!result.ok) {
      setToast({ text: result.error ?? "Couldn't resend the code. Please try again.", variant: 'error' });
      return;
    }
    setCode('');
    setCooldownMsLeft(RESEND_COOLDOWN_MS);
    setToast({ text: 'A new code was sent to your email.', variant: 'success' });
  }

  const canResend = cooldownMsLeft <= 0 && !isResending;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <Toast message={toast} onDismiss={() => setToast(null)} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.xl, flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', gap: spacing.md }}>
            <Mascot size={72} />
            <Text style={[typography.h1, { color: color.textPrimary, textAlign: 'center' }]}>
              {user.verificationCode ? 'Check your email' : "Couldn't send your code"}
            </Text>
            <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center' }]}>
              {user.verificationCode
                ? `We sent a 6-digit code to ${user.email}. It expires in 10 minutes.`
                : `We couldn't send a verification email to ${user.email}. Tap "Resend Code" below to try again.`}
            </Text>
          </View>

          <View style={{ gap: spacing.lg }}>
            <View style={{ gap: spacing.xs }}>
              <Text style={[typography.label, { color: color.textPrimary }]}>Verification code</Text>
              <TextInput
                value={code}
                onChangeText={(text) => setCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="123456"
                placeholderTextColor={color.textSecondary}
                keyboardType="number-pad"
                maxLength={6}
                style={{
                  backgroundColor: color.surface,
                  borderRadius: radii.md,
                  padding: spacing.md,
                  fontFamily: typography.body.fontFamily,
                  fontSize: typography.body.fontSize,
                  color: color.textPrimary,
                  letterSpacing: 4,
                  textAlign: 'center',
                }}
              />
            </View>

            {error && <Text style={[typography.bodySmall, { color: color.warning }]}>{error}</Text>}

            <Button label={isVerifying ? 'Verifying...' : 'Verify'} onPress={handleVerify} disabled={isVerifying || code.length !== 6} />

            <Pressable onPress={handleResend} disabled={!canResend} style={{ alignItems: 'center', padding: spacing.md }}>
              <Text style={[typography.bodySmall, { color: canResend ? color.primary : color.textSecondary }]}>
                {isResending
                  ? 'Sending...'
                  : canResend
                    ? 'Resend Code'
                    : `Resend Code (${Math.ceil(cooldownMsLeft / 1000)}s)`}
              </Text>
            </Pressable>

            <Pressable onPress={auth.logOut} style={{ alignItems: 'center', padding: spacing.md }}>
              <Text style={[typography.bodySmall, { color: color.textSecondary }]}>Log out</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
