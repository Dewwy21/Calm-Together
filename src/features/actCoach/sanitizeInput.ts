const MAX_LENGTH = 1000;

// This app renders user text through React Native's <Text>, which never
// interprets its content as markup (no innerHTML-equivalent anywhere in the
// render path), so there's no script-injection vector from displaying it
// back on screen. This still strips angle-bracket tags and control
// characters before the text is sent to the AI or stored, as defense in
// depth, and enforces the same character cap the UI already limits typing
// to — so a submission can't bypass it via paste.
export function sanitizeParentMessage(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .trim()
    .slice(0, MAX_LENGTH);
}

export { MAX_LENGTH as MAX_MESSAGE_LENGTH };
