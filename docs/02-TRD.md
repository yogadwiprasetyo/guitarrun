# TRD — GuitarRun MVP

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Vite + React 18 + TypeScript** | Fastest dev loop for solo; no SSR needed (SPA is fine for 3 routes). |
| Routing | `react-router-dom` v6 | Four routes: `/`, `/play/:songId`, `/tuner`, `/chords`. |
| Styling | **Tailwind CSS + CSS variables** for design tokens | Ship custom-feeling UI without a component-lib footprint. |
| State | React state + URL params. No Redux/Zustand. | Three isolated features — no cross-cutting state. |
| YouTube | **YouTube IFrame Player API** (official, free, ToS-safe) | No audio extraction. Embed + listen to `onStateChange` and poll `getCurrentTime()`. |
| Pitch detection | **Pitchy** (npm `pitchy`) — McLeod Pitch Method | ~1KB, real-time, accurate for monophonic input. |
| Chord diagrams | **`svguitar`** (npm) | SVG fretboard rendering; small footprint. |
| Chord data | Static JSON derived from **`@tombatossals/chords-db`** (MIT) | ≥80 shapes without an external API. |
| Analytics | Plausible (free tier) or Umami | No cookies, GDPR-safe, lightweight. |
| Error tracking | Sentry free tier (5K events/mo) | Catch prod JS errors. |
| Hosting | **Vercel** (free tier) | Git-push deploys, edge CDN, HTTPS out of the box. |

## Architecture (client-only)

```
┌───────────────────── Browser ─────────────────────┐
│  React SPA (Vite build, static on Vercel)        │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐          │
│  │  Home   │  │  Play   │  │  Tuner   │          │
│  │  /      │  │  /play  │  │ /tuner   │          │
│  └────┬────┘  └────┬────┘  └────┬─────┘          │
│       │            │            │                │
│       ▼            ▼            ▼                │
│  ┌──────────┐ ┌─────────┐  ┌─────────────┐       │
│  │songs.json│ │ YT API  │  │ getUserMedia│       │
│  │ (static) │ │ iframe  │  │  + Pitchy   │       │
│  └──────────┘ └─────────┘  └─────────────┘       │
│                                                   │
│  ┌──────────────────────────────────────┐        │
│  │  Chord Finder  /chords               │        │
│  │   chords.json + svguitar             │        │
│  └──────────────────────────────────────┘        │
│                                                   │
│  localStorage: tuner mode only                   │
└───────────────────────────────────────────────────┘
         │
         ▼
   Vercel Edge CDN (static) → Plausible + Sentry
```

Zero backend. Zero auth. Zero DB.

## Data Model

### `src/data/songs.json`
```ts
type Song = {
  id: string;                 // "wonderwall-oasis"
  title: string;
  artist: string;
  youtubeId: string;          // "bx1Bh8ZvH84"
  difficulty: "beginner" | "intermediate";
  chordsUsed: string[];       // ["Em7", "G", "Dsus4", "A7sus4", "Cadd9"]
  bpm: number;                // manual
  timeline: ChordHit[];
};
type ChordHit = {
  t: number;                  // seconds from video start, float
  chord: string;              // must match a key in chords.json
  lyric?: string;             // optional line displayed with the chord
};
```

### `src/data/chords.json`
```ts
type ChordShape = {
  name: string;               // "Cmaj7"
  notes: string[];            // ["C","E","G","B"]
  positions: Array<{
    frets: number[];          // 6 items, low E → high E; -1 = muted
    fingers: number[];        // 0 = open, 1–4 = finger
    barres?: number[];
    baseFret: number;         // 1 = open position
  }>;
};
```

### Storage
- **In-memory:** React state for player, pitch detection, search.
- **localStorage:** `gr:tuner:mode` → `"standard" | "drop-d"`. Single key.
- **No IndexedDB.** No cookies.
- **No dates stored anywhere in MVP.**

## Third-Party APIs

| API | Use | Risk |
|---|---|---|
| YouTube IFrame Player API | Embed + playback state | Some music videos disallow embed — curate the song list around embeddable ones. |
| `MediaDevices.getUserMedia` | Mic input for tuner | HTTPS required (Vercel default). iOS Safari requires a user gesture. |
| Web Audio API (`AudioContext`, `AnalyserNode`) | Feed mic → Pitchy | Must `resume()` after user gesture on Safari. |

## Browser Compatibility & Performance

**Supported:** Chrome ≥100, Safari ≥15, Firefox ≥100, Edge ≥100. Mobile Safari iOS ≥15, Chrome Android ≥100.

**Budgets:**
- Initial JS ≤ 150 KB gzipped.
- LCP ≤ 2.0s on 4G throttled.
- Tuner pitch-detection loop ≤ 20 ms/frame; 30 fps updates.

## Constraints & Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| YouTube disables embed for a selected song | Medium | Test every `youtubeId` in incognito before shipping; keep replacements ready. |
| Mobile Safari mic quirks | Medium | Tuner requires a "Tap to start" button; `AudioContext.resume()` inside the click handler. |
| Chord timeline drift over long videos | Low | Poll `getCurrentTime()` at 4 Hz and binary-search the timeline array; no cumulative error. |
| Manual song timing is tedious | High | Build a dev-only `?edit=1` overlay that tap-logs timestamps to clipboard. Ship 15 songs only. |
| Pitchy false positives on background noise | Medium | Require `clarity > 0.9` before displaying a pitch. |
| `svguitar` bundle surprise | Low | Verify bundle size after first import; fall back to hand-rolled SVG if >30KB. |
