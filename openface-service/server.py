"""FastAPI service wrapping the Stage 2 OpenFace 3.0 implementation.

Imports load_models / largest_face / emotion_scores / EMOTIONS directly from
openface3_emotion.py rather than reimplementing any of it — that file is
untouched and still runs standalone exactly as it did in Stage 2.

Concurrency note (see Stage 3 spec section 13): /predict is a plain `def`
handler, not `async def`. FastAPI/Starlette automatically runs sync route
handlers in a thread pool, so a slow inference call never blocks the event
loop — /health stays responsive even mid-inference. A plain threading.Lock
serializes the actual model-touching section across those worker threads,
which is what "prevent concurrent requests from corrupting shared model
state" asks for. For a local, single-user, low-concurrency Phase 1 service
(sequential camera frames, not many simultaneous callers), simple
serialization is the right tradeoff over a real request queue — correctness
over throughput, as the spec asks for.
"""
from __future__ import annotations

import os
import threading
import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional

import cv2
import numpy as np
import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from openface3_emotion import EMOTIONS, emotion_scores, largest_face, load_models
from schemas import HealthResponse, PredictResponse

MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10MB — reject anything larger before decoding
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"}

# Mutable service state, populated once at startup — never reloaded per request.
state: dict = {"detector": None, "model": None, "device": None, "model_loaded": False, "init_error": None}
model_lock = threading.Lock()


def pick_device() -> str:
    return "mps" if torch.backends.mps.is_available() else "cpu"


# Matches the frontend's actual capture resolution (OpenFaceTestPanel.tsx's
# CAPTURE_WIDTH/CAPTURE_HEIGHT) — RetinaFace's PriorBox computation depends
# on input frame dimensions, so warming up at a different shape than real
# requests wouldn't fully pre-compile the kernels real traffic actually hits.
WARMUP_FRAME_WIDTH = 640
WARMUP_FRAME_HEIGHT = 480


def _warm_up_model() -> None:
    """One-time synthetic inference at startup to pay the ~1.2s MPS kernel
    compilation cost before any real request arrives, not during one.
    Runs the detector and the emotion model separately on random noise —
    random input has no real face, so largest_face() alone wouldn't
    necessarily warm up emotion_scores()'s kernels (never reached without a
    detected face). Deterministic, read-only (model.eval() + no_grad already
    in both functions) — discards its own output and touches no shared
    state, so it cannot alter any real request's result. See Stage 4.5
    verification: two identical real requests produce identical output."""
    if not state["model_loaded"]:
        return
    device = state["device"]
    try:
        warmup_start = time.perf_counter()
        synthetic_frame = np.random.randint(0, 255, (WARMUP_FRAME_HEIGHT, WARMUP_FRAME_WIDTH, 3), dtype=np.uint8)
        largest_face(state["detector"], synthetic_frame)  # exercises the detector's forward pass regardless of whether NMS finds anything

        synthetic_face = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        emotion_scores(state["model"], synthetic_face, device)  # exercises the MTL model's forward pass directly, not gated on detection

        warmup_ms = (time.perf_counter() - warmup_start) * 1000
        print(f"[openface-service] warm-up complete on device={device} in {warmup_ms:.1f}ms")
    except Exception as err:
        # Warm-up is an optimization, not a correctness requirement — a
        # failure here just means the first real request pays the full
        # cost, not that the service should refuse to start.
        print(f"[openface-service] warm-up failed (non-fatal, first real request will be slower): {err!r}")


def _init_model() -> None:
    """Tries the preferred device, falls back to cpu on failure, and only
    ever reports modelLoaded=True once a device has actually succeeded —
    never claims MPS when the active device is really CPU."""
    preferred = pick_device()
    try:
        detector, model = load_models(preferred)
        state.update(detector=detector, model=model, device=preferred, model_loaded=True, init_error=None)
        print(f"[openface-service] model loaded on device={preferred}")
        return
    except Exception as err:
        print(f"[openface-service] load_models failed on device={preferred}: {err!r}")
        if preferred == "cpu":
            state.update(model_loaded=False, init_error=str(err))
            return

    # preferred was mps and failed — fall back to cpu, reported explicitly.
    try:
        detector, model = load_models("cpu")
        state.update(detector=detector, model=model, device="cpu", model_loaded=True, init_error=None)
        print("[openface-service] mps init failed, fell back to device=cpu")
    except Exception as err:
        print(f"[openface-service] cpu fallback also failed: {err!r}")
        state.update(model_loaded=False, init_error=str(err))


@asynccontextmanager
async def lifespan(app: FastAPI):
    _init_model()
    _warm_up_model()
    yield
    # Nothing to release explicitly — no open files/sockets held beyond the
    # process lifetime; the loaded model is freed on process exit.


app = FastAPI(title="OpenFace 3.0 Service", lifespan=lifespan)

# Configurable allowed origins so the Expo dev port can change without a code
# edit — comma-separated env var, defaulting to the ports this project's own
# dev server has actually used (8081 is Expo's default; 8099 and 19006 have
# both been used in this project's own Playwright testing sessions).
_default_origins = "http://localhost:8081,http://localhost:8099,http://localhost:19006"
allowed_origins = [o.strip() for o in os.environ.get("OPENFACE_ALLOWED_ORIGINS", _default_origins).split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ready" if state["model_loaded"] else "unavailable",
        model="OpenFace 3.0",
        modelLoaded=state["model_loaded"],
        device=state["device"],
        error=state["init_error"],
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


@app.post("/predict", response_model=PredictResponse)
def predict(file: UploadFile = File(...)) -> PredictResponse:
    request_start = time.perf_counter()
    timestamp = datetime.now(timezone.utc).isoformat()

    if not state["model_loaded"]:
        raise HTTPException(status_code=503, detail="Model is not loaded; service is not ready for inference.")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported content type: {file.content_type}")

    contents = file.file.read()  # in-memory only — never written to disk
    if not contents:
        raise HTTPException(status_code=400, detail="Empty upload.")
    if len(contents) > MAX_IMAGE_BYTES:
        raise HTTPException(status_code=413, detail=f"Image exceeds the {MAX_IMAGE_BYTES} byte limit.")

    frame = cv2.imdecode(np.frombuffer(contents, dtype=np.uint8), cv2.IMREAD_COLOR)
    contents = None  # drop the reference as soon as it's decoded — nothing persists it further
    if frame is None:
        raise HTTPException(status_code=400, detail="Could not decode image — corrupted or unsupported format.")

    with model_lock:
        try:
            inference_start = time.perf_counter()
            face = largest_face(state["detector"], frame)
            frame = None  # discard the decoded frame once face extraction is done
            if face is None:
                total_ms = (time.perf_counter() - request_start) * 1000
                return PredictResponse(
                    success=True,
                    faceDetected=False,
                    faceConfidence=None,
                    expressionProbabilities=None,
                    topExpression=None,
                    topProbability=None,
                    device=state["device"],
                    inferenceLatencyMs=None,
                    totalProcessingLatencyMs=round(total_ms, 2),
                    timestamp=timestamp,
                    message="No valid face detected.",
                )
            probs = emotion_scores(state["model"], face, state["device"])
            face = None  # discard the face crop once scored
            inference_ms = (time.perf_counter() - inference_start) * 1000
        except HTTPException:
            raise
        except Exception as err:
            # Full detail stays in the local server log only — never in the
            # response body, per "do not expose full internal stack traces".
            print(f"[openface-service] inference error: {err!r}")
            raise HTTPException(status_code=500, detail="Inference failed.")

    if not np.all(np.isfinite(probs)):
        print(f"[openface-service] non-finite probabilities produced: {probs}")
        raise HTTPException(status_code=500, detail="Inference produced an invalid result.")

    top_index = int(np.argmax(probs))
    total_ms = (time.perf_counter() - request_start) * 1000

    return PredictResponse(
        success=True,
        faceDetected=True,
        faceConfidence=None,
        expressionProbabilities={name.lower(): float(probs[i]) for i, name in enumerate(EMOTIONS)},
        topExpression=EMOTIONS[top_index].lower(),
        topProbability=float(probs[top_index]),
        device=state["device"],
        inferenceLatencyMs=round(inference_ms, 2),
        totalProcessingLatencyMs=round(total_ms, 2),
        timestamp=timestamp,
        message=None,
    )
