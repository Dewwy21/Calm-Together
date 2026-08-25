import { LoggedEvent } from '../logEvent/types';
import { getSubtypeLabel } from '../logEvent/subtypeOptions';
import { RecentUse } from '../calmCorner/calmCornerStorage';
import { DetectedPattern, ThemeId } from './types';
import { THEME_LABELS, matchThemes } from './themeKeywords';

const RECENT_WINDOW = 12;
const FREQUENCY_THRESHOLD = 3;
const MIN_DAYS_PER_GROUP = 3;
const TREND_WEEKS = 6;
const DAY_MS = 24 * 60 * 60 * 1000;

function eventText(event: LoggedEvent): string {
  return [
    event.whatHappened,
    event.before,
    event.after,
    event.consequences,
    event.additionalNotes,
    event.meaningfulMoment,
    event.childStrength,
    event.caregiverContribution,
    event.feelingReflection,
    event.memorableDetail,
    event.repeatStrategy,
    getSubtypeLabel(event.eventType, event.subtype),
  ]
    .filter(Boolean)
    .join(' ');
}

function average(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function hourLabel(hour: number): string {
  const period = hour < 12 ? 'AM' : 'PM';
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h} ${period}`;
}

function modeHour(dates: Date[]): number | null {
  if (!dates.length) return null;
  const counts = new Array(24).fill(0);
  dates.forEach((d) => counts[d.getHours()]++);
  let best = 0;
  for (let i = 1; i < 24; i++) if (counts[i] > counts[best]) best = i;
  return counts[best] > 0 ? best : null;
}

// Recurring themes across recent logs — "video game transitions have shown
// up in 6 of your last 12 logs, usually around 7 PM." All numbers here come
// straight from a keyword scan of the caregiver's own entries, never the AI.
export function detectThemeFrequencyPatterns(events: LoggedEvent[]): DetectedPattern[] {
  const sorted = [...events].sort((a, b) => a.occurredAtISO.localeCompare(b.occurredAtISO));
  const recent = sorted.slice(-RECENT_WINDOW);
  if (recent.length < 4) return [];

  const patterns: DetectedPattern[] = [];

  (Object.keys(THEME_LABELS) as ThemeId[]).forEach((themeId) => {
    const matches = recent.filter((e) => matchThemes(eventText(e)).includes(themeId));
    if (matches.length < FREQUENCY_THRESHOLD) return;

    const hours = matches.map((e) => new Date(e.occurredAtISO));
    const hour = modeHour(hours);
    const hourCounts = new Array(24).fill(0);
    hours.forEach((d) => hourCounts[d.getHours()]++);

    patterns.push({
      id: `freq-${themeId}`,
      title: THEME_LABELS[themeId],
      summary: `${THEME_LABELS[themeId]} came up in ${matches.length} of your last ${recent.length} logs${
        hour !== null ? `, usually around ${hourLabel(hour)}` : ''
      }.`,
      evidence: {
        kind: 'frequency',
        data: {
          themeId,
          themeLabel: THEME_LABELS[themeId],
          matchCount: matches.length,
          outOfLast: recent.length,
          commonHourLabel: hour !== null ? hourLabel(hour) : null,
          hourCounts,
        },
      },
      suggestedLessonTopic: THEME_LABELS[themeId],
    });
  });

  return patterns.sort((a, b) => {
    const am = a.evidence.kind === 'frequency' ? a.evidence.data.matchCount : 0;
    const bm = b.evidence.kind === 'frequency' ? b.evidence.data.matchCount : 0;
    return bm - am;
  });
}

// "Your intensity ratings are consistently lower on days you complete a
// Calm Corner exercise." Compares average same-day intensity of hard
// moments on days Calm Corner was opened vs. days it wasn't.
export function detectCalmCornerCorrelation(events: LoggedEvent[], calmCornerUsageLog: RecentUse[]): DetectedPattern | null {
  const stressEvents = events.filter((e) => e.eventType === 'meltdown' || e.eventType === 'parentReaction');
  if (stressEvents.length < 6) return null;

  const usedDates = new Set(calmCornerUsageLog.map((u) => new Date(u.lastUsedISO).toDateString()));

  const byDay = new Map<string, number[]>();
  stressEvents.forEach((e) => {
    const day = new Date(e.occurredAtISO).toDateString();
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(e.intensity);
  });

  const withActivity: number[] = [];
  const withoutActivity: number[] = [];
  byDay.forEach((intensities, day) => {
    const dayAvg = average(intensities);
    (usedDates.has(day) ? withActivity : withoutActivity).push(dayAvg);
  });

  if (withActivity.length < MIN_DAYS_PER_GROUP || withoutActivity.length < MIN_DAYS_PER_GROUP) return null;

  const withAvg = average(withActivity);
  const withoutAvg = average(withoutActivity);
  if (Math.abs(withAvg - withoutAvg) < 0.3) return null;

  const lower = withAvg < withoutAvg;

  return {
    id: 'correlation-calm-corner',
    title: 'Calm Corner and Intensity',
    summary: `Your intensity ratings are consistently ${lower ? 'lower' : 'higher'} on days you use a Calm Corner exercise (${withAvg.toFixed(
      1
    )}/10 vs ${withoutAvg.toFixed(1)}/10 on days you don't).`,
    evidence: {
      kind: 'correlation',
      data: {
        activityLabel: 'Calm Corner use',
        metricLabel: 'Average intensity that day',
        withActivityAverage: withAvg,
        withoutActivityAverage: withoutAvg,
        withActivityDayCount: withActivity.length,
        withoutActivityDayCount: withoutActivity.length,
      },
    },
  };
}

// Six-week trend in how intense hard moments have been running, comparing
// the earlier half of the window to the more recent half.
export function detectIntensityTrend(events: LoggedEvent[]): DetectedPattern | null {
  const stressEvents = events.filter((e) => e.eventType === 'meltdown' || e.eventType === 'parentReaction');
  if (stressEvents.length < 6) return null;

  const now = Date.now();
  const buckets: number[][] = Array.from({ length: TREND_WEEKS }, () => []);
  stressEvents.forEach((e) => {
    const weeksAgo = Math.floor((now - new Date(e.occurredAtISO).getTime()) / (7 * DAY_MS));
    if (weeksAgo >= 0 && weeksAgo < TREND_WEEKS) {
      buckets[TREND_WEEKS - 1 - weeksAgo].push(e.intensity);
    }
  });

  const weeklyAverages = buckets.map((b, i) => ({
    weekLabel: i === TREND_WEEKS - 1 ? 'This week' : `${TREND_WEEKS - 1 - i}w ago`,
    average: b.length ? average(b) : null,
  }));

  const withData = weeklyAverages.filter((w) => w.average !== null);
  if (withData.length < 4) return null;

  const mid = Math.floor(withData.length / 2);
  const firstAvg = average(withData.slice(0, mid).map((w) => w.average as number));
  const secondAvg = average(withData.slice(mid).map((w) => w.average as number));
  const diff = firstAvg - secondAvg;

  let direction: 'improving' | 'worsening' | 'steady' = 'steady';
  if (diff > 0.4) direction = 'improving';
  else if (diff < -0.4) direction = 'worsening';

  const changeDescription =
    direction === 'improving'
      ? `Average intensity has eased from about ${firstAvg.toFixed(1)} to ${secondAvg.toFixed(1)} over this period.`
      : direction === 'worsening'
      ? `Average intensity has climbed from about ${firstAvg.toFixed(1)} to ${secondAvg.toFixed(1)} over this period.`
      : `Average intensity has stayed fairly steady, around ${secondAvg.toFixed(1)}.`;

  return {
    id: 'trend-intensity',
    title:
      direction === 'improving' ? 'Intensity Is Trending Down' : direction === 'worsening' ? 'Intensity Is Trending Up' : 'Intensity Has Been Steady',
    summary: changeDescription,
    evidence: { kind: 'trend', data: { metricLabel: 'Average intensity (meltdowns & reactions)', weeklyAverages, direction, changeDescription } },
  };
}

export function getDetectedPatterns(events: LoggedEvent[], calmCornerUsageLog: RecentUse[]): DetectedPattern[] {
  const patterns: DetectedPattern[] = [...detectThemeFrequencyPatterns(events)];
  const correlation = detectCalmCornerCorrelation(events, calmCornerUsageLog);
  if (correlation) patterns.push(correlation);
  const trend = detectIntensityTrend(events);
  if (trend) patterns.push(trend);
  return patterns;
}
