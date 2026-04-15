# GuitarRun Backend — Modal Auto-Extraction Service

## What it does

Takes a YouTube `videoId`, downloads audio with `yt-dlp`, analyzes BPM and chord progression with `librosa`, caches both the audio and the result.

Today: **BPM + chord timeline + chord set**. Lyrics + advanced chord recognition land in stages 3.4 / 3.5 (see `docs/09-V3-PHASE-3-EXTRACTION.md`).

## One-time setup

```bash
pip install modal
modal token new                 # opens browser to authenticate
```

Modal Volumes/Dicts referenced by name are created automatically on first deploy (`create_if_missing=True` in `modal_app.py`).

## Deploy

```bash
modal deploy backend/modal_app.py
```

You'll get URLs like:
- `https://<workspace>--guitarrun-extract-extract.modal.run`
- `https://<workspace>--guitarrun-extract-healthz.modal.run`

Use the first one as your `VITE_EXTRACT_API_URL`.

## Wire to the frontend

Vercel dashboard → Project → Environment Variables:

```
VITE_EXTRACT_API_URL=https://<workspace>--guitarrun-extract-extract.modal.run
```

Local dev:

```bash
echo "VITE_EXTRACT_API_URL=https://<workspace>--guitarrun-extract-extract.modal.run" >> .env.local
```

`src/lib/extract.ts` calls `${VITE_EXTRACT_API_URL}?yt=<videoId>`. If the env var is unset, the client falls back to the curated-only stub.

## Cost ceiling ($200/mo)

Modal workspace → **Settings → Billing → Spend cap**. Set hard cap at $200. Modal kills new function runs once the cap hits, so a runaway can't blow the budget.

Per-extraction cost (cold): ~$0.05 (≈40 s of CPU + small egress). Cache hits ≈ $0 (Dict reads are free; container stays warm via `min_containers=1` on the endpoint, ≈$5/mo idle).

At $200/mo cap and 30 % cache-hit rate, you cover ~4,000 first-run extractions monthly — matches your sizing.

## Legal sign-off

We follow the **cached-derivative-only** pattern: the Volume holds source mp3 strictly as an analysis cache (purgeable; never served back). The Dict holds derived metadata (chords, BPM). This matches the model Chordify and similar music-analysis services use.

Get one-page legal sign-off explicitly covering this pattern before public launch.

## Endpoints

| Method | Path | Returns |
|---|---|---|
| GET | `/?yt=<videoId>` | `{status: 'ready', song}` (cached) or `{status: 'extracting', etaSeconds}` (job spawned) |
| GET | `/?yt=<bad>` | `{status: 'error', error: 'invalid videoId'}` |
| GET | `/healthz` | `{ok: true, ts, model}` |

Frontend polls every 5 s while `status === 'extracting'`. Default ETA 90 s; long videos may take 2–3 min on first run.

## Local smoke test

```bash
modal run backend/modal_app.py::extract_song --video-id bx1Bh8ZvH84
```

Should print `{status: 'ready', song: {...}}` for Wonderwall (or any embeddable video). First call ≈90 s; second is instant from the Dict.

## Operational notes

- **Cache TTL:** infinite for now. Add a TTL field to the Dict if model upgrades require re-analysis.
- **Cold start:** `min_containers=1` on the GET endpoint keeps the container warm for sub-second polling.
- **Concurrency:** `extract_song` runs separately per call; multiple users hitting the same uncached video will queue distinct jobs. Add a per-`videoId` lock if it bites.
- **Audio cache cleanup:** Volume can grow. Schedule a Modal cron to purge mp3s older than 30 d when storage exceeds budget.
- **Model upgrade path:** see `docs/09-V3-PHASE-3-EXTRACTION.md` for stages 3.3 (Chordino), 3.4 (Whisper), 3.5 (quality loop).
