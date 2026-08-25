import { LoggedEvent } from '../logEvent/types';
import { GrowthDimension, GrowthWeekPoint } from './types';

const WEEKS = 8;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

function average(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}

function weekLabel(index: number): string {
  const weeksAgo = WEEKS - 1 - index;
  return weeksAgo === 0 ? 'This week' : `${weeksAgo}w ago`;
}

// Index 0 = the oldest of the last WEEKS weeks, index WEEKS-1 = this week.
function weekBucketIndex(iso: string): number | null {
  const weeksAgo = Math.floor((Date.now() - new Date(iso).getTime()) / WEEK_MS);
  if (weeksAgo < 0 || weeksAgo >= WEEKS) return null;
  return WEEKS - 1 - weeksAgo;
}

function startOfWeekBucket(index: number): number {
  const weeksAgo = WEEKS - 1 - index;
  return Date.now() - (weeksAgo + 1) * WEEK_MS;
}

function summarize(weeklyPoints: GrowthWeekPoint[]): { overallScore: number | null; trend: GrowthDimension['trend'] } {
  const withData = weeklyPoints.filter((p): p is GrowthWeekPoint & { score: number } => p.score !== null);
  if (withData.length === 0) return { overallScore: null, trend: 'notEnoughData' };

  const recent = withData.slice(-4);
  const overallScore = Math.round(average(recent.map((p) => p.score)));
  if (withData.length < 3) return { overallScore, trend: 'notEnoughData' };

  const mid = Math.floor(withData.length / 2);
  const firstAvg = average(withData.slice(0, mid).map((p) => p.score));
  const secondAvg = average(withData.slice(mid).map((p) => p.score));
  const diff = secondAvg - firstAvg;

  let trend: GrowthDimension['trend'] = 'steady';
  if (diff > 6) trend = 'improving';
  else if (diff < -6) trend = 'declining';
  return { overallScore, trend };
}

// The caregiver-facing "how has this actually changed" sentence. Always
// built from the dimension's own real-world units (never the normalized
// 0-100 score), and only ever a plain comparison — no interpretation the
// caregiver has to do themselves. Mirrors summarize()'s "first half of
// weeks with data vs second half" comparison, but on the real numbers.
function describeTrend(
  weeklyRaw: (number | null)[],
  opts: { higherIsBetter: boolean; format: (value: number) => string; subject: string }
): string | null {
  const withData = weeklyRaw.filter((v): v is number => v !== null);
  if (withData.length < 3) return null;

  const mid = Math.floor(withData.length / 2);
  const firstAvg = average(withData.slice(0, mid));
  const secondAvg = average(withData.slice(mid));
  const from = opts.format(firstAvg);
  const to = opts.format(secondAvg);

  if (from === to) {
    return `${opts.subject} has held fairly steady, at ${to}, over this period.`;
  }
  const improved = opts.higherIsBetter ? secondAvg > firstAvg : secondAvg < firstAvg;
  return `${opts.subject} has gone from ${from} to ${to} over this period${improved ? ', a good direction' : ''}.`;
}

// Weeks entirely before the caregiver's first-ever recorded activity get no
// score at all (not a 0) — there's no honest way to measure "consistency"
// or "regulation" for a period before the family started using the app.
function buildWeeklyPoints(
  firstActivityMs: number | null,
  compute: (index: number) => { score: number | null; rawStat: string }
): GrowthWeekPoint[] {
  return Array.from({ length: WEEKS }, (_, i) => {
    const label = weekLabel(i);
    if (firstActivityMs !== null && startOfWeekBucket(i) + WEEK_MS < firstActivityMs) {
      return { weekLabel: label, score: null, rawStat: 'Before your first log' };
    }
    const { score, rawStat } = compute(i);
    return { weekLabel: label, score, rawStat };
  });
}

function computeEmotionalRegulation(events: LoggedEvent[], firstActivityMs: number | null): GrowthDimension {
  const buckets: number[][] = Array.from({ length: WEEKS }, () => []);
  events
    .filter((e) => e.eventType === 'meltdown' || e.eventType === 'parentReaction')
    .forEach((e) => {
      const idx = weekBucketIndex(e.occurredAtISO);
      if (idx !== null) buckets[idx].push(e.intensity);
    });

  const weeklyPoints = buildWeeklyPoints(firstActivityMs, (i) => {
    const b = buckets[i];
    if (b.length === 0) return { score: null, rawStat: 'No hard moments logged' };
    const avg = average(b);
    return { score: Math.round(100 - (avg / 10) * 100), rawStat: `avg intensity ${avg.toFixed(1)}/10` };
  });

  const trendExplanation = describeTrend(
    buckets.map((b) => (b.length ? average(b) : null)),
    { higherIsBetter: false, format: (v) => `${v.toFixed(1)}/10`, subject: 'Average intensity during hard moments' }
  );

  return {
    id: 'emotionalRegulation',
    label: 'Emotional Regulation',
    description: 'What this measures: the average intensity (1-10) you rated logged meltdowns and parent reactions each week. Why it matters: lower intensity over time suggests hard moments are becoming easier to move through, for both of you.',
    weeklyPoints,
    trendExplanation,
    ...summarize(weeklyPoints),
  };
}

function computeConsistency(events: LoggedEvent[], firstActivityMs: number | null): GrowthDimension {
  const daysByWeek: Set<string>[] = Array.from({ length: WEEKS }, () => new Set());
  events.forEach((e) => {
    const idx = weekBucketIndex(e.occurredAtISO);
    if (idx !== null) daysByWeek[idx].add(new Date(e.occurredAtISO).toDateString());
  });

  const weeklyPoints = buildWeeklyPoints(firstActivityMs, (i) => {
    const days = daysByWeek[i].size;
    return { score: Math.round((days / 7) * 100), rawStat: `${days} of 7 days logged` };
  });

  const trendExplanation = describeTrend(
    daysByWeek.map((set, i) => (weeklyPoints[i].rawStat === 'Before your first log' ? null : set.size)),
    { higherIsBetter: true, format: (v) => `about ${v.toFixed(1)} of 7 days a week`, subject: 'How many days a week you log' }
  );

  return {
    id: 'consistency',
    label: 'Consistency',
    description: "What this measures: how many days each week you added at least one Daily Log entry. Why it matters: this is a proxy for how consistently you're keeping up the logging habit — not for how your week actually went.",
    weeklyPoints,
    trendExplanation,
    ...summarize(weeklyPoints),
  };
}

function computeConfidence(lessonCompletionDates: Date[], firstActivityMs: number | null): GrowthDimension {
  const buckets = new Array(WEEKS).fill(0);
  lessonCompletionDates.forEach((d) => {
    const idx = weekBucketIndex(d.toISOString());
    if (idx !== null) buckets[idx]++;
  });

  const weeklyPoints = buildWeeklyPoints(firstActivityMs, (i) => {
    const count = buckets[i];
    return { score: Math.round(Math.min(count / 2, 1) * 100), rawStat: `${count} lesson${count === 1 ? '' : 's'} completed` };
  });

  const trendExplanation = describeTrend(
    buckets.map((count, i) => (weeklyPoints[i].rawStat === 'Before your first log' ? null : count)),
    { higherIsBetter: true, format: (v) => `about ${v.toFixed(1)} lessons a week`, subject: 'How many lessons you complete' }
  );

  return {
    id: 'confidence',
    label: 'Confidence',
    description: "What this measures: how many Parent Learning Series lessons you complete each week. Why it matters: this is a proxy — learning and practicing new strategies tends to build confidence handling hard moments.",
    weeklyPoints,
    trendExplanation,
    ...summarize(weeklyPoints),
  };
}

function computeCommunication(helpBotUserMessageDates: Date[], firstActivityMs: number | null): GrowthDimension {
  const buckets = new Array(WEEKS).fill(0);
  helpBotUserMessageDates.forEach((d) => {
    const idx = weekBucketIndex(d.toISOString());
    if (idx !== null) buckets[idx]++;
  });

  const weeklyPoints = buildWeeklyPoints(firstActivityMs, (i) => {
    const count = buckets[i];
    return { score: Math.round(Math.min(count / 5, 1) * 100), rawStat: `${count} Help Bot message${count === 1 ? '' : 's'}` };
  });

  const trendExplanation = describeTrend(
    buckets.map((count, i) => (weeklyPoints[i].rawStat === 'Before your first log' ? null : count)),
    { higherIsBetter: true, format: (v) => `about ${v.toFixed(1)} Help Bot messages a week`, subject: 'How often you talk things through with Help Bot' }
  );

  return {
    id: 'communication',
    label: 'Communication',
    description: "What this measures: how often you message Help Bot each week. Why it matters: this is a stand-in for how much active communication and processing is happening, not a measure of how well you communicate.",
    weeklyPoints,
    trendExplanation,
    ...summarize(weeklyPoints),
  };
}

function computeStressRecovery(events: LoggedEvent[], firstActivityMs: number | null): GrowthDimension {
  const sorted = [...events].sort((a, b) => a.occurredAtISO.localeCompare(b.occurredAtISO));
  const hardMoments = sorted.filter((e) => (e.eventType === 'meltdown' || e.eventType === 'parentReaction') && e.intensity >= 7);

  const totalByWeek = new Array(WEEKS).fill(0);
  const recoveredByWeek = new Array(WEEKS).fill(0);

  hardMoments.forEach((hard) => {
    const idx = weekBucketIndex(hard.occurredAtISO);
    if (idx === null) return;
    totalByWeek[idx]++;

    const hardTime = new Date(hard.occurredAtISO).getTime();
    const recovered = sorted.some((e) => {
      const t = new Date(e.occurredAtISO).getTime();
      if (t <= hardTime || t - hardTime > 2 * DAY_MS) return false;
      return e.eventType === 'positiveMoment' || ((e.eventType === 'meltdown' || e.eventType === 'parentReaction') && e.intensity <= 4);
    });
    if (recovered) recoveredByWeek[idx]++;
  });

  const weeklyPoints = buildWeeklyPoints(firstActivityMs, (i) => {
    const total = totalByWeek[i];
    if (total === 0) return { score: null, rawStat: 'No hard moments to recover from' };
    const rate = recoveredByWeek[i] / total;
    return { score: Math.round(rate * 100), rawStat: `${recoveredByWeek[i]} of ${total} bounced back within 2 days` };
  });

  // A ratio-of-sums comparison rather than an average-of-averages, and
  // phrased as literal counts ("X of Y") rather than a percentage, so
  // there's nothing left for the caregiver to interpret themselves.
  const withDataWeeks = weeklyPoints
    .map((p, i) => ({ i, hasData: p.score !== null }))
    .filter((w) => w.hasData)
    .map((w) => w.i);
  let trendExplanation: string | null = null;
  if (withDataWeeks.length >= 3) {
    const mid = Math.floor(withDataWeeks.length / 2);
    const firstWeeks = withDataWeeks.slice(0, mid);
    const secondWeeks = withDataWeeks.slice(mid);
    const sum = (weeks: number[], arr: number[]) => weeks.reduce((a, i) => a + arr[i], 0);
    const firstRecovered = sum(firstWeeks, recoveredByWeek);
    const firstTotal = sum(firstWeeks, totalByWeek);
    const secondRecovered = sum(secondWeeks, recoveredByWeek);
    const secondTotal = sum(secondWeeks, totalByWeek);
    const firstRate = firstTotal ? firstRecovered / firstTotal : 0;
    const secondRate = secondTotal ? secondRecovered / secondTotal : 0;
    trendExplanation = `Earlier in this period, ${firstRecovered} of ${firstTotal} hard moments were followed by something lighter or positive within 2 days. More recently, that's ${secondRecovered} of ${secondTotal}${secondRate > firstRate ? ', a good direction' : ''}.`;
  }

  return {
    id: 'stressRecovery',
    label: 'Stress Recovery',
    description: 'What this measures: how often a hard moment (intensity 7 or higher) is followed within 48 hours by something lighter or positive. Why it matters: this is a proxy for how quickly things settle back down after a difficult moment.',
    weeklyPoints,
    trendExplanation,
    ...summarize(weeklyPoints),
  };
}

export function computeGrowthDimensions(input: {
  events: LoggedEvent[];
  lessonCompletionDates: Date[];
  helpBotUserMessageDates: Date[];
}): GrowthDimension[] {
  const allTimestamps = [
    ...input.events.map((e) => new Date(e.occurredAtISO).getTime()),
    ...input.lessonCompletionDates.map((d) => d.getTime()),
    ...input.helpBotUserMessageDates.map((d) => d.getTime()),
  ];
  const firstActivityMs = allTimestamps.length ? Math.min(...allTimestamps) : null;

  return [
    computeEmotionalRegulation(input.events, firstActivityMs),
    computeConsistency(input.events, firstActivityMs),
    computeConfidence(input.lessonCompletionDates, firstActivityMs),
    computeCommunication(input.helpBotUserMessageDates, firstActivityMs),
    computeStressRecovery(input.events, firstActivityMs),
  ];
}
