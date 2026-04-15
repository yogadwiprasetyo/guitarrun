# GuitarRun

A client-only web app that helps casual guitarists play along to songs they love.

## Features

- **Song Player** with synced chord strip
- **Neck-Visualization Play-Along** — fretboard hero with dot positions lighting up to the music; horizontal on desktop, vertical on mobile
- **Chromatic Tuner** — microphone + Pitchy McLeod pitch detection; ±5 cents needle on EADGBE
- **Chord Finder** — 80+ diagrammed shapes, fuzzy search
- **Chord Trainer** — timed drills with configurable pool, BPM, duration, beat progress, score; tap-tempo widget; Esc to stop
- **Library Filter** — by difficulty, decade, "songs that use only these chords" subset
- **YouTube URL Ingestion** — paste any link; curated → synced view, unknown → explore mode
- **Difficulty Modes** — Beginner / Intermediate / Advanced / Original; auto-substitutes barre chords for open voicings
- **Live Chord Validation** — opt-in mic listener compares your playing to the expected chord (headphones recommended; silence-gated)
- **Auto-Extraction Backend** *(deploy via Modal)* — paste any YouTube URL → BPM + chord progression auto-extracted via `yt-dlp` + `librosa` (see `backend/README.md`)
- **Recently Played** + **Edit-Mode Timing Buffer** for contributors

No accounts. No ads. Static SPA + optional Modal backend for auto-extraction.

## Dev

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm run preview
npm test           # vitest (59 cases)
```

## Backend (optional)

Auto-extraction from arbitrary YouTube URLs needs the Modal backend.

```bash
pip install modal
modal token new
modal deploy backend/modal_app.py
# set VITE_EXTRACT_API_URL=<modal endpoint URL> in Vercel env
```

See [`backend/README.md`](backend/README.md) for spend cap, legal pattern, and operational notes.

If `VITE_EXTRACT_API_URL` is unset the client returns "unsupported" for non-curated URLs and the rest of the app keeps working.

## Deploy

Push to GitHub, import into Vercel. `vercel.json` handles SPA rewrites + caching.

## Permissions

- **Microphone:** required only for `/tuner` and the live chord validator on `/play/:songId`; requested on user gesture.
- **Third parties:** YouTube iframe (playback), Google Fonts (Inter), optional Modal extraction backend.

## Contribute

Add a song or chord shape via PR — see [`docs/08-CONTRIBUTING.md`](docs/08-CONTRIBUTING.md). The `?edit=1` clipboard helper on `/play/:songId` makes hand-timing fast.

## Docs

- [`docs/01-PRD.md`](docs/01-PRD.md) — features, success metrics, scope cuts
- [`docs/02-TRD.md`](docs/02-TRD.md) — stack, module map, perf budgets
- [`docs/05-ROADMAP.md`](docs/05-ROADMAP.md) — what shipped, what's deferred
- [`docs/06-NEXT-STEPS.md`](docs/06-NEXT-STEPS.md) — measure-then-decide playbook
- [`docs/07-DEPLOY.md`](docs/07-DEPLOY.md) — hosting + rollback
- [`docs/08-CONTRIBUTING.md`](docs/08-CONTRIBUTING.md) — add a song / chord
- [`docs/09-V3-PHASE-3-EXTRACTION.md`](docs/09-V3-PHASE-3-EXTRACTION.md) — backend architecture
- [`.claude/skill/SKILL.md`](.claude/skill/SKILL.md) — build skill for Claude Code agents
- [`CLAUDE.md`](CLAUDE.md) — agent guidance
