export type AvatarColorKey = 'primary' | 'secondary' | 'accent' | 'warning';
export type ReadingSpeed = 'slower' | 'normal' | 'faster';
export type AiVoiceStyle = 'warm' | 'calm' | 'bright';
export type ReminderFrequency = 'off' | 'daily' | 'fewTimesWeek' | 'weekly';
export type ReminderTimeOfDay = 'morning' | 'midday' | 'evening';
export type MascotAccessory = 'none' | 'tea' | 'lantern' | 'backpack' | 'book';

// Device-local display preferences only — identity (name/email) lives on
// the authenticated user record instead (see src/features/auth/), so it
// has exactly one source of truth.
export interface AccountInfo {
  avatarUri?: string;
  avatarColorKey: AvatarColorKey;
  language: string;
  notificationsEnabled: boolean;
}

export interface AppPreferences {
  readingSpeed: ReadingSpeed;
  aiVoiceStyle: AiVoiceStyle;
  reminderFrequency: ReminderFrequency;
  reminderTimeOfDay: ReminderTimeOfDay;
  shareAnonymizedData: boolean;
  mascotAccessory: MascotAccessory;
  /** When on, AI responses name the evidence-based approach behind their advice. */
  therapistMode: boolean;
}

export const DEFAULT_ACCOUNT: AccountInfo = {
  avatarColorKey: 'primary',
  language: 'en',
  notificationsEnabled: true,
};

export const DEFAULT_PREFERENCES: AppPreferences = {
  readingSpeed: 'normal',
  aiVoiceStyle: 'warm',
  reminderFrequency: 'off',
  reminderTimeOfDay: 'morning',
  shareAnonymizedData: false,
  mascotAccessory: 'none',
  therapistMode: false,
};
