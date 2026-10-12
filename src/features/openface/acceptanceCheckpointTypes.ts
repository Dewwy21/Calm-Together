// In-memory checkpoint result structure for the Stage 6 Acceptance lesson
// integration. Deliberately NOT persisted anywhere (no AsyncStorage, no
// Google Sheets) — held as local component state in the lesson player and
// discarded when the lesson is left, per the Stage 6 spec ("keep the
// checkpoint data in temporary memory... we will review the research
// storage design separately"). Field names/shape match section 10 of the
// Stage 6 spec exactly.

import type { ExpressionProbabilities } from './openfaceTypes';
import type { CaregiverReflectionResponse } from './CaregiverCheckInPrompt';

export interface AcceptanceCheckpointResult {
  anonymousParticipantId: string | null;
  sessionId: string;
  lessonId: string;
  checkpointId: string;
  baselineExpressionProbabilities: ExpressionProbabilities | null;
  activeExpressionProbabilities: ExpressionProbabilities | null;
  postExpressionProbabilities: ExpressionProbabilities | null;
  faceValidRatio: number | null;
  stateDistance: number | null;
  triggerCandidate: boolean;
  promptShown: boolean;
  promptDismissed: boolean;
  userReportedState: CaregiverReflectionResponse | 'skipped' | null;
  userReportedIntensity: number | null;
  lessonCompleted: boolean;
  timestamp: string;
}
