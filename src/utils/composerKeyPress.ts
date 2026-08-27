// Shared Enter/Shift+Enter behavior for every chat-style composer in the
// app (Help Bot, ACT Coach, Reflection, Simulator, Lesson Chat) — Enter
// submits, matching the send button; Shift+Enter inserts a newline like
// every other chat app. Only meant for composers that have an immediate
// adjacent send action; multi-field forms (feedback, weekly check-in, card
// creation) deliberately don't use this, since submitting a whole form on
// Enter while writing a note would be surprising and easy to trigger by
// accident.
export function handleComposerKeyPress(e: any, onSubmit: () => void): void {
  const nativeEvent = e?.nativeEvent ?? e;
  if (nativeEvent?.key !== 'Enter') return;
  if (nativeEvent?.shiftKey) return; // let the default newline insertion happen
  e.preventDefault?.();
  onSubmit();
}
