# PRD — GuitarRun v2.1 (Neck-Visualization Play-Along)

## Persona
**Riya, 24, casual guitarist.** Owns an acoustic, knows 6–8 open chords (G, C, D, Em, Am, E, A, Dm). Hears a song on Spotify/YouTube and wants to play along in under 5 minutes. Bounces from Ultimate Guitar because of ads, broken auto-scroll, and tuner apps living in a separate tab.

## Problem
Learning a new song requires juggling 3 tools: YouTube (to hear it), a tab site (to see chords), and a tuner app (to tune up). Nothing syncs. Nothing is designed for "play this song right now." **The MVP's flat chord strip works, but it doesn't *show you where to put your fingers* — you still have to mentally map a chord name to a shape.**

## Shipped (MVP — commit `66cbbc2`)
- F1 — Song Player with YouTube embed + synced chord strip
- F2 — Guitar Tuner (mic + Pitchy)
- F3 — Chord Finder (search + SVG diagrams)

## v2.1 Features

### F4 — Neck-Visualization Play-Along *(this sprint, 2 days)*
**User story:** As Riya, I open a song, press play, and see a guitar neck where the correct fret positions light up in time with the song. I don't have to remember what "Cadd9" looks like — my eyes go to the glowing dots and my fingers follow.

**Acceptance:**
- `/play/:songId` renders a horizontal fretboard above the existing chord strip on desktop (≥641 px); rotates to vertical on mobile (≤640 px).
- Active chord: fretted positions render as solid dots with finger numbers inside; muted strings show "×" left of the nut; open strings show "○".
- Barres render as a single rounded bar across the fret, not as discrete dots.
- **Next chord ghost:** upcoming chord fades in at `T − 0.5 s` at 40 % opacity, cross-fades to 100 % at `T`, current chord fades out at `T + 0.2 s`.
- Fret window auto-fits the song's chord set with a minimum of 0–5; expands up to 0–12 if a shape needs it. Window is computed once per song load.
- Active chord name floats above the nut; optional `lyric` line sits under the fretboard (existing `ChordHit.lyric` field — no schema change).
- Stays in lockstep with the existing chord strip (same `useActiveChord` source of truth); seeking the video updates both.
- `prefers-reduced-motion: reduce` → instant swap, no cross-fade.
- Accessibility: `role="img"` with `aria-label` describing the active chord (e.g. "G major: 3rd fret low E, 2nd fret A, open D G B, 3rd fret high E").
- No regression on LCP, TBT, or bundle budget (see TRD §Browser Compatibility).

**Success metric delta (measured 2 weeks post-ship):**
- "Pressed play and stayed ≥60 s" rate lifts from MVP baseline by **≥10 percentage points**. (Hypothesis: visual chord shapes reduce "I bailed because I couldn't keep up" drop-off.)
- ≥3 of 5 retested guitarists say the fretboard view is "the reason I'd come back."

**Kill criteria:** if the 60 s rate does not lift by ≥3 pp after 2 weeks, the feature is cosmetic — freeze it, move to Roadmap #2 (Chord Trainer).

## Out of Scope (v2.1)
| Cut | Why |
|---|---|
| 3D fretboard (react-three-fiber) | Bundle cost outweighs the wow delta at this stage; revisit in v3 if metrics justify. |
| Animated strumming hand | Scope creep; distracts from the fret dots that matter. |
| Auto fret-window expansion mid-song | Jarring; compute once per song. |
| Left-handed mirroring | v2.2 — one-line flip, defer until asked. |
| Multiple chord voicings per name | Use `positions[0]` only; picker is v2.2. |
| Chord Trainer, Library expansion, Mono validation | Roadmap #2–#4; sequenced after this lands. |

## Dependencies
- Stable MVP Song Player (shipped in commit `66cbbc2`).
- Existing `ChordShape.positions[0]` data is sufficient; no data re-authoring required.
