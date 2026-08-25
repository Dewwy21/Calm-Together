const MAX_TITLE_LENGTH = 48;

// Auto-title from the first message, same idea as ChatGPT's default chat
// names — collapses whitespace/newlines so a multi-line message doesn't
// produce a broken-looking title, then truncates with an ellipsis.
export function deriveConversationTitle(firstMessageText: string): string {
  const collapsed = firstMessageText.trim().replace(/\s+/g, ' ');
  if (!collapsed) return 'New Conversation';
  if (collapsed.length <= MAX_TITLE_LENGTH) return collapsed;
  return `${collapsed.slice(0, MAX_TITLE_LENGTH).trim()}…`;
}
