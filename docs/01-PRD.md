# PRD — GuitarRun v2.5

Updated 2026-04-15. MVP + Roadmap items 1, 2, 3 (infra), 5a, 6 are live.

## Persona
**Riya, 24, casual guitarist.** Owns an acoustic, knows 6–8 open chords (G, C, D, Em, Am, E, A, Dm). Wants to play along to a YouTube song in under 5 minutes. Bounces from Ultimate Guitar (ads, broken auto-scroll, separate tuner tab).

## Problem
Three-tool juggling: YouTube + tab site + tuner app. Nothing syncs. Nothing is designed for "play this song right now." MVP solved sync + chord names; v2.1 added the **finger-placement visual** so beginners don't have to mentally map chord names to shapes.

## Shipped features

### F1 — Song Player *(MVP)*
Pick song → embedded YouTube + chord timeline auto-scrolls + active chord highlighted with diagram.

### F2 — Tuner *(MVP)*
Mic + Pitchy McLeod pitch detection; ±5 cents needle, EADGBE auto-target.

### F3 — Chord Finder *(MVP)*
≥80 chord shapes, fuzzy search, SVG diagrams.

### F4 — Neck-Visualization Play-Along *(v2.1)*
`/play/:songId` shows a fretboard hero where dot positions light up in time with the song. Horizontal on desktop, vertical on mobile (locked at page-load 640 px breakpoint). Next-chord ghost cross-fade T−0.5s → swap → T+0.2s. `prefers-reduced-motion: reduce` → instant swap. `aria-label` per chord change.

### F5 — Library Filter *(v2.2)*
`SongFilterBar` on Home — difficulty, decade, "songs that use only these chords" subset filter. `Song` schema gained optional `decade` + `tags`.

### F6 — Chord Trainer *(v2.3)*
`/trainer` — pool selector (any open chords), BPM 30–160, duration 60s/2m/5m/endless. Beat progress bar, score counter. Reuses `<Fretboard />`. Self-report; no audio validation (deferred to Roadmap #4).

### F7 — Tap Tempo *(v2.4)*
`TapTempo` widget — rolling avg over last 8 taps, 2 s reset window. Wired into Trainer BPM fieldset. Reusable elsewhere.

### F8 — Community Song Submissions *(v2.5)*
PR-based via `docs/08-CONTRIBUTING.md`. No backend; review is the gate.

### F9 — YouTube URL Ingestion + Difficulty Mode *(v3 P1)*
Paste any YouTube URL on Home; curated songs jump straight to the synced view. Unknown URLs open in **Explore mode** (player + extraction status). PlayPage exposes a Beginner/Intermediate/Advanced/Original mode selector via `?mode=` URL param (substitution table is v3 P4 backlog).

### F10 — Live Chord Validation *(v3 P2)*
Opt-in mic listener under the chord strip. Computes a 12-bin chromagram from `AnalyserNode` output, matches against 60 chord templates (maj/min/7/m7/maj7 in 12 roots), shows "heard X (n%)" with an accent bar that fills when the played chord matches the expected one. **Headphones recommended** so the backing track doesn't pollute the mic chroma.

### F11 — Auto-Extraction *(v3 P3)*
Take any YouTube URL → backend pipeline produces chord progression + BPM + chord set; lyrics in stage 3.4. **Backend code complete on Modal** (`backend/modal_app.py`): yt-dlp downloads audio → cached in Modal Volume; librosa extracts BPM via beat tracking; chromagram + 60-template cosine match yields the chord timeline; persisted in Modal Dict.

PlayPage handles three states for unknown URLs: `extracting` (poll every 5 s, 5 min cap), `ready` (full UI with extracted Song), `error/unsupported` (graceful banner with contribute-back CTA).

Cost ceiling: $200/mo Modal spend cap. Cached-derivative-only legal pattern (see `backend/README.md`).

## Out of Scope (current)

| Cut | Why |
|---|---|
| User accounts / saved progress | Roadmap #8, retention-gated. |
| Auto chord detection from arbitrary YouTube URL | Roadmap #7, R&D — 3+ weeks. |
| Real-time mic chord validation while song plays | Roadmap #7. |
| Monophonic chord validation in silent drill | Roadmap #4, deferred until demand. |
| Acoustic BPM detection | Roadmap #5b, deferred — manual + tap tempo cover the need. |
| 3D fretboard | Bundle cost vs. wow delta — revisit v3. |
| Left-handed flip | One-line change, defer until asked. |
| Multi-voicing chord picker | v2.2+ — v2.x uses `positions[0]`. |

## Success Metrics

Measured 2 weeks post-v2.5 launch:

| Metric | Target |
|---|---|
| Activation: landing → song click | ≥40 % |
| Core action: song page → press play AND stay ≥60 s | MVP baseline ≥25 % → **v2.1+ ≥35 %** |
| Tool use: tuner sessions / total sessions | ≥15 % |
| New: trainer drill started → completed (any duration) | ≥40 % |
| Qualitative: ≥3 of 5 retested guitarists call the fretboard "the reason I'd come back" | y/n |

**Kill criteria:**
- 60s play-rate not lifting ≥3 pp after v2.1 → freeze visual polish, focus on Trainer.
- <10 % of song-page visitors press play → core loop broken; stop adding features, fix.

## Roadmap reference

See `docs/05-ROADMAP.md` for the full status table.
