import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';
import { getAiProvider } from './aiProvider';
import { askOpenRouterStructured, hasOpenRouterApiKey } from './openRouterClient';
import { AiUnavailableError, ClaudeChatMessage } from './aiTypes';

// Client-side use of a real API key is only safe because this app isn't
// distributed publicly yet (confirmed with the user) — a shipped build
// would need a small backend proxy holding the key instead, since anything
// bundled into the client can be extracted. `dangerouslyAllowBrowser` is
// required because this app also runs under react-native-web, which the
// SDK detects as a browser environment. The key itself lives in a
// git-ignored .env file, never in source.
export const anthropic = new Anthropic({
  apiKey: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export const CLAUDE_MODEL = 'claude-opus-5';

// This is the one place every AI feature in the app checks before calling
// out — now provider-aware so the same gate covers whichever backend is
// active (see aiProvider.ts) without any consumer file needing to know.
export function hasApiKey(): boolean {
  return getAiProvider() === 'openrouter' ? hasOpenRouterApiKey() : !!process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
}

export { AiUnavailableError, ClaudeChatMessage };

interface AskClaudeOptions<T extends z.ZodType> {
  system: string;
  messages: ClaudeChatMessage[];
  schema: T;
  maxTokens?: number;
  /** Deeper reasoning for analysis-style calls (Parent Replay, coaching summaries); off for snappy chat turns. */
  thinkingEnabled?: boolean;
}

async function callProvider<T extends z.ZodType>(options: AskClaudeOptions<T>): Promise<z.infer<T>> {
  if (getAiProvider() === 'openrouter') {
    return askOpenRouterStructured(options);
  }
  return askAnthropicStructured(options);
}

// The one place every AI feature in the app calls through, so model choice,
// error handling, and defaults stay consistent. Structured output
// (output_config.format) means callers get a typed, already-parsed object
// back instead of parsing free text out of a chat reply. Dispatches to
// whichever provider is active (see aiProvider.ts) — every existing and
// future AI feature that calls this function automatically follows.
//
// Retries once on any failure. This matters most for OpenRouter/DeepSeek:
// that model reasons internally before writing its answer, and on some
// prompts the reasoning runs long enough to truncate the actual JSON
// output — intermittent and content-dependent (confirmed by direct
// testing), not something prompt wording alone fixes. A fresh retry turns
// "occasionally fails" into "very rarely fails twice in a row." A genuinely
// permanent failure (no API key configured) costs nothing extra to retry —
// that check is synchronous and throws before any network call.
export async function askClaudeStructured<T extends z.ZodType>(
  options: AskClaudeOptions<T>
): Promise<z.infer<T>> {
  try {
    return await callProvider(options);
  } catch (firstErr) {
    // eslint-disable-next-line no-console
    console.warn('[anthropicClient] first attempt failed, retrying once:', firstErr);
    return await callProvider(options);
  }
}

async function askAnthropicStructured<T extends z.ZodType>({
  system,
  messages,
  schema,
  maxTokens = 1024,
  thinkingEnabled = false,
}: AskClaudeOptions<T>): Promise<z.infer<T>> {
  if (!hasApiKey()) {
    throw new AiUnavailableError('No Anthropic API key is configured yet.');
  }

  try {
    const response = await anthropic.messages.parse({
      model: CLAUDE_MODEL,
      max_tokens: maxTokens,
      system,
      thinking: thinkingEnabled ? { type: 'adaptive' } : { type: 'disabled' },
      output_config: {
        effort: thinkingEnabled ? 'high' : 'medium',
        format: zodOutputFormat(schema),
      },
      messages,
    });

    if (response.parsed_output === null || response.parsed_output === undefined) {
      throw new AiUnavailableError('The AI response could not be parsed.');
    }
    return response.parsed_output;
  } catch (err) {
    if (err instanceof AiUnavailableError) throw err;
    const message = err instanceof Error ? err.message : 'Unknown AI error';
    // eslint-disable-next-line no-console
    console.error('[anthropicClient] askClaudeStructured failed:', err);
    throw new AiUnavailableError(message);
  }
}
