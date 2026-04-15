# TRD — GuitarRun v2.1

## Tech Stack (unchanged from MVP)

| Layer | Choice | Why |
|---|---|---|
| Framework | Vite + React 18 + TypeScript | Fastest dev loop for solo; no SSR. |
| Routing | `react-router-dom` v6 | `/`, `/play/:songId`, `/tuner`, `/chords`. |
| Styling | Tailwind + CSS variables | Ship custom-feeling UI, no component-lib footprint. |
| State | React state + URL params | Three isolated surfaces — no cross-cutting state. |
| YouTube | IFrame Player API | Legal, free, ToS-safe. |
| Pitch detection | Pitchy (McLeod) | ~1 KB, accurate monophonic. |
| Chord diagrams | Hand-rolled SVG (`ChordDiagram.tsx`) | Shared geometry with new `Fretboard.tsx`. |
| Chord data | Static JSON from `@tombatossals/chords-db` | ≥80 shapes, offline. |
| Analytics | Plausible | No cookies. |
| Error tracking | Sentry free tier | 5K events/mo. |
| Hosting | Vercel | Git-push deploys. |

**No new runtime dependencies for v2.1.** Fretboard is pure SVG driven by the existing `ChordPosition` type.

## v2.1 Architecture Delta

```
/play/:songId
  ├── <Fretboard />         ◀── NEW hero visual
  │     ├── consumes useActiveChord(timeline, t)
  │     └── uses lib/fretboard.ts → toFretboardShape(ChordPosition)
  ├── <ChordStrip />        ◀── kept, demoted to slim timeline ribbon
  └── <CurrentChordPanel /> ◀── kept, secondary (name + notes)
```

Single source of truth: `useActiveChord(timeline, currentTime)` wraps the existing `lib/timeline.ts` binary search and returns `{ current, next, nextStartsAt }`. Both `<Fretboard />` and `<ChordStrip />` consume it — no drift possible.

## New / Changed Modules

### `src/lib/fretboard.ts` (new, pure, no DOM)
```ts
interface FretboardShape {
  frets: ReadonlyArray<number>      // 6 entries low-E→high-E; -1 muted, 0 open, ≥1 fret
  fingers: ReadonlyArray<number>    // 6 entries; 0 = open
  barres: ReadonlyArray<{ fromString: number; toString: number; fret: number }>
  baseFret: number
}

interface FretWindow { minFret: number; maxFret: number }

export function toFretboardShape(position: ChordPosition): FretboardShape
export function computeFretWindow(shapes: ReadonlyArray<FretboardShape>): FretWindow
export function renderCoords(
  shape: FretboardShape,
  window: FretWindow,
  orientation: 'horizontal' | 'vertical',
  size: { width: number; height: number },
): {
  dots:    ReadonlyArray<{ x: number; y: number; finger: number; stringIndex: number }>
  barres:  ReadonlyArray<{ x: number; y: number; width: number; height: number }>
  markers: ReadonlyArray<{ x: number; y: number; kind: 'muted' | 'open'; stringIndex: number }>
}
```

### `src/components/Fretboard.tsx` (new)
```ts
interface FretboardProps {
  current: FretboardShape | null
  next: FretboardShape | null
  nextStartsAt: number | null
  currentTime: number
  window: FretWindow
  orientation: 'horizontal' | 'vertical'
  ariaLabel: string
}
```
- Pure SVG (`<svg viewBox>`); container-sized via `ResizeObserver` + RAF debounce.
- Animates only `opacity` + `transform` on `<g>` layers (compositor-friendly per `web/performance.md`).
- `prefers-reduced-motion: reduce` → `transition: none`, instant swap.
- `role="img"` + `aria-label` built from `describeShapeForA11y`.

### `src/hooks/useActiveChord.ts` (new)
Thin wrapper over `lib/timeline.ts` that also returns the *next* hit and its start time. Replaces any ad-hoc lookup inside `ChordStrip` / play page.

### `src/lib/chords.ts` (extended)
- Re-export `toFretboardShape`.
- Add `describeShapeForA11y(shape: FretboardShape, chordName: string): string`.

### Existing files touched
- `src/components/ChordStrip.tsx` — consume `useActiveChord`; shrink to a ~48 px timeline ribbon.
- Play page — compose `<Fretboard />` + `<ChordStrip />` + `<CurrentChordPanel />`.
- No changes to `useYouTubePlayer.ts`, `useMicPitch.ts`, `lib/pitch.ts`, `data/*.json`.

## Data Model (unchanged)

No schema change. `ChordShape.positions[0]` is canonical for v2.1. `ChordHit.t` (seconds, float) and optional `lyric: string` continue to be the only timeline fields. Multi-voicing is v2.2.

## Performance Budget

| Metric | MVP baseline | v2.1 target |
|---|---|---|
| Initial JS (gzipped) | ≤ 150 KB | ≤ 155 KB (+5 KB headroom) |
| LCP (4G throttled) | ≤ 2.0 s | ≤ 2.0 s |
| TBT | < 200 ms | < 200 ms |
| Fretboard cross-fade frame cost | — | ≤ 4 ms/frame @ 60 fps |
| CLS on `/play/:songId` | < 0.1 | < 0.1 (reserve fretboard height at mount) |

Verification: Lighthouse on preview URL before prod merge. If any budget is breached, cut the ghost-chord animation first.

## New Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Long barre renders off fretboard when `baseFret > 1` | Med | `renderCoords` clamps to window; unit tests cover baseFret 5, 7, 9. |
| `chords-db` shape has bad fingerings (fingers array all zero) | Med | Validate at load time; fall back to "dots only, no finger numbers". |
| Cross-fade janky on low-end Android | Low | Frame-cost check in Chrome DevTools "Low-end mobile" throttle; cut path above. |
| SVG reflow on window resize drops frames mid-song | Low | `ResizeObserver` + RAF debounce; snapshot geometry in refs, not state. |
| Orientation switch at 640 px breakpoint disorients mid-session | Low | Read breakpoint once at page load; do not live-switch on resize. |
| Fret auto-fit picks too-wide a window | Low | Clamp `maxFret` to 12; shapes beyond that get a position marker + `baseFret` shift. |

## Testing Strategy (per `web/testing.md`)

- **Unit:** `lib/fretboard.ts` — `toFretboardShape`, `computeFretWindow`, `renderCoords` across open, barre (F), high-position (Bb at fret 6). ≥ 80 % coverage for this module.
- **Unit:** `useActiveChord` with a synthetic timeline; covers seek, pause, end-of-song.
- **Visual regression:** Playwright screenshots at 375 / 768 / 1280 px on a sample song paused at a known timestamp; snapshot active + ghost state.
- **A11y:** axe-core on `/play/:songId`; verify `aria-label` updates across a timeline tick; confirm reduced-motion path.
- **Manual:** real guitar + real phone — play one full song, confirm finger placement matches glowing dots.

## Deployment

Unchanged from MVP (`docs/07-DEPLOY.md`). Single Vercel prod deploy after preview QA. Roll back = redeploy previous commit from Vercel dashboard.
