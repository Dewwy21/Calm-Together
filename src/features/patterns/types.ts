export type ThemeId =
  | 'transitions'
  | 'bedtime'
  | 'homework'
  | 'siblingConflict'
  | 'screenTime'
  | 'mornings'
  | 'emotionalOutbursts'
  | 'caregiverBurnout';

export interface ThemeFrequencyEvidence {
  themeId: ThemeId;
  themeLabel: string;
  matchCount: number;
  outOfLast: number;
  commonHourLabel: string | null;
  /** 24 hourly buckets (0-23), count of matching events that occurred in each hour. */
  hourCounts: number[];
}

export interface CorrelationEvidence {
  activityLabel: string;
  metricLabel: string;
  withActivityAverage: number;
  withoutActivityAverage: number;
  withActivityDayCount: number;
  withoutActivityDayCount: number;
}

export interface TrendEvidence {
  metricLabel: string;
  weeklyAverages: { weekLabel: string; average: number | null }[];
  direction: 'improving' | 'worsening' | 'steady';
  changeDescription: string;
}

export type PatternEvidence =
  | { kind: 'frequency'; data: ThemeFrequencyEvidence }
  | { kind: 'correlation'; data: CorrelationEvidence }
  | { kind: 'trend'; data: TrendEvidence };

export interface DetectedPattern {
  id: string;
  title: string;
  /** Deterministic, factual, template-generated sentence — accuracy matters here, so this never comes from the AI. */
  summary: string;
  evidence: PatternEvidence;
  suggestedLessonTopic?: string;
}

/** The AI's plain-language "what this might mean" layer, keyed to a DetectedPattern.id. */
export interface PatternInterpretation {
  patternId: string;
  interpretation: string;
  suggestedLessonTopic: string | null;
}
