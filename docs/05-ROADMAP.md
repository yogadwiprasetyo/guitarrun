# Roadmap — Status

Updated 2026-04-15. Most build-able items shipped; remaining items are gated on retention signal or active R&D.

## Status

| # | Feature | Status | Notes |
|---|---|---|---|
| 1 | Neck-Visualization Play-Along | **Shipped v2.1** | Hero fretboard on `/play/:songId`, dual orientation, ghost cross-fade, reduced-motion. |
| 2 | Chord Trainer drills | **Shipped v2.3** | `/trainer` route — pool selector, BPM, duration, beat progress, score. |
| 3 | Library expansion + filter | **Infra shipped v2.2** | `SongFilterBar` (difficulty, decade, chord-subset). Library still 3 songs — growth gated on community PRs (#6). |
| 4 | Monophonic chord validation | **Deferred** | 3-day R&D effort. Out of v2.x scope; no validated demand yet. |
| 5a | Tap tempo | **Shipped v2.4** | `TapTempo` widget; integrated in Trainer BPM fieldset. |
| 5b | Acoustic BPM detection | **Deferred** | 4-day R&D; revisit only if manual BPM proves a real friction. |
| 6 | Community song submissions | **Shipped v2.5** | `docs/08-CONTRIBUTING.md`. PR-based; no backend. |
| 7 | Polyphonic chord validation | **Deferred (R&D)** | 3+ weeks; explicit gate per original brief — do not attempt until #1–#5 prove demand. |
| 8 | Accounts + saved progress | **Deferred** | Retention-gated. Revisit if MVP metrics show users returning + losing context. |

## What ships in production today

- Song Player with synced chord strip + neck-visualization fretboard
- Chord Finder with search + diagrams
- Tuner (mic + Pitchy)
- Chord Trainer with tap-tempo
- Home filter bar
- Contribution flow for new songs

## What's next (recommended order, gated on data)

1. **Measure** v2.x in the wild for ≥2 weeks. Targets in `docs/01-PRD.md §Success Metrics`.
2. If 60s play-rate lifts <3pp post v2.1 → freeze visual polish, iterate Chord Trainer.
3. If users explicitly ask for chord validation while a song plays → start scoping #4 as the stepping stone to #7.
4. If retention signal appears → start #8 (localStorage first, then Supabase only if cross-device is requested).

## Dependency graph (current)

```
MVP (Player, Tuner, Chord Finder)               [shipped]
  ├── [1] Neck Viz                              [shipped v2.1]
  ├── [2] Chord Trainer ───────┐                [shipped v2.3]
  ├── [3] Library + Filter ────┤                [infra shipped v2.2]
  │       └─► [6] Submissions  │                [shipped v2.5]
  ├── [5a] Tap Tempo ──────────┤                [shipped v2.4]
  └─────────────────────────────┴──► [4] Mono Validation ──► [7] Polyphonic
                                                      [deferred]   [deferred R&D]

                                  [8] Accounts (retention-gated, deferred)
```

## Effort × Impact (residual)

```
        Low Impact            High Impact
High  ┌───────────────────┬───────────────────┐
Effort│ [8] Accounts      │ [4] Mono Validate │
      │ [7] Polyphonic    │                   │
      ├───────────────────┼───────────────────┤
Low   │ [5b] Audio BPM    │ — all done —      │
Effort│                   │                   │
      └───────────────────┴───────────────────┘
```
