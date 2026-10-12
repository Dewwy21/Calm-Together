# OpenFace 3.0 Local Service

A local FastAPI service wrapping the Stage 2 OpenFace 3.0 implementation (`openface3_emotion.py`, unmodified). Loads the model once at startup and serves facial-expression inference over REST. Local-only (`127.0.0.1`) — not exposed to the network.

This service does not connect to the Calm Together Expo app yet (Stage 4). It is independently testable via curl or any local HTTP client.

## 1. Activate the virtual environment

```bash
cd "/Users/EliTan/Code extensions/openface-service"
source venv/bin/activate
```

(Or skip activation and call `./venv/bin/python` / `./venv/bin/uvicorn` directly, as the commands below do.)

## 2. Start the service

```bash
cd "/Users/EliTan/Code extensions/openface-service"
./venv/bin/python -m uvicorn server:app --host 127.0.0.1 --port 8000
```

Bound to `127.0.0.1` only, per the local-only networking requirement — not reachable from other devices on the network. Model loads once here; the first request after startup will be slower (MPS warm-up), subsequent requests are fast (see Performance below).

## 3. Check `/health`

```bash
curl -s http://127.0.0.1:8000/health
```

```json
{"status":"ready","model":"OpenFace 3.0","modelLoaded":true,"device":"mps","error":null,"timestamp":"2026-10-08T03:23:05.650852+00:00"}
```

If model initialization failed entirely, `status` will be `"unavailable"`, `modelLoaded: false`, and `error` will contain the failure reason — `/predict` will return `503` in that state rather than silently pretending to be healthy.

## 4. Submit a test image to `/predict`

```bash
curl -s -X POST http://127.0.0.1:8000/predict \
  -F "file=@/path/to/your/photo.jpg;type=image/jpeg"
```

Accepts `multipart/form-data` with a `file` field. Supported types: JPEG, PNG, WebP, BMP. Max size: 10MB (returns `413` above that, before attempting to decode).

## 5. Example response

**Face detected:**
```json
{
  "success": true,
  "faceDetected": true,
  "faceConfidence": null,
  "expressionProbabilities": {
    "neutral": 0.0829,
    "happy": 0.0047,
    "sad": 0.4734,
    "surprise": 0.0313,
    "fear": 0.0593,
    "disgust": 0.1676,
    "anger": 0.1042,
    "contempt": 0.0765
  },
  "topExpression": "sad",
  "topProbability": 0.4734,
  "device": "mps",
  "inferenceLatencyMs": 22.45,
  "totalProcessingLatencyMs": 24.66,
  "timestamp": "2026-10-08T03:24:46.123456+00:00",
  "message": null
}
```

**No face detected** (a valid outcome, not an error — HTTP 200):
```json
{
  "success": true,
  "faceDetected": false,
  "faceConfidence": null,
  "expressionProbabilities": null,
  "topExpression": null,
  "topProbability": null,
  "device": "mps",
  "inferenceLatencyMs": null,
  "totalProcessingLatencyMs": 27.45,
  "timestamp": "2026-10-08T03:24:39.328895+00:00",
  "message": "No valid face detected."
}
```

**Why `faceConfidence` is always `null`**: the underlying `largest_face()` function in `openface3_emotion.py` computes a detection score internally but discards it before returning — it returns only the cropped face region. Exposing confidence would mean either modifying that Stage-2-verified function or duplicating its detection logic elsewhere, both avoided per the Stage 3 brief ("do not invent... return null and explain why"). If this is ever needed, the smallest fix is a one-line change to `largest_face()`'s return value — not implemented here since it isn't required for Phase 1.

## 6. Stop the service

`Ctrl+C` in the terminal running uvicorn, or:
```bash
pkill -f "uvicorn server:app"
```

## Error responses

| Condition | Status | Body |
|---|---|---|
| Model not loaded | 503 | `{"detail": "Model is not loaded; service is not ready for inference."}` |
| Unsupported content type | 415 | `{"detail": "Unsupported content type: ..."}` |
| Missing `file` field | 422 | FastAPI's standard validation error |
| Empty upload | 400 | `{"detail": "Empty upload."}` |
| Image over 10MB | 413 | `{"detail": "Image exceeds the 10485760 byte limit."}` |
| Corrupted/undecodable image | 400 | `{"detail": "Could not decode image — corrupted or unsupported format."}` |
| Inference error | 500 | `{"detail": "Inference failed."}` (full detail logged server-side only) |

## CORS

Allowed origins are configurable via `OPENFACE_ALLOWED_ORIGINS` (comma-separated), defaulting to `http://localhost:8081,http://localhost:8099,http://localhost:19006`. Example:

```bash
OPENFACE_ALLOWED_ORIGINS="http://localhost:8081" ./venv/bin/python -m uvicorn server:app --host 127.0.0.1 --port 8000
```

## Concurrency

`/predict` is a synchronous route handler (not `async def`), so FastAPI/Starlette automatically runs it in a thread pool rather than blocking the server's event loop — `/health` stays responsive even mid-inference. A `threading.Lock` serializes the actual model-touching section across threads, preventing concurrent requests from corrupting shared model state. For this local, single-user, low-concurrency Phase 1 service (sequential camera frames, not many simultaneous callers), this simple serialization is the right tradeoff — correctness and stability over maximum throughput, as the Stage 3 brief asks for. A real request queue would be over-engineering at this stage.

## Privacy

Uploaded images are processed entirely in memory (`UploadFile` → `cv2.imdecode`) and never written to disk. No persistent database. No logging of image bytes — only counts, latencies, and device info are logged. Verified by inspection: `server.py` contains no `cv2.imwrite`, no `open(..., "w")`/`"wb"` on image data, and no copy of the upload anywhere.

## Changes to the original OpenFace script

None. `openface3_emotion.py` is unmodified by Stage 3 (it did get one unrelated 2-line fix during Stage 2 testing — `print_summary()` now prints all 8 average probabilities instead of the top 4 — that predates and is unrelated to this service).
