import { useEffect, useMemo, useState } from 'react';
import { useDenContext } from '../den/DenProvider';
import { useCalmCornerContext } from '../calmCorner/CalmCornerProvider';
import { useFamilyContextInput } from '../ai/useFamilyContextInput';
import { getPatternInterpretations } from '../ai/patternInsights';
import { getDetectedPatterns } from './patternDetection';
import { PatternInterpretation } from './types';

export function usePatternInsights() {
  const den = useDenContext();
  const calmCorner = useCalmCornerContext();
  const familyContext = useFamilyContextInput();

  const patterns = useMemo(() => getDetectedPatterns(den.events, calmCorner.usageLog), [den.events, calmCorner.usageLog]);
  const patternIdsKey = patterns.map((p) => p.id).join(',');

  const [interpretations, setInterpretations] = useState<PatternInterpretation[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');

  useEffect(() => {
    if (patterns.length === 0) {
      setStatus('ready');
      return;
    }
    let cancelled = false;
    setStatus('loading');
    getPatternInterpretations(patterns, familyContext)
      .then((result) => {
        if (cancelled) return;
        setInterpretations(result);
        setStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patternIdsKey]);

  function interpretationFor(patternId: string) {
    return interpretations.find((i) => i.patternId === patternId);
  }

  return { patterns, status, interpretationFor };
}
