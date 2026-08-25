export function firstSentence(text: string, maxLength = 120): string {
  const trimmed = text.trim();
  if (!trimmed) return '';
  const match = trimmed.match(/^.*?[.!?](?=\s|$)/);
  let sentence = match ? match[0] : trimmed;
  if (sentence.length > maxLength) {
    sentence = `${sentence.slice(0, maxLength).trim()}…`;
  }
  return sentence;
}
