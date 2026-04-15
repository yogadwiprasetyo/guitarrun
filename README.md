# GuitarRun

A client-only web app that helps casual guitarists play along to songs they love.

- **Song Player** with chords synced to a YouTube video
- **Chromatic tuner** via microphone (Web Audio + Pitchy)
- **Chord finder** with 50+ diagrammed shapes

No backend. No signup. No ads.

## Dev

```bash
npm install
npm run dev        # http://localhost:5173
npm run build
npm run preview
```

## Deploy

Push to GitHub, import into Vercel — `vercel.json` handles SPA rewrites and caching.

## Scope notes
See [`../docs/01-PRD.md`](../docs/01-PRD.md), [`../docs/02-TRD.md`](../docs/02-TRD.md), and [`../SKILL.md`](../SKILL.md).

## Permissions
- **Microphone:** required only for `/tuner`; requested on user gesture.
- **Third parties:** YouTube iframe (playback), Google Fonts (Inter).
