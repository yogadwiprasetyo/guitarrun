---
name: guitarrun-build
description: Step-by-step reusable skill for building the GuitarRun 1-day MVP — a client-only guitar practice web app with Song Player, Tuner, and Chord Finder.
---

# GuitarRun Build Skill

> Use alongside existing skills: `frontend-patterns`, `frontend-design`, `e2e-testing`, `typescript-reviewer`, `web-artifacts-builder`.
> Do **not** write code until `docs/01-PRD.md` and `docs/02-TRD.md` are re-read in the current session.

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
