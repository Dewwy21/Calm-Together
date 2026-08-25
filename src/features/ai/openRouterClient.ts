import { z } from 'zod';
import { ClaudeChatMessage, AiUnavailableError } from './aiTypes';

// Placeholder AI backend for testing, per the user's request — routes the
// exact same structured calls every AI feature already makes through
// DeepSeek instead of Claude. See https://openrouter.ai/deepseek/deepseek-v4-flash-0731/llms.txt
// Swap back to Anthropic any time by setting EXPO_PUBLIC_AI_PROVIDER=anthropic
// in .env (see aiProvider.ts) — nothing else in the app needs to change.
export const OPENROUTER_MODEL = 'deepseek/deepseek-v4-flash-0731';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export function hasOpenRouterApiKey(): boolean {
  return !!process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
}

interface AskOpenRouterOptions<T extends z.ZodType> {
  system: string;
  messages: ClaudeChatMessage[];
  schema: T;
  maxTokens?: number;
  thinkingEnabled?: boolean;
}

// DeepSeek's structured-output support isn't confirmed as a strict native
// schema-enforcement mode (unlike Anthropic's zodOutputFormat), so this uses
// the more universally-compatible pattern instead: generic JSON mode plus
// the schema spelled out as prompt text, validated with schema.parse() on
// the way back out. z.toJSONSchema() is Zod's own built-in converter — no
// extra dependency needed for this.
export async function askOpenRouterStructured<T extends z.ZodType>({
  system,
  messages,
  schema,
  maxTokens = 1024,
  thinkingEnabled = false,
}: AskOpenRouterOptions<T>): Promise<z.infer<T>> {
  if (!hasOpenRouterApiKey()) {
    throw new AiUnavailableError('No OpenRouter API key is configured yet.');
  }

  const jsonSchema = z.toJSONSchema(schema);
  const schemaSystem = `${system}\n\nRespond with ONLY a single JSON object (no markdown fences, no commentary) that validates against this JSON Schema:\n${JSON.stringify(jsonSchema)}`;

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: maxTokens,
        response_format: { type: 'json_object' },
        reasoning: thinkingEnabled ? { effort: 'high' } : undefined,
        messages: [{ role: 'system', content: schemaSystem }, ...messages],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new AiUnavailableError(`OpenRouter request failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (typeof raw !== 'string') {
      throw new AiUnavailableError('The AI response had no content.');
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch {
      throw new AiUnavailableError('The AI response was not valid JSON.');
    }

    const result = schema.safeParse(parsedJson);
    if (!result.success) {
      throw new AiUnavailableError('The AI response did not match the expected shape.');
    }
    return result.data;
  } catch (err) {
    if (err instanceof AiUnavailableError) throw err;
    const message = err instanceof Error ? err.message : 'Unknown AI error';
    // eslint-disable-next-line no-console
    console.error('[openRouterClient] askOpenRouterStructured failed:', err);
    throw new AiUnavailableError(message);
  }
}
