import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useTheme } from '../../../src/theme';
import { CloseButton, ActionSheetModal, ActionSheetItem, ConfirmDialog, Button } from '../../../src/components/ui';
import { Mascot } from '../../../src/components/Mascot';
import { PlusIcon, DotsIcon, PencilIcon, CopyIcon, ArchiveIcon, TrashIcon, ChatIcon } from '../../../src/components/icons';
import { useHelpBotContext } from '../../../src/features/helpBot/HelpBotProvider';
import { HelpBotConversation } from '../../../src/features/helpBot/types';
import { formatConversationTranscript } from '../../../src/features/helpBot/transcript';

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default function HelpBotConversationsScreen() {
  const { color, spacing, typography, radii, shadows } = useTheme();
  const router = useRouter();
  const {
    activeConversations,
    archivedConversations,
    currentConversationId,
    startNewConversation,
    switchConversation,
    renameConversation,
    deleteConversation,
    archiveConversation,
    unarchiveConversation,
  } = useHelpBotContext();

  const [menuFor, setMenuFor] = useState<HelpBotConversation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HelpBotConversation | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');

  function openConversation(id: string) {
    switchConversation(id);
    router.back();
  }

  function handleNewChat() {
    startNewConversation();
    router.back();
  }

  function startRename(conversation: HelpBotConversation) {
    setMenuFor(null);
    setRenamingId(conversation.id);
    setRenameDraft(conversation.title);
  }

  function commitRename() {
    if (renamingId) renameConversation(renamingId, renameDraft);
    setRenamingId(null);
  }

  const menuActions: ActionSheetItem[] = menuFor
    ? [
        { label: 'Rename', icon: PencilIcon, onPress: () => startRename(menuFor) },
        {
          label: 'Copy Chat',
          icon: CopyIcon,
          onPress: () => {
            Clipboard.setStringAsync(formatConversationTranscript(menuFor));
            setMenuFor(null);
          },
        },
        {
          label: menuFor.archived ? 'Unarchive' : 'Archive',
          icon: ArchiveIcon,
          onPress: () => {
            if (menuFor.archived) unarchiveConversation(menuFor.id);
            else archiveConversation(menuFor.id);
            setMenuFor(null);
          },
        },
        {
          label: 'Delete',
          icon: TrashIcon,
          destructive: true,
          onPress: () => {
            setDeleteTarget(menuFor);
            setMenuFor(null);
          },
        },
      ]
    : [];

  function renderRow(conversation: HelpBotConversation) {
    const isRenaming = renamingId === conversation.id;
    const isCurrent = conversation.id === currentConversationId;

    return (
      <View
        key={conversation.id}
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            backgroundColor: color.surface,
            borderRadius: radii.lg,
            padding: spacing.md,
          },
          shadows.card,
          isCurrent ? { borderWidth: 1.5, borderColor: color.primary } : null,
        ]}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radii.md,
            backgroundColor: color.primaryTint,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ChatIcon size={16} color={color.primary} />
        </View>

        {isRenaming ? (
          <TextInput
            value={renameDraft}
            onChangeText={setRenameDraft}
            autoFocus
            onSubmitEditing={commitRename}
            onBlur={commitRename}
            style={[
              typography.bodyEmphasis,
              { flex: 1, color: color.textPrimary, padding: 0 },
            ]}
          />
        ) : (
          <Pressable style={{ flex: 1 }} onPress={() => openConversation(conversation.id)}>
            <Text style={[typography.bodyEmphasis, { color: color.textPrimary }]} numberOfLines={1}>
              {conversation.title}
            </Text>
            <Text style={[typography.caption, { color: color.textSecondary }]}>{relativeTime(conversation.updatedAtISO)}</Text>
          </Pressable>
        )}

        {!isRenaming && (
          <Pressable onPress={() => setMenuFor(conversation)} hitSlop={8} style={{ padding: spacing.xs }}>
            <DotsIcon size={16} color={color.textSecondary} />
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1, backgroundColor: color.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.lg,
          paddingBottom: spacing.md,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Mascot size={32} />
          <Text style={[typography.h1, { color: color.textPrimary }]}>Conversations</Text>
        </View>
        <CloseButton onPress={() => router.back()} />
      </View>

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.md }}>
        <Button label="+ New Chat" onPress={handleNewChat} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 0, gap: spacing.md }}>
        {activeConversations.length === 0 && archivedConversations.length === 0 ? (
          <Text style={[typography.body, { color: color.textSecondary, textAlign: 'center', marginTop: spacing['3xl'] }]}>
            No conversations yet. Start a new chat to talk with the otter.
          </Text>
        ) : (
          <>
            {activeConversations.map(renderRow)}

            {archivedConversations.length > 0 && (
              <>
                <Text style={[typography.caption, { color: color.textSecondary, marginTop: spacing.md }]}>ARCHIVED</Text>
                {archivedConversations.map(renderRow)}
              </>
            )}
          </>
        )}
      </ScrollView>

      <ActionSheetModal
        visible={!!menuFor}
        title={menuFor?.title}
        actions={menuActions}
        onCancel={() => setMenuFor(null)}
      />

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete conversation"
        message="This conversation and all its messages will be permanently deleted."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={() => {
          if (deleteTarget) deleteConversation(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeAreaView>
  );
}
