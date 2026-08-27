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

// deepseek-v4-flash reasons internally before writing its actual answer,
// and that reasoning is billed against the same max_tokens ceiling as the
// visible output — confirmed by direct testing: identical requests at
// max_tokens 512 came back with finish_reason "length" and completely
// empty content on some prompts (reasoning alone consumed the whole
// budget), while others produced a real but truncated, unparseable JSON
// object. Reasoning length is content-dependent (longer/more emotionally
// loaded prompts reason more), which is exactly why this failed
// intermittently rather than for every call. `exclude: true` keeps the
// reasoning text out of the response body (this app never displays it),
// and `effort` is tuned down for non-thinking calls specifically to spend
// fewer reasoning tokens in the first place, not just hide them.
// Validated by direct testing against the hardest real prompts: at a 700
// (non-thinking) buffer, complex/emotionally loaded messages could still
// spend 1000+ tokens on reasoning alone and hit the ceiling. 1600/2500
// left every tested case with hundreds of tokens of headroom to spare.
const REASONING_TOKEN_BUFFER = { thinking: 2500, standard: 1600 } as const;

function stripToJson(raw: string): string {
  // Defense in depth: even with explicit "no markdown fences" instructions,
  // a model occasionally wraps its answer in ```json ... ``` anyway. Strip
  // fences if present, then fall back to the first {...} span in the text.
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced ? fenced[1] : raw;
  const firstBrace = candidate.indexOf('{');
  const lastBrace = candidate.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) return candidate.trim();
  return candidate.slice(firstBrace, lastBrace + 1);
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
  const reasoningBuffer = thinkingEnabled ? REASONING_TOKEN_BUFFER.thinking : REASONING_TOKEN_BUFFER.standard;

  // Without a client-side timeout, a request that hangs on OpenRouter's end
  // (observed during testing — occasional multi-minute stalls on one of the
  // several backend providers OpenRouter routes this model to) leaves the
  // caller's loading state stuck forever, since askClaudeStructured's retry
  // only helps once the first attempt actually settles. Aborting here
  // guarantees it settles one way or another within a bounded time.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        max_tokens: maxTokens + reasoningBuffer,
        response_format: { type: 'json_object' },
        reasoning: { effort: thinkingEnabled ? 'high' : 'low', exclude: true },
        // OpenRouter load-balances this model across many third-party
        // inference providers with wildly different speed/reliability —
        // confirmed by direct testing: some calls landed on providers that
        // took 80+ seconds or never returned before the abort timeout,
        // while sorting by throughput consistently landed on providers
        // responding in well under 2 seconds across a dozen test calls.
        provider: { sort: 'throughput' },
        messages: [{ role: 'system', content: schemaSystem }, ...messages],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new AiUnavailableError(`OpenRouter request failed (${response.status}): ${body}`);
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (typeof raw !== 'string' || !raw.trim()) {
      throw new AiUnavailableError(`The AI response had no content (finish_reason: ${data?.choices?.[0]?.finish_reason}).`);
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(stripToJson(raw));
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
    if (err instanceof Error && err.name === 'AbortError') {
      throw new AiUnavailableError('The AI took too long to respond.');
    }
    const message = err instanceof Error ? err.message : 'Unknown AI error';
    // eslint-disable-next-line no-console
    console.error('[openRouterClient] askOpenRouterStructured failed:', err);
    throw new AiUnavailableError(message);
  } finally {
    clearTimeout(timeoutId);
  }
}
