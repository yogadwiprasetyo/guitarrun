# Next Steps — v2.1 Neck-Visualization Play-Along

Scope: 2 working days (~16 h). Goal: ship Roadmap #1 to prod behind a preview URL for review, then merge. If any slot overruns by >45 min, cut scope per tripwires at the bottom.

## Day 1 — Static fretboard + pure geometry

| Slot | Time | Task | Deliverable |
|---|---|---|---|
| **D1.H0** | 09:00–09:30 | Branch `feat/neck-viz`; write failing unit tests for `lib/fretboard.ts` (RED) | 3 failing test files |
| **D1.H1** | 09:30–11:00 | Implement `toFretboardShape`, `computeFretWindow`, `renderCoords` (GREEN) | ≥80 % coverage on `fretboard.ts` |
| **D1.H2** | 11:00–12:30 | Build `<Fretboard />` SVG — horizontal orientation only | Renders any `ChordPosition` standalone |
| *lunch* | 12:30–13:00 | — | — |
| **D1.H3** | 13:00–14:00 | Add vertical orientation + `useElementSize` + `ResizeObserver` | Both orientations correct in a test page |
| **D1.H4** | 14:00–15:30 | Reuse `<Fretboard />` inside `/chords` finder (parity check) | Chord Finder still passes QA |
| **D1.H5** | 15:30–16:30 | `describeShapeForA11y` + axe-core smoke; `useActiveChord` hook + unit tests | Both surfaces have valid a11y labels |
| **D1.H6** | 16:30–17:30 | Visual-regression baselines (Playwright) for Chord Finder + standalone fretboard | Committed snapshots |

**End of Day 1:** `<Fretboard />` renders any chord anywhere. Not yet wired to the song player.

## Day 2 — Sync to player + polish + ship

| Slot | Time | Task | Deliverable |
|---|---|---|---|
| **D2.H0** | 09:00–10:00 | Wire `<Fretboard />` into play page: consume `useActiveChord`; precompute song `FretWindow` | Active chord updates as video plays |
| **D2.H1** | 10:00–11:00 | Cross-fade: current opacity, ghost at `T−0.5s` @ 40 %, swap at `T`, current fade at `T+0.2s` | Smooth transition between chords |
| **D2.H2** | 11:00–11:45 | Shrink `<ChordStrip />` to 48 px ribbon; confirm it still pulls from `useActiveChord` (no drift) | Single source of truth verified |
| **D2.H3** | 11:45–12:30 | `prefers-reduced-motion` branch; desktop/mobile orientation switch at page-load breakpoint | Reduced-motion users get instant swap |
| *lunch* | 12:30–13:00 | — | — |
| **D2.H4** | 13:00–14:00 | Lighthouse check: LCP / TBT / CLS / bundle vs. TRD budgets | All green or documented cut |
| **D2.H5** | 14:00–15:00 | Playwright visual regression at 375 / 768 / 1280; axe-core on `/play/:songId` | Snapshots + a11y report committed |
| **D2.H6** | 15:00–16:00 | Manual QA — real guitar, real phone, one full song end-to-end | Finger placement matches dots |
| **D2.H7** | 16:00–16:45 | Merge to `main`, Vercel prod deploy, smoke test live URL | Live URL + Plausible pageview |
| **D2.H8** | 16:45–17:00 | Release notes + update `CLAUDE.md` shipped-features line | Docs reflect v2.1 |

## Task Breakdown (detail)

### D1.H1 — `lib/fretboard.ts`
- `toFretboardShape`: fold `barres?: number[]` (per-fret int array from chords-db) into typed `{fromString, toString, fret}` segments; validate all 6 slots present.
- `computeFretWindow`: `minFret = 0`, `maxFret = max(5, max(max(frets) per shape))`, clamp `maxFret ≤ 12`.
- `renderCoords`: parameterize by orientation; orientation is a top-level branch, not scattered.
- Tests: open G, barre F (baseFret 1), Bb at baseFret 6, muted-strings edge case, fingers-all-zero fallback.

### D1.H2 — `<Fretboard />`
- `<svg viewBox>` sized by container; nut line thicker; inlays at frets 3/5/7/9.
- Dots: `<circle>` + `<text>` for finger number.
- Barre: single rounded `<rect>`.
- Markers: `×` / `○` glyphs left of the nut (horizontal) or above (vertical).

### D2.H1 — Cross-fade
- Two `<g>` layers: `current`, `ghost`. Opacity animated via CSS class toggled by `useActiveChord` outputs.
- Opacity only — no `fill` animation (paint cost).
- Sanity: no animation when `nextStartsAt == null` (last chord in song).

### D2.H6 — Manual QA checklist
- Chord dots match fingerboard reality on a real guitar (spot-check 3 chords per song).
- Seeking jumps the fretboard instantly, no stale ghost.
- Pausing leaves the fretboard on the current chord.
- Mobile Safari (375 px) renders vertical orientation without overflow.
- Reduced-motion (macOS / iOS) kills the cross-fade.
- No console errors; Sentry receives a manual test error.

## Definition of Done — end of Day 2

- [ ] `feat/neck-viz` merged to `main`; Vercel prod deploy live
- [ ] `<Fretboard />` renders active + ghost chord on `/play/:songId`
- [ ] `<Fretboard />` also powers `/chords` finder (shared component)
- [ ] Unit tests ≥ 80 % on `lib/fretboard.ts` and `useActiveChord`
- [ ] Playwright visual snapshots committed for 375 / 768 / 1280
- [ ] axe-core passes on `/play/:songId` and `/chords`
- [ ] LCP / TBT / CLS within TRD §Performance Budget
- [ ] Bundle size ≤ 155 KB gzipped
- [ ] `prefers-reduced-motion` path verified on macOS
- [ ] Manual real-guitar check passes on one full song
- [ ] Plausible event `fretboard_rendered` fires on first chord hit

## Cut-Scope Tripwires

- **`renderCoords` not passing barre tests by end of D1.H1** → ship dots-only, defer barres to v2.1.1.
- **Cross-fade janky on D2.H1** → drop ghost chord entirely; instant swap only.
- **Mobile orientation broken by D2.H3** → ship desktop-only behind a media query; mobile keeps existing chord strip.
- **Lighthouse regression by D2.H4** → cut ghost chord first, then shrink fret inlays.
- **Not merged by D2.H7** → keep preview URL up over the weekend for internal review; ship Monday.

## Out of Scope for v2.1 (reminder)
3D fretboard, left-handed flip, multi-voicing picker, animated strumming hand, auto mid-song fret window resize. All deferred to v2.2+ per PRD.
