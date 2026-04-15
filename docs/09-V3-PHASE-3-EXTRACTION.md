# v3 Phase 3 — Auto-Extraction Pipeline (architecture)

## What this delivers
Take an arbitrary YouTube URL and produce, with no human in the loop:
- **Chord progression** (timeline of `ChordHit` entries)
- **Lyrics** (synced lines per `t`)
- **BPM** (single integer, used by Trainer + chord strip)
- **Difficulty modes** (Beginner / Intermediate / Advanced / Original — Phase 4 will derive Beginner/Intermediate from Original via chord-substitution table)

## Why this is its own phase
The browser cannot do this end-to-end at acceptable quality and bundle size:

| Step | Browser-only viable? | Why |
|---|---|---|
| YouTube audio extraction | No | YouTube ToS + CORS + need raw audio, not iframe playback |
| Source separation (vocals vs. instruments) | Demucs WASM exists but ~50 MB model | Bundle budget breach |
| Chord recognition (CRNN / Chordino) | Possible via TF.js, ~5–15 MB | Borderline |
| Lyrics ASR (Whisper) | whisper.cpp WASM ~75 MB+ | Bundle budget breach |
| BPM (autocorrelation / Madmom) | Pure-JS feasible | OK |

→ **Production answer: backend service with cached results.**

## Architecture (target)

```
client                                 backend (Vercel functions / Python svc)
──────                                 ────────────────────────────────────
SongUrlInput → /play?yt=<id>           POST /api/extract { videoId }
   │                                       │
   │                                       ├── 1. yt-dlp: fetch audio (cached in S3 / R2)
useExtractedSong(videoId)                  ├── 2. Demucs / Spleeter: vocals + instr stems
   ├── poll status                         ├── 3. Chordino / crema-py: chord timeline
   │                                       ├── 4. Whisper: synced lyrics
   │                                       ├── 5. madmom / librosa.beat: BPM
   │                                       ├── 6. Persist {videoId → Song} in KV / Postgres
   ▼                                       │
PlayPage receives extracted Song           ▼
  → renders Fretboard + Strip          GET /api/extract?yt=<id> returns cached or {status:'pending'}
```

## Cache-first, model-rare

- Hot path: **GET /api/extract?yt=<id>** returns the cached `Song` blob (synchronous, <50 ms from KV).
- Cold path: **POST /api/extract** enqueues the job, returns `{ status: 'pending', etaSeconds: 60 }`.
- Client polls every 5 s, shows "extracting…" state with a progress phrase.
- Curated `songs.json` is treated as an additional cache layer (zero-cost; no model run).

## Storage shape

```ts
type ExtractedSong = Song & {
  source: 'curated' | 'extracted'
  extractedAt: string  // ISO 8601, e.g. "2026-04-15T05:32:11Z"
  modelVersion: string // 'chordino-1.0+whisper-large-v3+madmom-0.16'
  confidence: number   // 0..1, aggregate
}
```

The `source: 'curated'` branch returns existing entries from `src/data/songs.json` unchanged.

## Phasing the build

| Stage | Effort | Output |
|---|---|---|
| **3.0** Stub | done in this session | Client `useExtractedSong` returns `{ status: 'unsupported' }` for any non-curated id; explore mode shows the "queued" placeholder. |
| **3.1** Backend skeleton | 1 d | Vercel `/api/extract.ts` returning curated entries + `pending` for the rest; client polling loop. |
| **3.2** BPM-only | 2 d | Add yt-dlp + librosa BPM to the backend. Easy win — manual BPM goes away. |
| **3.3** Chord pipeline | 1 wk | Chordino / crema integration. Cache aggressively. |
| **3.4** Lyrics | 3 d | Whisper API (OpenAI / Replicate) for synced lyrics. |
| **3.5** Quality loop | ongoing | Confidence scores feed a "report a wrong chord" UI; community flagging. |

## Decisions deferred to user

1. **Hosting model.** Vercel functions (limit ~10 s) won't run yt-dlp + Demucs in time; need a long-running worker (Render, Fly.io, Modal, Replicate). Pick before stage 3.2.
2. **API budget.** Whisper Large via API ≈ $0.006/min. Modal/Replicate Demucs ≈ $0.01/min. Estimate ~$0.05 per song extraction.
3. **Legal.** yt-dlp + cached audio is the safe pattern (we don't redistribute audio, only derived metadata). Confirm with whoever owns the legal seat.

## What ships in this session (3.0)

- `lib/extract.ts` (client) — types, `useExtractedSong(videoId)` hook, status enum.
- Explore mode in `PlayPage` shows extraction state instead of just "queued" copy.
- Backend remains unimplemented; the hook returns `{ status: 'unsupported' }` for now. When `/api/extract` lands the hook starts returning real data.
