# Next Steps — 1-Day Execution Plan

Scope: solo dev, 1 working day (~9 hours). Goal: public URL by end of day.
Treat every slot as a hard budget — if a slot overruns by >30 min, cut scope.

## Schedule (hour-by-hour)

| Slot | Time | Task | Deliverable |
|---|---|---|---|
| **H0** | 09:00–09:30 | Scaffold: Vite + React + TS, Tailwind, Router, deploy empty app to Vercel | Live URL serving "Hello GuitarRun" |
| **H1** | 09:30–11:00 | Chord Finder (90 min) | `/chords` with search + 80 chords via `svguitar` |
| **H2** | 11:00–13:00 | Tuner (2 h) | `/tuner` mic capture, pitch meter, green in-tune |
| *lunch* | 13:00–13:30 | — | — |
| **H3** | 13:30–14:00 | Seed 3 songs in `songs.json` with hand-timed chord hits | Valid JSON; chord names match `chords.json` |
| **H4** | 14:00–17:00 | Song Player (3 h): YT hook, timeline binary search, scrolling chord strip | `/play/:songId` works on desktop Chrome |
| **H5** | 17:00–17:45 | Home + nav + song cards | `/` lists ≥3 songs; header routes work |
| **H6** | 17:45–18:30 | Mobile pass (375px), error boundary, Plausible + Sentry, `vercel --prod` | Production URL, no console errors |
| **H7** | 18:30–19:00 | Manual QA with real guitar + phone vs. `SKILL.md` checklist | All boxes ticked or explicitly waived |

## Task Breakdown

### H0 — Scaffold *(30 min)*
- `pnpm create vite@latest` + install deps *(5m)*
- Tailwind config + base CSS *(10m)*
- Router + 4 empty route components *(5m)*
- `git init`, push to GitHub, connect Vercel, confirm auto-deploy *(10m)*

### H1 — Chord Finder *(90 min)*
- Import `@tombatossals/chords-db/lib/guitar.json`, filter to 80 shapes, write `chords.json`, drop the dep *(25m)*
- `ChordDiagram.tsx` wrapping `svguitar` *(20m)*
- `ChordSearch.tsx` controlled input + substring match *(15m)*
- `ChordsPage.tsx` layout (sticky search, responsive grid) *(20m)*
- QA against `SKILL.md` checklist *(10m)*

### H2 — Tuner *(2 h)*
- `useMicPitch` hook: getUserMedia + AudioContext + Pitchy *(45m)*
- `lib/pitch.ts`: `hzToNote`, `centsOff`, `nearestString` *(25m)*
- `TunerMeter` SVG needle + color states *(30m)*
- `TunerPage` tap-to-start + readout + cleanup on unmount *(20m)*

### H3 — Seed songs *(30 min)*
- Pick 3 songs, find safe `youtubeId`s (test embed in incognito) *(10m)*
- Hand-time chord hits by scrubbing video (≤4 changes/bar) *(20m)*

### H4 — Song Player *(3 h)*
- `useYouTubePlayer` (load IFrame API, bind events, poll time at 4 Hz) *(60m)*
- `lib/timeline.ts` binary search for active chord *(20m)*
- `CurrentChordPanel` (big chord + diagram) *(20m)*
- `ChordStrip` horizontal list, `transform: translateX` for scroll *(45m)*
- Wire video state → strip scroll → active chord *(25m)*
- Seek + pause handling *(10m)*

### H5 — Home *(45 min)*
- `SongCard` component *(15m)*
- `HomePage` grid *(15m)*
- Top nav + routing polish *(15m)*

### H6 — Deploy polish *(45 min)*
- Mobile at 375px: fix overflow, tap targets *(20m)*
- Error boundary at root *(5m)*
- Plausible `<script>` + `Sentry.init({ dsn })` via Vercel env vars *(10m)*
- `pnpm build`, check bundle, `vercel --prod` *(10m)*

### H7 — QA *(30 min)*
- Run `SKILL.md` checklist on:
  - Desktop Chrome
  - Mobile Safari (real device)
  - Real guitar plugged into the tuner
- File GitHub issues for anything failing; ship anyway if non-critical; note in release post.

## Definition of Done — end of day

- [ ] Public Vercel URL loads in <2s on 4G
- [ ] Home shows ≥3 songs (15 stretch)
- [ ] At least 1 song plays end-to-end with chord strip synced
- [ ] Tuner detects an open A string within ±5 cents on a real guitar
- [ ] Chord Finder returns Cmaj7 in <100 ms; diagram renders
- [ ] Zero console errors on any route
- [ ] Plausible recording pageviews
- [ ] Sentry catches a manually-thrown test error
- [ ] README.md has live URL + 1-paragraph pitch

## Cut-Scope Tripwires

- Song Player not syncing by 16:30 → ship 1 song instead of 3, move on.
- Tuner needle flaky by 12:30 → show raw Hz + note name, skip needle polish.
- Mobile breaks past 18:00 → ship desktop-only with a "desktop for now" banner on mobile, fix next day.
- Vercel deploy fails past 18:45 → fall back to GitHub Pages.
