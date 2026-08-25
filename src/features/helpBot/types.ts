import { LoggedEvent } from '../logEvent/types';
import { ChildProfile } from '../profiles/types';
import { InterventionType, SafetyCategory } from '../aiEngine/types';

export interface HelpBotAction {
  label: string;
  href: string;
}

export interface HelpBotMessage {
  id: string;
  role: 'assistant' | 'user';
  text: string;
  createdAtISO: string;
  /** only ever present on assistant messages */
  quickReplies?: string[];
  actions?: HelpBotAction[];
  /** flags a message that should render with the gentler "this matters" treatment — any safety category, not just self-harm */
  isCrisisResponse?: boolean;
  /** Therapist Mode only: the evidence-based approach behind this reply */
  framework?: string | null;
  /** The Decision Layer's chosen response type for this turn, null for safety short-circuits and fallbacks. */
  interventionType?: InterventionType | null;
  /** Whether the professional-disclaimer line should render under this message (already throttled — see aiEngine/disclaimer.ts). */
  showsDisclaimer?: boolean;
  /** Set once a caregiver edits this message's text in place — the stored `text` becomes the edited version. */
  edited?: boolean;
}

// One conversation thread — a caregiver can have as many of these as they
// like, same as ChatGPT. `title` is auto-derived from the first message
// (see conversationTitle.ts) until renamed.
export interface HelpBotConversation {
  id: string;
  title: string;
  messages: HelpBotMessage[];
  createdAtISO: string;
  updatedAtISO: string;
  archived: boolean;
}

// What the engine gets to work with when generating a reply. Deliberately
// a plain data bag (not a class, not tied to React) so a future engine
// implementation can consume the exact same shape.
export interface HelpBotContext {
  recentEvents: LoggedEvent[];
  streak: number;
  totalLogs: number;
  child: ChildProfile | null;
  completedLessonTitles: string[];
  therapistMode: boolean;
  /** The Family Blueprint's compact summary — read before every response. See src/features/blueprint/. */
  blueprintSummary?: string;
  /** True if a safety event was flagged in the last few turns of this conversation — softens the return to routine coaching. */
  recentSafetyEvent?: boolean;
}

export interface HelpBotResponse {
  text: string;
  quickReplies: string[];
  actions: HelpBotAction[];
  isCrisisResponse: boolean;
  framework?: string | null;
  interventionType: InterventionType | null;
  includeDisclaimer: boolean;
  safetyCategory: SafetyCategory;
}

// The seam the whole feature is built around: `helpBotEngine.ts` implements
// this on the shared AI Conversation Engine (see src/features/aiEngine/).
// Nothing in the UI (help-bot.tsx, useHelpBotState.ts) depends on how the
// response gets produced, only on this signature.
export interface HelpBotEngine {
  generateResponse(userMessage: string, history: HelpBotMessage[], context: HelpBotContext): Promise<HelpBotResponse>;
}
