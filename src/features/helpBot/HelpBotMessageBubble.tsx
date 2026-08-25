import React, { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../theme';
import { Mascot } from '../../components/Mascot';
import { ArrowRightIcon, DotsIcon, CopyIcon, PencilIcon, TrashIcon } from '../../components/icons';
import { ActionSheetModal, ActionSheetItem, ConfirmDialog, Button } from '../../components/ui';
import { HelpBotMessage } from './types';
import { DisclaimerNote } from '../aiEngine/DisclaimerNote';
import { useHelpBotContext } from './HelpBotProvider';

interface HelpBotMessageBubbleProps {
  message: HelpBotMessage;
}

const AVATAR_SIZE = 28;

export function HelpBotMessageBubble({ message }: HelpBotMessageBubbleProps) {
  const { color, spacing, typography, organicRadii, shadows, radii } = useTheme();
  const router = useRouter();
  const { editMessage, deleteMessage } = useHelpBotContext();
  const isAssistant = message.role === 'assistant';

  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(message.text);

  function handleCopy() {
    setShowMenu(false);
    Clipboard.setStringAsync(message.text);
  }

  function handleStartEdit() {
    setShowMenu(false);
    setDraftText(message.text);
    setIsEditing(true);
  }

  function handleSaveEdit() {
    const trimmed = draftText.trim();
    if (trimmed && trimmed !== message.text) {
      editMessage(message.id, trimmed);
    }
    setIsEditing(false);
  }

  const menuActions: ActionSheetItem[] = [
    { label: 'Copy', icon: CopyIcon, onPress: handleCopy },
    { label: 'Edit', icon: PencilIcon, onPress: handleStartEdit },
    {
      label: 'Delete',
      icon: TrashIcon,
      destructive: true,
      onPress: () => {
        setShowMenu(false);
        setShowDeleteConfirm(true);
      },
    },
  ];

  return (
    <View style={{ gap: spacing.xs }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: isAssistant ? 'flex-start' : 'flex-end',
          gap: spacing.xs,
        }}
      >
        {isAssistant && <Mascot size={AVATAR_SIZE} />}
        <View
          style={[
            {
              maxWidth: '76%',
              backgroundColor: isAssistant ? color.surface : color.primary,
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              ...organicRadii.speechBubble,
            },
            isAssistant ? shadows.card : null,
            message.isCrisisResponse ? { borderWidth: 1.5, borderColor: color.accent } : null,
          ]}
        >
          {isEditing ? (
            <View style={{ gap: spacing.sm }}>
              <TextInput
                value={draftText}
                onChangeText={setDraftText}
                multiline
                autoFocus
                style={[
                  typography.body,
                  {
                    color: isAssistant ? color.textPrimary : color.textOnPrimary,
                    minWidth: 160,
                    padding: 0,
                  },
                ]}
              />
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Button label="Cancel" variant="ghost" onPress={() => setIsEditing(false)} textColor={isAssistant ? color.textSecondary : color.textOnPrimary} />
                <Button label="Save" variant="secondary" onPress={handleSaveEdit} />
              </View>
            </View>
          ) : (
            <Text style={[typography.body, { color: isAssistant ? color.textPrimary : color.textOnPrimary }]}>
              {message.text}
            </Text>
          )}
        </View>
        {!isEditing && (
          <Pressable
            onPress={() => setShowMenu(true)}
            hitSlop={8}
            style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
          >
            <DotsIcon size={14} color={color.textSecondary} />
          </Pressable>
        )}
      </View>

      {message.edited && (
        <Text
          style={[
            typography.caption,
            {
              color: color.textSecondary,
              textAlign: isAssistant ? 'left' : 'right',
              marginLeft: isAssistant ? AVATAR_SIZE + spacing.xs : 0,
            },
          ]}
        >
          Edited
        </Text>
      )}

      {isAssistant && !!message.framework && (
        <Text style={[typography.caption, { color: color.textSecondary, marginLeft: AVATAR_SIZE + spacing.xs, fontStyle: 'italic' }]}>
          Based on: {message.framework}
        </Text>
      )}

      {isAssistant && message.showsDisclaimer && <DisclaimerNote style={{ marginLeft: AVATAR_SIZE + spacing.xs }} />}

      {isAssistant && !!message.actions?.length && (
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: spacing.sm,
            marginLeft: AVATAR_SIZE + spacing.xs,
          }}
        >
          {message.actions.map((action) => (
            <Pressable
              key={action.href + action.label}
              onPress={() => router.push(action.href)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: color.primaryTint,
                borderRadius: radii.pill,
                paddingVertical: spacing.sm,
                paddingHorizontal: spacing.md,
              }}
            >
              <Text style={[typography.caption, { color: color.primary }]}>{action.label}</Text>
              <ArrowRightIcon size={12} color={color.primary} />
            </Pressable>
          ))}
        </View>
      )}

      <ActionSheetModal visible={showMenu} actions={menuActions} onCancel={() => setShowMenu(false)} />

      <ConfirmDialog
        visible={showDeleteConfirm}
        title="Delete message"
        message="This message will be removed from the conversation. This can't be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          setShowDeleteConfirm(false);
          deleteMessage(message.id);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </View>
  );
}
