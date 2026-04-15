"""GuitarRun v3 P3.1 — Modal backend for auto-extraction.

Pipeline (current stage):
  1. yt-dlp           → mp3 cached in a Modal Volume
  2. librosa.beat     → BPM
  3. librosa.feature.chroma_cqt + template match → chord timeline
  4. (deferred) Whisper → synced lyrics (stage 3.4)

Cache layers:
  - Modal Volume   `guitarrun-audio`     keyed by `<videoId>.mp3`
  - Modal Dict     `guitarrun-extracted` keyed by `<videoId>` → ExtractedSong JSON

Endpoints (FastAPI via Modal):
  GET  /extract?yt=<videoId>   → cached song or {status:'extracting'} + spawn job
  GET  /healthz                → liveness probe

Deploy:
  pip install modal
  modal token new
  modal deploy backend/modal_app.py
  # → returns https://<workspace>--guitarrun-extract-extract.modal.run
  # set VITE_EXTRACT_API_URL=<host of that URL> in Vercel env

Cost ceiling: enforce $200/mo via Modal billing (workspace → Billing → Spend cap).
"""

from __future__ import annotations

import os
import time
from datetime import datetime, timezone
from pathlib import Path

import modal

MODEL_VERSION = "librosa-0.10+template-match-v1"
ROOTS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
QUALITY_TEMPLATES = {
    "":     [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    "m":    [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    "7":    [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
    "m7":   [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
    "maj7": [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
}

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("ffmpeg")
    .pip_install(
        "yt-dlp==2024.12.13",
        "librosa==0.10.2",
        "numpy<2.0",
        "fastapi[standard]==0.115.6",
    )
)

app = modal.App("guitarrun-extract", image=image)
audio_volume = modal.Volume.from_name("guitarrun-audio", create_if_missing=True)
extracted_dict = modal.Dict.from_name("guitarrun-extracted", create_if_missing=True)

VOLUME_MOUNT = "/audio"


def _build_templates():
    import numpy as np
    rows = []
    names = []
    for quality, base in QUALITY_TEMPLATES.items():
        for r in range(12):
            vec = [base[(i - r + 12) % 12] for i in range(12)]
            rows.append(vec)
            names.append(ROOTS[r] + quality)
    arr = np.asarray(rows, dtype="float32")
    arr /= np.linalg.norm(arr, axis=1, keepdims=True)
    return names, arr


def _isoformat_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _is_valid_video_id(video_id: str) -> bool:
    return bool(video_id) and len(video_id) == 11 and all(
        c.isalnum() or c in "-_" for c in video_id
    )


def _download_audio(video_id: str) -> str:
    import yt_dlp
    out_path = Path(VOLUME_MOUNT) / f"{video_id}.mp3"
    if out_path.exists():
        return str(out_path)
    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": str(Path(VOLUME_MOUNT) / f"{video_id}.%(ext)s"),
        "postprocessors": [
            {"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "192"},
        ],
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
    }
    url = f"https://www.youtube.com/watch?v={video_id}"
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    if not out_path.exists():
        candidates = list(Path(VOLUME_MOUNT).glob(f"{video_id}.*"))
        if candidates:
            return str(candidates[0])
        raise RuntimeError("yt-dlp produced no output")
    return str(out_path)


def _analyze_audio(path: str) -> dict:
    import librosa
    import numpy as np

    y, sr = librosa.load(path, sr=22050, mono=True)
    duration = float(librosa.get_duration(y=y, sr=sr))

    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    bpm = int(round(float(np.atleast_1d(tempo)[0])))
    bpm = max(40, min(220, bpm))

    hop_length = 4096
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop_length)
    template_names, templates = _build_templates()

    chroma_n = chroma / (np.linalg.norm(chroma, axis=0, keepdims=True) + 1e-9)
    sims = templates @ chroma_n
    best_idx = sims.argmax(axis=0)
    best_sim = sims.max(axis=0)
    sorted_sims = np.sort(sims, axis=0)
    margin = sorted_sims[-1] - sorted_sims[-2]

    times = librosa.frames_to_time(
        np.arange(chroma.shape[1]), sr=sr, hop_length=hop_length
    )
    timeline = []
    chords_used: list[str] = []
    last_label = None
    confidences: list[float] = []
    for i, t in enumerate(times):
        if best_sim[i] < 0.55 or margin[i] < 0.03:
            continue
        label = template_names[int(best_idx[i])]
        if label != last_label:
            timeline.append({"t": float(round(t, 2)), "chord": label})
            if label not in chords_used:
                chords_used.append(label)
            last_label = label
            confidences.append(float(best_sim[i]))

    if not timeline:
        timeline = [{"t": 0.0, "chord": "C"}]
        chords_used = ["C"]
        confidences = [0.0]

    confidence = float(np.mean(confidences)) if confidences else 0.0
    return {
        "duration": duration,
        "bpm": bpm,
        "timeline": timeline,
        "chordsUsed": chords_used,
        "confidence": confidence,
    }


@app.function(
    timeout=600,
    volumes={VOLUME_MOUNT: audio_volume},
    cpu=2.0,
    memory=4096,
)
def extract_song(video_id: str) -> dict:
    if not _is_valid_video_id(video_id):
        return {"status": "error", "error": "invalid videoId"}

    cached = extracted_dict.get(video_id)
    if cached:
        return {"status": "ready", "song": cached}

    try:
        audio_path = _download_audio(video_id)
        analysis = _analyze_audio(audio_path)
        song = {
            "id": f"yt-{video_id}",
            "title": "Untitled",
            "artist": "Unknown",
            "youtubeId": video_id,
            "difficulty": "intermediate",
            "chordsUsed": analysis["chordsUsed"],
            "bpm": analysis["bpm"],
            "timeline": analysis["timeline"],
            "source": "extracted",
            "extractedAt": _isoformat_now(),
            "modelVersion": MODEL_VERSION,
            "confidence": analysis["confidence"],
        }
        extracted_dict[video_id] = song
        audio_volume.commit()
        return {"status": "ready", "song": song}
    except Exception as e:
        return {"status": "error", "error": str(e)[:300]}


def _allow_origins() -> str:
    raw = os.environ.get("ALLOWED_ORIGINS", "*")
    parts = [o.strip() for o in raw.split(",") if o.strip()]
    return ",".join(parts) if parts else "*"


@app.function(timeout=30, volumes={VOLUME_MOUNT: audio_volume}, min_containers=1)
@modal.fastapi_endpoint(method="GET", label="extract")
def extract_endpoint(yt: str):
    from fastapi.responses import JSONResponse

    headers = {"Access-Control-Allow-Origin": _allow_origins()}
    if not _is_valid_video_id(yt):
        return JSONResponse(
            status_code=400,
            content={"status": "error", "error": "invalid videoId"},
            headers=headers,
        )

    cached = extracted_dict.get(yt)
    if cached:
        return JSONResponse(
            content={"status": "ready", "song": cached}, headers=headers
        )

    extract_song.spawn(yt)
    return JSONResponse(
        content={"status": "extracting", "etaSeconds": 90}, headers=headers
    )


@app.function(timeout=10)
@modal.fastapi_endpoint(method="GET", label="healthz")
def healthz():
    return {"ok": True, "ts": int(time.time()), "model": MODEL_VERSION}
