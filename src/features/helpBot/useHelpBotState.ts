import { useEffect, useMemo, useState } from 'react';
import { HelpBotConversation, HelpBotMessage } from './types';
import { loadHelpBotConversations, persistHelpBotConversations } from './helpBotStorage';
import { deriveConversationTitle } from './conversationTitle';
import { helpBotEngine } from './helpBotEngine';
import { createId } from '../logEvent/eventStorage';
import { useProfilesContext } from '../profiles/ProfilesProvider';
import { usePreferencesContext } from '../preferences/PreferencesProvider';
import { useFamilyContextInput } from '../ai/useFamilyContextInput';
import { useBlueprintContext } from '../blueprint/BlueprintProvider';
import { shouldShowDisclaimer } from '../aiEngine/disclaimer';

const RECENT_SAFETY_WINDOW = 4;

// Multiple conversation threads per child, ChatGPT-style. `sendMessage`
// always targets the conversation id captured at the moment it's called
// (not "whatever is current later"), so switching or creating a new chat
// while a reply is still generating can never cross-contaminate threads.
export function useHelpBotState() {
  const { currentChildId } = useProfilesContext();
  const { preferences } = usePreferencesContext();
  const familyContext = useFamilyContextInput();
  const { noteInteraction, noteSafetyEvent } = useBlueprintContext();

  const [conversations, setConversations] = useState<HelpBotConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [thinkingIds, setThinkingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!currentChildId) return;
    setLoaded(false);
    loadHelpBotConversations(currentChildId).then((stored) => {
      setConversations(stored);
      const mostRecent = [...stored].sort((a, b) => b.updatedAtISO.localeCompare(a.updatedAtISO))[0];
      setCurrentConversationId(mostRecent?.id ?? null);
      setLoaded(true);
    });
  }, [currentChildId]);

  useEffect(() => {
    if (loaded && currentChildId) {
      persistHelpBotConversations(currentChildId, conversations);
    }
  }, [conversations, loaded, currentChildId]);

  const activeConversations = useMemo(
    () => [...conversations].filter((c) => !c.archived).sort((a, b) => b.updatedAtISO.localeCompare(a.updatedAtISO)),
    [conversations]
  );
  const archivedConversations = useMemo(
    () => [...conversations].filter((c) => c.archived).sort((a, b) => b.updatedAtISO.localeCompare(a.updatedAtISO)),
    [conversations]
  );
  const currentConversation = useMemo(
    () => conversations.find((c) => c.id === currentConversationId) ?? null,
    [conversations, currentConversationId]
  );
  const messages = currentConversation?.messages ?? [];
  const isThinking = currentConversationId ? !!thinkingIds[currentConversationId] : false;

  function startNewConversation() {
    setCurrentConversationId(null);
  }

  function switchConversation(id: string) {
    setCurrentConversationId(id);
  }

  function renameConversation(id: string, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, title: trimmed } : c)));
  }

  function deleteConversation(id: string) {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  }

  function setArchived(id: string, archived: boolean) {
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, archived } : c)));
  }

  function deleteMessage(messageId: string) {
    if (!currentConversationId) return;
    setConversations((prev) =>
      prev.map((c) => (c.id === currentConversationId ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) } : c))
    );
  }

  function editMessage(messageId: string, newText: string) {
    const trimmed = newText.trim();
    if (!trimmed || !currentConversationId) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId
          ? { ...c, messages: c.messages.map((m) => (m.id === messageId ? { ...m, text: trimmed, edited: true } : m)) }
          : c
      )
    );
  }

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: HelpBotMessage = {
      id: createId(),
      role: 'user',
      text: trimmed,
      createdAtISO: new Date().toISOString(),
    };

    // If there's no active conversation, this message starts a brand new
    // one — nothing is written to storage for an empty "New Chat" until a
    // caregiver actually sends something, same as ChatGPT.
    const existing = conversations.find((c) => c.id === currentConversationId);
    const historyForEngine = existing?.messages ?? [];
    const targetId = existing?.id ?? createId();
    const now = new Date().toISOString();

    setConversations((prev) => {
      if (existing) {
        return prev.map((c) => (c.id === targetId ? { ...c, messages: [...c.messages, userMessage], updatedAtISO: now } : c));
      }
      const fresh: HelpBotConversation = {
        id: targetId,
        title: deriveConversationTitle(trimmed),
        messages: [userMessage],
        createdAtISO: now,
        updatedAtISO: now,
        archived: false,
      };
      return [...prev, fresh];
    });
    setCurrentConversationId(targetId);
    setThinkingIds((prev) => ({ ...prev, [targetId]: true }));

    const recentSafetyEvent = historyForEngine.slice(-RECENT_SAFETY_WINDOW).some((m) => m.isCrisisResponse);

    const response = await helpBotEngine.generateResponse(trimmed, historyForEngine, {
      recentEvents: familyContext.recentEvents,
      streak: familyContext.streak,
      totalLogs: familyContext.totalLogs,
      child: familyContext.child,
      completedLessonTitles: familyContext.completedLessonTitles,
      therapistMode: preferences.therapistMode,
      blueprintSummary: familyContext.blueprintSummary,
      recentSafetyEvent,
    });

    const recentDisclaimerFlags = historyForEngine
      .filter((m) => m.role === 'assistant')
      .slice(-4)
      .map((m) => !!m.showsDisclaimer);

    const assistantMessage: HelpBotMessage = {
      id: createId(),
      role: 'assistant',
      text: response.text,
      createdAtISO: new Date().toISOString(),
      quickReplies: response.quickReplies,
      actions: response.actions,
      isCrisisResponse: response.isCrisisResponse,
      framework: response.framework,
      interventionType: response.interventionType,
      showsDisclaimer: shouldShowDisclaimer(response.includeDisclaimer, recentDisclaimerFlags),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetId
          ? { ...c, messages: [...c.messages, assistantMessage], updatedAtISO: new Date().toISOString() }
          : c
      )
    );
    setThinkingIds((prev) => ({ ...prev, [targetId]: false }));

    // Fire-and-forget: refines the Family Blueprint in the background so it
    // never adds latency to the chat itself. Safety events are recorded
    // deterministically instead, and still land in the Blueprint.
    if (response.isCrisisResponse) {
      if (response.safetyCategory !== 'none') {
        noteSafetyEvent('helpBot', response.safetyCategory);
      }
    } else {
      noteInteraction('helpBot', `Caregiver: ${trimmed}\nHelp Bot: ${response.text}`);
    }
  }

  return {
    conversations,
    activeConversations,
    archivedConversations,
    currentConversation,
    currentConversationId,
    messages,
    isThinking,
    loaded,
    sendMessage,
    startNewConversation,
    switchConversation,
    renameConversation,
    deleteConversation,
    archiveConversation: (id: string) => setArchived(id, true),
    unarchiveConversation: (id: string) => setArchived(id, false),
    deleteMessage,
    editMessage,
  };
}
