import { useEffect, useMemo, useState } from 'react';
import { useDenContext } from '../den/DenProvider';
import { useProfilesContext } from '../profiles/ProfilesProvider';
import { useCourseProgressContext } from '../courses/CourseProgressProvider';
import { useFamilyContextInput } from '../ai/useFamilyContextInput';
import { getGrowthEncouragement } from '../ai/growthEncouragement';
import { loadAllHelpBotMessages } from '../helpBot/helpBotStorage';
import { computeGrowthDimensions } from './growthMetrics';

export function useGrowthTimeline() {
  const den = useDenContext();
  const { currentChildId } = useProfilesContext();
  const courseProgress = useCourseProgressContext();
  const familyContext = useFamilyContextInput();

  const [helpBotUserMessageDates, setHelpBotUserMessageDates] = useState<Date[] | null>(null);

  useEffect(() => {
    if (!currentChildId) return;
    loadAllHelpBotMessages(currentChildId).then((messages) => {
      setHelpBotUserMessageDates(messages.filter((m) => m.role === 'user').map((m) => new Date(m.createdAtISO)));
    });
  }, [currentChildId]);

  const dimensions = useMemo(() => {
    if (helpBotUserMessageDates === null) return null;
    return computeGrowthDimensions({
      events: den.events,
      lessonCompletionDates: courseProgress.completedDates,
      helpBotUserMessageDates,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [den.events, courseProgress.completedDates, helpBotUserMessageDates]);

  const [encouragement, setEncouragement] = useState<{ message: string; strategyReminder: string | null } | null>(null);
  const [encouragementStatus, setEncouragementStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const scoreKey = dimensions?.map((d) => `${d.id}:${d.overallScore}`).join(',');

  useEffect(() => {
    if (!dimensions) return;
    const hasAnyData = dimensions.some((d) => d.overallScore !== null);
    if (!hasAnyData) {
      setEncouragementStatus('ready');
      return;
    }
    let cancelled = false;
    setEncouragementStatus('loading');
    getGrowthEncouragement(dimensions, familyContext)
      .then((result) => {
        if (cancelled) return;
        setEncouragement(result);
        setEncouragementStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setEncouragementStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoreKey]);

  return { dimensions, encouragement, encouragementStatus };
}
