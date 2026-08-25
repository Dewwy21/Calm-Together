// Shared between anthropicClient.ts and openRouterClient.ts — kept in its
// own file so the two provider clients don't import from each other.
export class AiUnavailableError extends Error {}

export interface ClaudeChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
