"""Call OpenFace 3.0 and print an emotion label.

The public package name is openface-test. It reads a face and returns one of
eight labels: Neutral, Happy, Sad, Surprise, Fear, Disgust, Anger, Contempt.

Install
    pip install torch torchvision timm opencv-python numpy huggingface_hub
    pip install --no-deps openface-test

The second line avoids that package's old NumPy and OpenCV pins. On a fresh
environment, `pip install openface-test` is enough.

Weights are downloaded on first run, into a weights folder next to this file.
ffmpeg is needed only for the live Mac camera.

Run
    python openface3_emotion.py photo.jpg
    python openface3_emotion.py clip.mp4
    python openface3_emotion.py --camera 10
"""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
import threading
import time
from collections import Counter
from pathlib import Path

import cv2
import numpy as np
import torch

ROOT = Path(__file__).resolve().parent
WEIGHTS = ROOT / "weights"
WEIGHT_FILES = (
    "Alignment_RetinaFace.pth",
    "MTL_backbone.pth",
    "mobilenetV1X0.25_pretrain.tar",
)
EMOTIONS = (
    "Neutral",
    "Happy",
    "Sad",
    "Surprise",
    "Fear",
    "Disgust",
    "Anger",
    "Contempt",
)


def ensure_weights() -> None:
    missing = [name for name in WEIGHT_FILES if not (WEIGHTS / name).exists()]
    if not missing:
        return
    try:
        from huggingface_hub import hf_hub_download
    except ImportError as exc:
        raise SystemExit("pip install huggingface_hub") from exc
    WEIGHTS.mkdir(parents=True, exist_ok=True)
    for name in missing:
        print(f"downloading {name}", flush=True)
        hf_hub_download(
            repo_id="nutPace/openface_weights",
            filename=name,
            local_dir=WEIGHTS,
        )


def load_models(device: str):
    """Load the face detector and the emotion model.

    RetinaFace opens ./weights/mobilenetV1X0.25_pretrain.tar from the current
    directory, so this function moves there before constructing the detector.
    """
    ensure_weights()
    os.chdir(ROOT)

    # PyTorch 2.6+ refuses these pickled checkpoints unless weights_only is off.
    original_load = torch.load

    def load_checkpoint(*args, **kwargs):
        kwargs["weights_only"] = False
        return original_load(*args, **kwargs)

    torch.load = load_checkpoint
    from openface.face_detection import FaceDetector
    from openface.model.MTL import MTL

    detector = FaceDetector(
        model_path=str(WEIGHTS / "Alignment_RetinaFace.pth"),
        device=device,
    )
    model = MTL().to(device)
    state = load_checkpoint(WEIGHTS / "MTL_backbone.pth", map_location=device)
    model.load_state_dict(state)
    model.eval()
    torch.load = original_load
    return detector, model


def largest_face(detector, frame: np.ndarray) -> np.ndarray | None:
    """Return the highest-scoring face crop, or None."""
    image = np.float32(frame)
    channels = image.transpose(2, 0, 1)
    channels -= np.array((104, 117, 123), dtype=np.float32)[:, None, None]
    tensor = torch.from_numpy(channels).unsqueeze(0).to(detector.device)
    with torch.no_grad():
        locations, confidence, _landmarks = detector.model(tensor)

    from openface.Pytorch_Retinaface.layers.functions.prior_box import PriorBox
    from openface.Pytorch_Retinaface.utils.box_utils import decode
    from openface.Pytorch_Retinaface.utils.nms.py_cpu_nms import py_cpu_nms

    height, width, _ = frame.shape
    scale = torch.tensor([width, height, width, height], device=detector.device)
    priors = PriorBox(detector.cfg, image_size=(height, width)).forward().to(detector.device)
    boxes = decode(locations.data.squeeze(0), priors.data, detector.cfg["variance"])
    boxes = (boxes * scale).cpu().numpy()
    scores = confidence.squeeze(0).data.cpu().numpy()[:, 1]
    keep = np.where(scores > detector.confidence_threshold)[0]
    boxes, scores = boxes[keep], scores[keep]
    if len(boxes) == 0:
        return None
    detections = np.hstack((boxes, scores[:, None])).astype(np.float32, copy=False)
    detections = detections[py_cpu_nms(detections, detector.nms_threshold)]
    if len(detections) == 0 or detections[0, 4] < detector.vis_threshold:
        return None
    x1, y1, x2, y2 = detections[0, :4].astype(int)
    x1, y1 = max(0, x1), max(0, y1)
    x2, y2 = min(width, x2), min(height, y2)
    if x2 <= x1 or y2 <= y1:
        return None
    return frame[y1:y2, x1:x2]


def emotion_scores(model, face: np.ndarray, device: str) -> np.ndarray:
    """Return eight probabilities, in EMOTIONS order."""
    rgb = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(rgb, (224, 224), interpolation=cv2.INTER_LINEAR)
    tensor = torch.from_numpy(resized).permute(2, 0, 1).float().div(255.0)
    mean = torch.tensor([0.485, 0.456, 0.406]).view(3, 1, 1)
    std = torch.tensor([0.229, 0.224, 0.225]).view(3, 1, 1)
    tensor = ((tensor - mean) / std).unsqueeze(0).to(device)
    with torch.no_grad():
        logits, _gaze, _action_units = model(tensor)
    return torch.softmax(logits, dim=1).squeeze(0).cpu().numpy()


def label(probabilities: np.ndarray) -> tuple[str, float]:
    index = int(probabilities.argmax())
    return EMOTIONS[index], float(probabilities[index])


def print_summary(counts: Counter[str], probability_sum: np.ndarray, checked: int) -> None:
    print(f"faces {checked}")
    if checked == 0:
        raise SystemExit("No face found.")
    print("Emotion")
    for name, count in counts.most_common():
        print(f"  {name}: {count} ({100.0 * count / checked:.0f}%)")
    average = probability_sum / checked
    print("Average probability")
    for index in np.argsort(average)[::-1]:
        print(f"  {EMOTIONS[index]}: {average[index]:.2f}")
    print(f"  sum: {average.sum():.4f}")


def run_image(path: Path, detector, model, device: str) -> None:
    frame = cv2.imread(str(path))
    if frame is None:
        raise SystemExit(f"Could not read {path}")
    face = largest_face(detector, frame)
    if face is None:
        raise SystemExit("No face found.")
    probabilities = emotion_scores(model, face, device)
    name, score = label(probabilities)
    print(f"{name}  {score:.2f}")
    order = np.argsort(probabilities)[::-1]
    for index in order:
        print(f"  {EMOTIONS[index]}: {probabilities[index]:.2f}")


def run_video(path: Path, detector, model, device: str, stride: int) -> None:
    capture = cv2.VideoCapture(str(path))
    if not capture.isOpened():
        raise SystemExit(f"Could not read {path}")
    counts: Counter[str] = Counter()
    probability_sum = np.zeros(len(EMOTIONS))
    frame_index = 0
    while True:
        ok, frame = capture.read()
        if not ok:
            break
        frame_index += 1
        if frame_index % stride != 0:
            continue
        face = largest_face(detector, frame)
        if face is None:
            print(f"frame {frame_index}: no face", flush=True)
            continue
        probabilities = emotion_scores(model, face, device)
        probability_sum += probabilities
        name, score = label(probabilities)
        counts[name] += 1
        print(f"frame {frame_index}: {name}  {score:.2f}", flush=True)
    capture.release()
    print_summary(counts, probability_sum, sum(counts.values()))


def run_camera(seconds: float, detector, model, device: str) -> None:
    """Live Mac camera. ffmpeg must already be allowed to use the camera."""
    if sys.platform != "darwin":
        raise SystemExit("Live camera input in this script is for macOS. Pass an image or a video instead.")
    if shutil.which("ffmpeg") is None:
        raise SystemExit("ffmpeg is not installed.")
    width, height, fps = 1280, 720, 30
    process = subprocess.Popen(
        [
            "ffmpeg",
            "-hide_banner",
            "-loglevel",
            "error",
            "-f",
            "avfoundation",
            "-framerate",
            str(fps),
            "-video_size",
            f"{width}x{height}",
            "-pixel_format",
            "uyvy422",
            "-i",
            "0",
            "-f",
            "rawvideo",
            "-pix_fmt",
            "bgr24",
            "pipe:1",
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    latest = {"frame": None, "seq": 0}
    lock = threading.Lock()
    frame_bytes = width * height * 3

    def reader() -> None:
        assert process.stdout is not None
        while True:
            buffer = process.stdout.read(frame_bytes)
            if len(buffer) < frame_bytes:
                break
            frame = np.frombuffer(buffer, dtype=np.uint8).reshape(height, width, 3).copy()
            with lock:
                latest["frame"] = frame
                latest["seq"] += 1

    threading.Thread(target=reader, daemon=True).start()
    counts: Counter[str] = Counter()
    probability_sum = np.zeros(len(EMOTIONS))
    seen = 0
    started = time.perf_counter()
    try:
        while time.perf_counter() - started < seconds:
            with lock:
                frame = None if latest["frame"] is None else latest["frame"].copy()
                seq = latest["seq"]
            if frame is None or seq == seen:
                time.sleep(0.02)
                continue
            seen = seq
            face = largest_face(detector, frame)
            elapsed = time.perf_counter() - started
            if face is None:
                print(f"{elapsed:5.1f}s  no face", flush=True)
                continue
            probabilities = emotion_scores(model, face, device)
            probability_sum += probabilities
            name, score = label(probabilities)
            counts[name] += 1
            print(f"{elapsed:5.1f}s  {name:<10} {score:.2f}", flush=True)
    finally:
        process.kill()
        process.wait()
    print_summary(counts, probability_sum, sum(counts.values()))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("input", nargs="?", help="Image or video file.")
    parser.add_argument("--camera", type=float, metavar="SECONDS", help="Read the Mac camera for this many seconds.")
    parser.add_argument("--device", default="cpu", choices=("cpu", "cuda"))
    parser.add_argument("--stride", type=int, default=15, help="Check every Nth video frame.")
    args = parser.parse_args()
    if args.camera is None and not args.input:
        parser.error("pass an image, a video, or --camera SECONDS")
    return args


def main() -> None:
    args = parse_args()
    path = None
    if args.input:
        path = Path(args.input).expanduser().resolve()
        if not path.exists():
            raise SystemExit(f"File not found: {path}")
    print("loading OpenFace 3.0", flush=True)
    detector, model = load_models(args.device)
    if args.camera is not None:
        run_camera(args.camera, detector, model, args.device)
        return
    if path.suffix.lower() in {".jpg", ".jpeg", ".png", ".bmp", ".webp"}:
        run_image(path, detector, model, args.device)
    else:
        run_video(path, detector, model, args.device, max(1, args.stride))


if __name__ == "__main__":
    main()
