import React, { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { EyeIcon, EyeOffIcon } from '../../components/icons';

interface AuthTextFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  isPassword?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words' | 'sentences';
}

// Same hand-styled TextInput recipe every form screen in this app already
// uses (label above, plain input below) — pulled into one small helper
// only because the auth screens repeat it many times, not a new visual
// pattern for the rest of the app to adopt.
export function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  isPassword = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}: AuthTextFieldProps) {
  const { color, spacing, typography, radii } = useTheme();
  const [visible, setVisible] = useState(false);
  const secure = isPassword && !visible;

  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.label, { color: color.textPrimary }]}>{label}</Text>
      <View style={{ position: 'relative', justifyContent: 'center' }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={color.textSecondary}
          secureTextEntry={secure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={{
            backgroundColor: color.surface,
            borderRadius: radii.md,
            padding: spacing.md,
            paddingRight: isPassword ? spacing['2xl'] : spacing.md,
            fontFamily: typography.body.fontFamily,
            fontSize: typography.body.fontSize,
            color: color.textPrimary,
          }}
        />
        {isPassword && (
          <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8} style={{ position: 'absolute', right: spacing.md }}>
            {visible ? <EyeOffIcon size={18} color={color.textSecondary} /> : <EyeIcon size={18} color={color.textSecondary} />}
          </Pressable>
        )}
      </View>
    </View>
  );
}
