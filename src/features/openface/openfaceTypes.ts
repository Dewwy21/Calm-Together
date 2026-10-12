// Mirrors openface-service/schemas.py's PredictResponse/HealthResponse
// exactly — field names/types are the contract between this client and the
// Stage 3 FastAPI service. Keep these two in sync if the service schema
// ever changes.

export const EXPRESSION_KEYS = ['neutral', 'happy', 'sad', 'surprise', 'fear', 'disgust', 'anger', 'contempt'] as const;
export type ExpressionKey = (typeof EXPRESSION_KEYS)[number];

export type ExpressionProbabilities = Record<ExpressionKey, number>;

export interface OpenFaceHealth {
  status: 'ready' | 'unavailable';
  model: string;
  modelLoaded: boolean;
  device: string | null;
  error: string | null;
  timestamp: string;
}

export interface OpenFacePrediction {
  success: boolean;
  faceDetected: boolean;
  faceConfidence: number | null;
  expressionProbabilities: ExpressionProbabilities | null;
  topExpression: ExpressionKey | null;
  topProbability: number | null;
  device: string | null;
  inferenceLatencyMs: number | null;
  totalProcessingLatencyMs: number;
  timestamp: string;
  message: string | null;
}
