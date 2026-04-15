# Roadmap — Post-MVP

Ranked by **(Impact × Validation Value) / Effort**. Do **not** start any v2 work until MVP metrics from `docs/01-PRD.md` are measured for ≥2 weeks.

## Priority order

| # | Feature | Effort | Impact | Prereq |
|---|---|---|---|---|
| 1 | Neck-Visualization Play-Along (polished hero view) | 2 d | High | MVP Song Player stable |
| 2 | Chord Trainer drills | 2 d | Med-High | Chord Finder |
| 3 | Song library expansion (15→50→200) + search/filter | 2 d | High | MVP data schema |
| 4 | Monophonic chord validation (silent drill, no backing track) | 3 d | Medium | Tuner hook |
| 5 | Auto BPM detection (tap-tempo → audio) | 1 d tap / 4 d audio | Low-Med | — |
| 6 | Community-submitted song timings (GitHub PR flow, no auth) | 3 d | High long-tail | Authoring tool, moderation checklist |
| 7 | Polyphonic chord validation against backing track | 3+ weeks R&D | Unknown | External ML; research bet |
| 8 | Accounts + saved progress | 5 d | Medium | Retention signal |

## Detail

### 1. Neck-Visualization Play-Along  *(E: 2d, I: High)*
Replace the flat chord strip with a fretboard background where dots light up on the correct frets in sync with the song. The "wow" moment that earns word-of-mouth.
**Depends on:** stable MVP Player; decide SVG (smaller) vs. react-three-fiber (3D).

### 2. Chord Trainer  *(E: 2d, I: Med-High)*
Timed drills: "switch G → D in 2 seconds." Configurable chord pool, BPM, duration. Visual prompt + self-report in first pass — no audio validation yet.
**Depends on:** Chord Finder (reuses diagram).

### 3. Library expansion + filter  *(E: 2d, I: High)*
Grow to 50 curated songs. Filter by difficulty, chord set ("only G C D Em songs"), decade. Required so the product doesn't feel empty.
**Depends on:** MVP schema; build a dev-only timing authoring tool (timestamp clipboard logger) first.

### 4. Monophonic chord validation  *(E: 3d, I: Med)*
User strums a chord in a silent drill; detect root + quality via chroma vector. No source separation needed. Stepping stone to the hard version.
**Depends on:** generalize `useMicPitch` → `useMicAudio` with FFT + chroma.

### 5. Auto BPM detection  *(E: 1d tap / 4d audio, I: Low-Med)*
Phase 5a: tap-tempo widget (user taps along). 1 day. Phase 5b: acoustic BPM via `meyda` / autocorrelation. Only valuable if it removes manual work reliably.

### 6. Community song submissions  *(E: 3d, I: High long-tail)*
PR-based: users fork, run authoring tool locally, open PR with a new `songs.json` entry. No auth, no backend — moderation is GitHub review.
**Depends on:** authoring tool from #3; short contribution guide.

### 7. Polyphonic chord validation vs. backing track  *(E: 3+ weeks, I: Unknown)*
The original brief's hardest feature. Requires either source separation (Demucs in browser via WASM) or pre-computed chord hits with generous tolerance. **Do not attempt until #1–#5 are live** and users explicitly ask for it.

### 8. Accounts + progress  *(E: 5d, I: Med)*
Only justified if metrics show users returning and losing context. Start with localStorage; graduate to Supabase/Clerk only if cross-device is requested.

## Dependency Graph

```
MVP (Player, Tuner, Chord Finder)
  ├── [1] Neck Viz ────────┐
  ├── [2] Chord Trainer ───┼──► [4] Mono Validation ──► [7] Polyphonic
  ├── [3] Library + Filter ┤                               ▲
  │       └─► [6] Submissions                              │
  └── [5a] Tap Tempo ──► [5b] Audio BPM ───────────────────┘

                          [8] Accounts (gated on retention signal)
```

## Effort × Impact Matrix

```
        Low Impact            High Impact
High  ┌───────────────────┬───────────────────┐
Effort│ [8] Accounts      │ [4] Mono Validate │
      │ [7] Polyphonic    │ [6] Submissions   │
      │                   │ [1] Neck Viz      │
      ├───────────────────┼───────────────────┤
Low   │ [5a] Tap Tempo    │ [2] Chord Trainer │
Effort│                   │ [3] Library Grow  │
      └───────────────────┴───────────────────┘
```

**Start top-right. Avoid top-left until signal justifies it.**
