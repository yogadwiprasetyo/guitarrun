---
name: guitarrun-build
description: Reusable skill for building GuitarRun — MVP (shipped) and v2.1 Neck-Visualization Play-Along. Client-only React/Vite/TS guitar practice app with Song Player, Tuner, Chord Finder, and fretboard hero view.
---

# GuitarRun Build Skill

> **Canonical docs — re-read at every session start:** `docs/01-PRD.md`, `docs/02-TRD.md`, `docs/05-ROADMAP.md`, `docs/06-NEXT-STEPS.md`, `CLAUDE.md`.
> Do **not** write code until those are re-read in the current session.

## Global Skills & Subagents — cheat-sheet

Use these to move faster; they know more than raw tools.

| Phase | Global skill(s) | Subagent (parallelize when independent) |
|---|---|---|
| Visual direction, design tokens | `frontend-design`, `design-system`, `liquid-glass-design` | — |
| React architecture, hooks, composition | `frontend-patterns`, `coding-standards` | — |
| TDD on pure-geometry libs | `tdd-workflow` | `tdd-guide` |
| Playwright visual regression + axe-core | `e2e-testing`, `accessibility` | `e2e-runner`, `a11y-architect` |
| Post-write review (required pre-commit) | — | `typescript-reviewer`, `code-reviewer` |
| Security sweep if touching user input / external IO | `security-review` | `security-reviewer` |
| Lighthouse / bundle / frame budget | — | `performance-optimizer` |
| Vite / TS build errors | — | `build-error-resolver` |
| Dead-code / duplicates at sprint end | — | `refactor-cleaner` |
| Deep codebase Q&A in parallel | — | `Explore` (very thorough) |
| Docs / codemaps refresh after ship | — | `doc-updater` |

**Default per-slot pattern:** write failing tests (via `tdd-guide`) → implement → run `typescript-reviewer` + `code-reviewer` **in parallel** → `security-reviewer` if applicable → commit.

## Build Order (strict — front-to-back)

1. Scaffold → 2. Chord Finder → 3. Tuner → 4. Song Player → 5. Home index → 6. Polish/deploy.
Rationale: each step unlocks the next. Chord data + diagrams are reused by the Player.

## Step 1 — Scaffold (~30 min)

```bash
pnpm create vite@latest guitarrun-app -- --template react-ts
cd guitarrun-app
pnpm add react-router-dom pitchy svguitar
pnpm add -D tailwindcss postcss autoprefixer @types/youtube
pnpm dlx tailwindcss init -p
```

Wire Tailwind (`tailwind.config.js` content array, `src/index.css` directives), Router in `main.tsx`, install Vercel CLI: `pnpm add -g vercel`.

## Step 2 — Chord Finder (~1.5 h)

- `src/data/chords.json` — import from `@tombatossals/chords-db/lib/guitar.json`; trim to 80 shapes covering maj/min/7/maj7/m7/sus2/sus4 across 12 roots.
- Build `ChordDiagram.tsx` wrapping `svguitar`. Props: `{ shape: ChordShape; size?: "sm" | "md" | "lg" }`.
- Build `ChordSearch.tsx` with controlled input + simple substring match (ignore case, strip spaces). No fuzzy lib needed.
- `/chords` route renders search + grid of diagrams.

**Done when:** search for `cmaj7` returns the right shape; diagram shows fingers + barres correctly; 80+ chords browsable without pagination lag.

## Step 3 — Tuner (~2 h)

- `hooks/useMicPitch.ts` — encapsulates `getUserMedia` + `AudioContext` + `Pitchy.findPitch`. Returns `{ pitchHz, clarity, start, stop, error }`.
- `lib/pitch.ts` — `hzToNote(hz)`, `centsOff(hz, targetHz)`, `nearestString(hz, mode)`.
- `TunerPage.tsx` — "Tap to start" button (required for Safari), live readout, needle SVG (-50..+50 cents), green at ±5 cents.
- Persist mode to `localStorage` key `gr:tuner:mode`.

**Done when:** plucking an open E on a real guitar shows ~82.4 Hz, needle centered; plucking low drives needle correctly flat/sharp; mic-denied shows a retry CTA.

## Step 4 — Song Player (~3 h)

- `src/data/songs.json` — seed with 3 songs by hand first (Wonderwall, Horse With No Name, Knocking on Heaven's Door). Expand to 15 after core works.
- `hooks/useYouTubePlayer.ts` — wrap IFrame API. Returns `{ ready, currentTime, state, play, pause, seek }`. Poll `getCurrentTime()` at 250 ms when playing.
- `lib/timeline.ts` — `activeChordAt(timeline, t): { index, hit }`. Binary search.
- `PlayPage.tsx` (`/play/:songId`) — top: YouTube embed. Middle: large current chord + diagram. Bottom: horizontal scrolling chord strip, active chord centered with a marker line.
- Auto-scroll the strip to keep active chord centered (`transform: translateX`, not `scrollLeft`, so it's compositor-friendly).

**Done when:** loading `/play/wonderwall-oasis`, pressing play, chord strip scrolls in sync; pausing halts scroll; seeking the video updates the active chord within 500 ms.

## Step 5 — Home (~45 min)

- `HomePage.tsx` — grid of song cards (title, artist, difficulty pill, chord chips). Top nav links to Tuner and Chord Finder.
- Build static. No filtering/sorting in MVP.

## Step 6 — Polish + deploy (~1 h)

- Mobile pass at 375px; fix overflow.
- Error boundary at app root.
- Add Plausible script, Sentry init.
- `vercel --prod`.

## File Structure

```
guitarrun-app/
├── src/
│   ├── main.tsx
│   ├── App.tsx                      # router
│   ├── routes/
│   │   ├── HomePage.tsx
│   │   ├── PlayPage.tsx
│   │   ├── TunerPage.tsx
│   │   └── ChordsPage.tsx
│   ├── components/
│   │   ├── ChordDiagram.tsx
│   │   ├── ChordStrip.tsx           # scrolling timeline
│   │   ├── TunerMeter.tsx
│   │   ├── SongCard.tsx
│   │   └── ui/                      # Button, Pill, Input
│   ├── hooks/
│   │   ├── useMicPitch.ts
│   │   └── useYouTubePlayer.ts
│   ├── lib/
│   │   ├── pitch.ts
│   │   ├── timeline.ts
│   │   └── analytics.ts
│   ├── data/
│   │   ├── songs.json
│   │   └── chords.json
│   └── styles/
│       └── tokens.css
└── public/
    └── favicon.svg
```

## Naming Conventions

- Components: `PascalCase` file + default export named identically.
- Hooks: `useXxx.ts`, camelCase export.
- Lib utils: pure functions, named exports.
- JSON files: kebab-case filenames, camelCase field names.
- CSS vars: `--color-*`, `--space-*`, `--text-*`.
- localStorage keys: `gr:<feature>:<key>`.

## Component Hierarchy

```
App (router)
├── HomePage
│   └── SongCard × N
├── PlayPage
│   ├── YouTubeEmbed
│   ├── CurrentChordPanel (ChordDiagram)
│   └── ChordStrip (active hit highlighted)
├── TunerPage
│   └── TunerMeter (needle + note readout)
└── ChordsPage
    ├── ChordSearch
    └── ChordDiagram × grid
```

## Coding Standards

- **TypeScript strict.** No `any`. No `// @ts-ignore`.
- **Immutable state.** Never mutate props/state — return new arrays/objects.
- **No `useEffect` for derived state** — use `useMemo`.
- **Cleanup in every effect.** `AudioContext.close()`, `cancelAnimationFrame`, YT player destroy.
- **Files < 300 lines.** Extract when approaching.
- **Early return > nested if.**
- **Animate `transform` / `opacity` only.** No layout-bound animation.
- **No secrets** (static SPA).

## Testing & Validation Checklist

### Chord Finder
- [ ] Search "C" returns C major at top of results
- [ ] Search "cmaj7" (lowercase) finds Cmaj7
- [ ] Diagram renders 6 strings, correct fret dots, finger numbers
- [ ] Muted strings show ×; open strings show o
- [ ] Grid works at 375px without horizontal scroll

### Tuner
- [ ] Mic permission prompt fires on tap (not on load)
- [ ] Denied mic → retry CTA visible
- [ ] Open A string (~110 Hz) registers within ±3 cents of A
- [ ] Needle turns green within ±5 cents of target
- [ ] Switching tabs / closing page stops the mic stream (no leak)

### Song Player
- [ ] YouTube iframe loads and autoplay-blocked state handled
- [ ] Chord strip scrolls in sync with video play
- [ ] Pause halts scroll; resume continues from correct chord
- [ ] Seeking the video updates active chord in <500 ms
- [ ] Active chord diagram renders the right shape from chords.json
- [ ] Mobile Safari: video plays inline, chord strip doesn't jitter

### Home
- [ ] All songs navigable; no dead links
- [ ] Header links to /tuner and /chords work

### Cross-cutting
- [ ] Initial JS ≤ 150 KB gzipped (check `vite build` output)
- [ ] Lighthouse Performance ≥ 85 desktop, ≥ 75 mobile
- [ ] No console errors on any route
- [ ] Error boundary catches a thrown test error without whitescreen

---

# v2.1 — Neck-Visualization Play-Along (Roadmap #1)

> Sprint spec: `docs/06-NEXT-STEPS.md` · Feature spec: `docs/01-PRD.md §F4` · Tech delta: `docs/02-TRD.md §v2.1`.
> 2-day sprint; design already locked (horizontal desktop / vertical mobile, auto-fit frets min 0–5, next-chord ghost cross-fade, rounded barres, subtle motion).

## Build Order (strict)

D1: pure geometry → standalone component → reuse in `/chords` → a11y + visual baselines.
D2: wire to player → cross-fade → reduced-motion + mobile orientation → Lighthouse → ship.

## Step A — `src/lib/fretboard.ts` (TDD, ~1.5 h)

Invoke `tdd-guide` subagent to scaffold failing tests first. Then implement.

Exports:
```ts
interface FretboardShape {
  frets: ReadonlyArray<number>      // 6 entries, low-E→high-E; -1 muted, 0 open, ≥1 fret
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

Test matrix (minimum):
- open G (no barre), open C (muted low E), open D (muted low E + A)
- barre F at baseFret 1 (full 6-string barre)
- Bb at baseFret 6 (partial barre)
- fingers-all-zero fallback
- `computeFretWindow` clamps `maxFret ≤ 12`, floors `maxFret ≥ 5`

**Done when:** ≥80 % coverage for this module; all functions pure; no DOM imports.

## Step B — `src/components/Fretboard.tsx` (~1.5 h)

Props:
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

Implementation notes:
- Pure SVG `<svg viewBox>`; container-sized via `ResizeObserver` + RAF debounce.
- Two `<g>` layers (`current`, `ghost`); animate `opacity` only (no `fill`, no layout props).
- `prefers-reduced-motion: reduce` → `transition: none`.
- `role="img"` + `aria-label` built from `describeShapeForA11y`.

Consult `frontend-design` skill for visual treatment (dot glow, nut emphasis, inlay dots at frets 3/5/7/9). Avoid generic-template look per `web/design-quality.md`.

**Done when:** renders any `ChordPosition` standalone; also drops into `/chords` grid unchanged.

## Step C — `src/hooks/useActiveChord.ts` (~45 min)

Wraps existing `lib/timeline.ts` binary search. Returns `{ current, next, nextStartsAt }`. Both `<Fretboard />` and `<ChordStrip />` consume this — prevents drift.

TDD via `tdd-guide`: synthetic timeline with 4 hits; assert seek, pause, end-of-song.

## Step D — Wire into play page + cross-fade (~2 h)

- Compose `<Fretboard />` above a shrunk 48 px `<ChordStrip />` ribbon + `<CurrentChordPanel />`.
- Cross-fade: ghost fades in at `T − 0.5 s` @ 40 %, swap at `T`, current fades at `T + 0.2 s`.
- `nextStartsAt == null` → no animation (last chord in song).

## Step E — Mobile orientation + reduced-motion (~45 min)

- Read viewport width **once at mount** (`window.innerWidth ≤ 640`) → pick orientation. Do **not** live-switch.
- Reduced-motion branch: instant swap, no cross-fade.

## Step F — Quality gates before ship (parallelize)

Run in parallel when independent:

- `typescript-reviewer` + `code-reviewer` on the diff
- `a11y-architect` or `e2e-runner` for axe-core on `/play/:songId` and `/chords`
- `performance-optimizer` for Lighthouse vs. TRD budgets (LCP ≤ 2.0 s, TBT < 200 ms, CLS < 0.1, bundle ≤ 155 KB gz)
- `security-reviewer` — not needed for v2.1 unless new input/IO is added
- `refactor-cleaner` once features freeze

Playwright visual regression baselines at 375 / 768 / 1280 px (via `e2e-testing` skill + `e2e-runner`).

## v2.1 Validation Checklist

### Fretboard (standalone)
- [ ] Open G, C, D, Em render correct dots + markers
- [ ] F barre renders single rounded `<rect>`, not 6 dots
- [ ] Bb at baseFret 6 stays inside the fret window
- [ ] Muted strings show `×`; open strings show `○`
- [ ] Works at 375 / 768 / 1280 without overflow

### Play page integration
- [ ] Active chord dots update as video plays; no lag >250 ms
- [ ] Seeking updates fretboard within 500 ms, no stale ghost
- [ ] Pause leaves fretboard on current chord
- [ ] `<ChordStrip />` + `<Fretboard />` never drift (same `useActiveChord` source)
- [ ] Last chord in song: no ghost/fade attempt

### Accessibility
- [ ] `aria-label` updates per chord change
- [ ] axe-core: 0 critical violations on `/play/:songId` and `/chords`
- [ ] `prefers-reduced-motion: reduce` → instant swap, verified in macOS + iOS

### Perf
- [ ] Bundle ≤ 155 KB gzipped
- [ ] LCP ≤ 2.0 s on 4G throttled (Lighthouse)
- [ ] Cross-fade ≤ 4 ms/frame @ 60 fps (Chrome Perf panel)
- [ ] No CLS regression on `/play/:songId`

### Manual (real guitar + phone)
- [ ] Dots match fingerboard on 3 chords per song
- [ ] One full song end-to-end: finger placement is playable

## v2.1 Cut-Scope Tripwires (mirror of NEXT-STEPS)

- Barre tests failing end of D1.H1 → ship dots-only, defer barres.
- Cross-fade janky D2.H1 → drop ghost, instant swap.
- Mobile orientation broken D2.H3 → desktop-only + media-query fallback.
- Lighthouse regression D2.H4 → cut ghost, then inlays.

## v2.1 File Additions / Changes

```
src/
├── lib/
│   ├── fretboard.ts            # NEW — pure geometry
│   └── chords.ts               # CHANGED — add describeShapeForA11y
├── components/
│   ├── Fretboard.tsx           # NEW — hero SVG
│   └── ChordStrip.tsx          # CHANGED — shrink, consume useActiveChord
├── hooks/
│   └── useActiveChord.ts       # NEW — source of truth
└── routes/
    └── PlayPage.tsx            # CHANGED — compose Fretboard + ChordStrip + Panel
```

No changes to `useYouTubePlayer.ts`, `useMicPitch.ts`, `lib/pitch.ts`, `data/*.json`.

---

# v2.2 — Library Filter (Roadmap #3 infra)

`SongFilterBar` on Home: difficulty + decade + chord-subset.

- **Schema:** `Song` gains optional `decade?: string`, `tags?: string[]`. Backward-compatible.
- **Helpers:** `lib/songs.ts` adds `filterSongs(songs, opts)` and `allChords(songs)`.
- **Component:** `components/SongFilterBar.tsx` — controlled, `aria-pressed` chips, "Clear" button, "Show songs that use **only** these chords" semantics.
- **Empty state:** dashed border + "No matches" copy.

When growing the library: edit `src/data/songs.json` (see `docs/08-CONTRIBUTING.md`). No further UI work needed.

# v2.3 — Chord Trainer (Roadmap #2)

`/trainer` route. Self-report drill — no mic.

- **State machine:** `idle → running → done` (also `idle` after `stop`).
- **Tick:** `setInterval(100ms)`; switch chord when `sinceSwitch >= 60/bpm`. Drift acceptable for v2; revisit RAF if reported.
- **Pool:** any chord whose `name.length ≤ 4` (open-position bias). Toggleable chips.
- **Reuses:** `<Fretboard />` with horizontal orientation, `computeFretWindow` over selected pool, `describeShapeForA11y` for label.
- **Settings panel ↔ drill view:** swap inside the same route on `start()/stop()`.

# v2.4 — Tap Tempo (Roadmap #5a)

`components/TapTempo.tsx` — reusable.

- Rolling avg over last 8 taps, 2 s reset window.
- Clamps to `[min, max]` (default 30–200 bpm).
- Exposes `onChange(bpm)`. No internal state owner.
- Wired into Trainer's BPM fieldset; reuse anywhere a BPM input exists.
- Keyboard: Space + Enter both register a tap.

# v2.5 — Community Submissions (Roadmap #6)

`docs/08-CONTRIBUTING.md` is the feature. PR-based, no backend.

- Verify `youtubeId` embeddability via incognito test.
- Hand-time chord hits; document `Song` schema with required + optional fields.
- New chord shapes appended to `chords.json` (one `positions[0]` per name).
- Local verification: `npm test`, `npx tsc --noEmit`, `npm run dev`.

## Build-order recap (post-v2.5)

```
MVP → v2.1 Neck-Viz → v2.2 Filter → v2.3 Trainer → v2.4 Tap Tempo → v2.5 Contrib guide
            (see docs/05-ROADMAP.md for what's next, gated on data)
```

## Default per-feature pattern (still in effect)

1. Re-read `docs/01-PRD.md`, `docs/02-TRD.md`, `docs/05-ROADMAP.md`.
2. TDD pure libs via `tdd-guide` subagent.
3. Implement smallest viable.
4. Parallel review: `typescript-reviewer` + `code-reviewer`.
5. `security-reviewer` only if touching user input / external IO.
6. Verify in preview server, axe-core sweep on the new surface.
7. Commit + push to `main` (no PR required per current workflow).
8. Update PRD, TRD, NEXT-STEPS, SKILL.md, CLAUDE.md inline with the change.
