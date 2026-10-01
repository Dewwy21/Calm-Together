// Sends a signup/verification code email by reusing the SAME Google Apps
// Script /exec endpoint that researchLogger.ts already uses for research
// logging — but as a completely separate client, with its own request
// shape, so the research-logging code path is never touched or risked.
//
// This endpoint is NOT a secure email-sending service: it's a Google Apps
// Script web app the researcher already had deployed. There is no API key
// in this file because there is nothing to authenticate with — the script
// itself decides what "sendVerificationEmail" means (likely MailApp.sendEmail
// on the researcher's own Google account). That script must be updated by
// the researcher to actually branch on `action` and send the email; until
// then, this function will reach the endpoint but no email will go out.
//
// Kept intentionally small and isolated (one function, one job) so a real
// backend/email service can replace just this file later without touching
// useAuthState.ts's calling code or the rest of the auth system.

const ENDPOINT = process.env.EXPO_PUBLIC_RESEARCH_LOG_ENDPOINT;

export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  if (!ENDPOINT) {
    // eslint-disable-next-line no-console
    console.warn('[verificationEmailClient] EXPO_PUBLIC_RESEARCH_LOG_ENDPOINT is not set — cannot send verification email.');
    return false;
  }
  try {
    // Same text/plain CORS workaround as researchLogger.ts: a JSON
    // content-type triggers a browser CORS preflight that this Apps Script
    // deployment doesn't handle. text/plain is CORS-safelisted, and Apps
    // Script's doPost still reads the raw JSON string from e.postData.contents
    // regardless of the declared content type.
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'sendVerificationEmail', email, code }),
    });
    if (!response.ok) {
      // eslint-disable-next-line no-console
      console.warn('[verificationEmailClient] non-OK response sending verification email', response.status);
      return false;
    }
    // eslint-disable-next-line no-console
    console.log('[verificationEmailClient] verification email request sent for', email);
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[verificationEmailClient] failed to send verification email:', err);
    return false;
  }
}
