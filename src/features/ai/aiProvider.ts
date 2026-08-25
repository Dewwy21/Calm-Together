// Which AI backend every feature's calls actually go to, in one place.
// Every AI feature in this app (Help Bot, Parent Replay, the Simulator,
// AI Reflections, Personalized Lessons, the ACT Check-in, Lesson Chat,
// Growth Encouragement, Pattern Insights, Family Blueprint updates — and
// anything built the same way later) calls through `askClaudeStructured`
// in anthropicClient.ts, which reads this to decide where to send the
// request. Nothing else in the app needs to know which provider is active.
export type AiProvider = 'anthropic' | 'openrouter';

// Defaults to OpenRouter/DeepSeek since that's the one currently configured
// for testing (see openRouterClient.ts) — flip EXPO_PUBLIC_AI_PROVIDER to
// "anthropic" in .env to switch back to Claude once a real Anthropic key is
// in place, with no code changes needed anywhere else.
export function getAiProvider(): AiProvider {
  const raw = process.env.EXPO_PUBLIC_AI_PROVIDER;
  return raw === 'anthropic' ? 'anthropic' : 'openrouter';
}
