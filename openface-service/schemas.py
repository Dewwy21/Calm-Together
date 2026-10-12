"""Response schemas for the OpenFace service. Field names/types match the
schema in OPENFACE_ENGINEERING_NOTES.md / the Stage 3 spec exactly, so the
future Expo client (Stage 4) has one stable contract to parse against."""
from typing import Optional

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str  # "ready" | "unavailable"
    model: str
    modelLoaded: bool
    device: Optional[str]
    error: Optional[str] = None
    timestamp: str


class PredictResponse(BaseModel):
    success: bool
    faceDetected: bool
    # Always null for now — largest_face() computes a detection score
    # internally but discards it before returning the crop; exposing it
    # would mean modifying or duplicating the Stage-2-verified detection
    # logic, which Stage 3 explicitly avoids unless necessary. See README.
    faceConfidence: Optional[float] = None
    expressionProbabilities: Optional[dict] = None
    topExpression: Optional[str] = None
    topProbability: Optional[float] = None
    device: Optional[str] = None
    inferenceLatencyMs: Optional[float] = None
    totalProcessingLatencyMs: float
    timestamp: str
    message: Optional[str] = None
