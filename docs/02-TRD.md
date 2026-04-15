# TRD — GuitarRun v2.5

Updated 2026-04-15.

## Backend (v3 P3.1, separate runtime)

| Layer | Choice |
|---|---|
| Host | **Modal** (pay-per-second, no 10 s cap, GPU-ready) |
| Audio | `yt-dlp` + `ffmpeg` (mp3 cached in Modal Volume `guitarrun-audio`) |
| BPM | `librosa.beat.beat_track` |
| Chord recognition | `librosa.feature.chroma_cqt` + 60 templates (maj/min/7/m7/maj7 × 12 roots) cosine-match (same template set the client uses for live validation) |
| Cache (results) | Modal Dict `guitarrun-extracted` keyed by `videoId` → `ExtractedSong` JSON |
| HTTP | `modal.fastapi_endpoint(method="GET", label="extract")` — `?yt=<videoId>` |
| Spend cap | $200/mo via Modal Billing → Spend cap |
| Legal | cached-derivative-only (audio is purgeable analysis cache; only metadata is served) |

Lyrics + advanced chord recognition (Chordino, Whisper) are stages 3.3–3.5 per `docs/09-V3-PHASE-3-EXTRACTION.md`.

## Tech Stack (unchanged since MVP)

| Layer | Choice |
|---|---|
| Framework | Vite + React 19 + TypeScript |
| Routing | `react-router-dom` v7 — `/`, `/play/:songId`, `/tuner`, `/chords`, `/trainer` |
| Styling | Tailwind + CSS variables |
| State | React state + URL params; no Redux/Zustand |
| YouTube | IFrame Player API |
| Pitch detection | Pitchy (McLeod) |
| Chord diagrams | Hand-rolled SVG (`ChordDiagram.tsx`) + new `<Fretboard />` |
| Chord data | Static JSON from `@tombatossals/chords-db` (≥80 shapes) |
| Tests | Vitest |
| Analytics | Plausible |
| Error tracking | Sentry free tier |
| Hosting | Vercel |

**No new runtime dependencies in v2.x.**

## Routes

```
/                  HomePage         filter bar + URL input + song grid
/play/:songId      PlayPage         video + Fretboard hero + ChordStrip + CurrentChord + ChordValidator
/play              PlayPage         explore mode — accepts ?yt=<videoId>, optional ?mode=, ?t=
/tuner             TunerPage        mic + needle
/chords            ChordsPage       search + diagrams
/trainer           TrainerPage      drill — pool, BPM, duration, score
```

## Module map

```
src/
├── lib/
│   ├── chords.ts          ChordPosition, findChord, searchChords
│   ├── chroma.ts          v3 P2 — chromaFromSpectrum, matchChord, isMatch (60 chord templates)
│   ├── difficulty.ts      v3 P4 — DifficultyMode, simplifyChord, simplifyTimeline, simplifyChordSet, summarizeSubstitutions
│   ├── extract.ts         v3 P3 — useExtractedSong, ExtractResult; calls VITE_EXTRACT_API_URL or falls back to curated stub
│   ├── fretboard.ts       toFretboardShape, computeFretWindow, renderCoords, describeShapeForA11y
│   ├── pitch.ts           hzToNote, centsOff, nearestString
│   ├── songs.ts           Song, ChordHit, filterSongs, allChords
│   ├── timeline.ts        activeChordAt — binary search
│   └── youtube.ts         v3 P1 — parseYouTubeUrl, parseTimestamp, isYouTubeUrlOrId
├── hooks/
│   ├── useMicChroma.ts        v3 P2 — Web Audio + chromagram + smoothing
│   ├── useMicPitch.ts
│   └── useYouTubePlayer.ts
├── components/
│   ├── ChordDiagram.tsx       single-chord SVG (svguitar)
│   ├── ChordStrip.tsx         timeline ribbon
│   ├── ChordValidator.tsx     v3 P2 — opt-in mic-listener panel
│   ├── Fretboard.tsx          v2.1 hero — dual orientation, ghost cross-fade
│   ├── SongCard.tsx
│   ├── SongFilterBar.tsx      v2.2 filter UI
│   ├── SongUrlInput.tsx       v3 P1 — paste YouTube URL on Home
│   ├── TapTempo.tsx           v2.4 widget
│   ├── TunerMeter.tsx
│   └── ErrorBoundary.tsx
└── routes/                    one file per route
```

## Data Model

```ts
type Song = {
  id: string
  title: string
  artist: string
  youtubeId: string
  difficulty: 'beginner' | 'intermediate'
  chordsUsed: string[]
  bpm: number
  timeline: ChordHit[]
  decade?: string                // v2.2
  tags?: string[]                // v2.2
}
type ChordHit = { t: number; chord: string; lyric?: string }
type ChordPosition = { frets: number[]; fingers: number[]; barres?: number[]; baseFret: number }
type ChordShape = { name: string; notes: string[]; positions: ChordPosition[] }
```

`frets[]` carries **absolute** fret numbers (not relative to `baseFret`). `barres[]` is per-fret integer array; `toFretboardShape` expands each into `{fromString, toString, fret}` segments by scanning fretted strings.

### Storage
- React state for player, pitch, search, filter, drill.
- `localStorage`: `gr:tuner:mode` only.
- No IndexedDB, no cookies, no dates.

## Performance Budget

| Metric | Target | Current |
|---|---|---|
| Initial JS (gzipped) | ≤ 155 KB | **100.65 KB** (v2.1 build) |
| LCP (4G throttled) | ≤ 2.0 s | tracked via Vercel Lighthouse |
| TBT | < 200 ms | — |
| CLS on `/play/:songId` | < 0.1 | — |
| Fretboard cross-fade | ≤ 4 ms/frame @ 60 fps | — |

If a future feature breaks budget, cut the ghost-chord animation first.

## Testing

- **Vitest unit:** `lib/fretboard.ts` 16 cases (≥80 % coverage on this module).
- **Manual:** PlayPage horizontal+vertical render, zero console errors, axe-core no new violations.
- **Deferred:** Playwright visual regression, Lighthouse CI.

## Residual risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| YouTube embed disabled for a curated song | Med | Contribution guide enforces incognito embed test. |
| `chords-db` shape with all-zero fingers | Med | `<Fretboard />` falls back to dots-only. |
| Fret window too wide for a high-position chord | Low | `computeFretWindow` clamps `maxFret ≤ 12`. |
| Trainer `setInterval` drift on long endless drills | Low | RAF would help; defer until reported. |
| Tap-tempo accidental long-pause re-zero | Low | 2 s reset window is documented in widget. |

## Deployment

Single-page Vite build → Vercel. Roll back = redeploy previous commit. No DB, no auth, no migrations.
