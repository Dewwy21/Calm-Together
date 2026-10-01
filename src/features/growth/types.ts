export type GrowthDimensionId =
  | 'dailyParentingStress'
  | 'emotionalRegulation'
  | 'consistency'
  | 'confidence'
  | 'communication'
  | 'stressRecovery';

export interface GrowthWeekPoint {
  weekLabel: string;
  /** 0-100, normalized so every dimension can share one chart component. Null = not enough data that week. */
  score: number | null;
  /** The real underlying number behind the score, always shown alongside it so the score is never opaque. */
  rawStat: string;
}

export interface GrowthDimension {
  id: GrowthDimensionId;
  label: string;
  /** What this proxy actually measures and why it matters — shown to the caregiver so the score is never mistaken for a clinical measurement. */
  description: string;
  weeklyPoints: GrowthWeekPoint[];
  overallScore: number | null;
  trend: 'improving' | 'declining' | 'steady' | 'notEnoughData';
  /**
   * A full plain-language sentence describing how this has actually changed
   * over time, always in the dimension's own real-world units (e.g.
   * "intensity/10", "days logged", "lessons a week") — never the normalized
   * 0-100 score. Null only when there isn't enough data yet to compare.
   * This is what makes the trend badge/score never "unexplained" — the
   * number is always shown next to the sentence that says what it means.
   */
  trendExplanation: string | null;
}

export interface GrowthMilestone {
  id: string;
  label: string;
}
