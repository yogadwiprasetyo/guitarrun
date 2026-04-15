# TRD — GuitarRun v2.5

Updated 2026-04-15.

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
/                  HomePage         filter bar + song grid
/play/:songId      PlayPage         video + Fretboard hero + ChordStrip + CurrentChord
/tuner             TunerPage        mic + needle
/chords            ChordsPage       search + diagrams
/trainer           TrainerPage      drill — pool, BPM, duration, score
```

## Module map

```
src/
├── lib/
│   ├── chords.ts          ChordPosition, findChord, searchChords
│   ├── fretboard.ts       toFretboardShape, computeFretWindow, renderCoords, describeShapeForA11y
│   ├── pitch.ts           hzToNote, centsOff, nearestString
│   ├── songs.ts           Song, ChordHit, filterSongs, allChords
│   └── timeline.ts        activeChordAt — binary search; returns {index, hit, nextHit, startsAt, endsAt}
├── hooks/
│   ├── useMicPitch.ts
│   └── useYouTubePlayer.ts
├── components/
│   ├── ChordDiagram.tsx       single-chord SVG (svguitar)
│   ├── ChordStrip.tsx         timeline ribbon
│   ├── Fretboard.tsx          v2.1 hero — dual orientation, ghost cross-fade
│   ├── SongCard.tsx
│   ├── SongFilterBar.tsx      v2.2 filter UI
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
