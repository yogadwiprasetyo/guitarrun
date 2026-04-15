# PRD — GuitarRun MVP

## Persona
**Riya, 24, casual guitarist.** Owns an acoustic, knows 6–8 open chords (G, C, D, Em, Am, E, A, Dm). Hears a song on Spotify/YouTube and wants to play along in under 5 minutes. Bounces from Ultimate Guitar because of ads, broken auto-scroll, and tuner apps living in a separate tab.

## Problem
Learning a new song requires juggling 3 tools: YouTube (to hear it), a tab site (to see chords), and a tuner app (to tune up). Nothing syncs. Nothing is designed for "play this song right now."

## MVP Features (ship in 1 day)

### F1 — Song Player (Hero)
**User story:** As Riya, I pick a song from a curated list, see chords scroll in time with the YouTube video, and play along.
**Acceptance:**
- Home screen lists ≥15 beginner-friendly songs (title, artist, chords used, difficulty).
- Clicking a song loads a play page with embedded YouTube player + chord timeline below.
- Chord timeline auto-scrolls synced to video currentTime; the active chord is visually highlighted with its fretboard diagram.
- Play/pause/seek in YouTube stays in sync with the chord display.
- Works on desktop Chrome/Safari at 1280×800 and mobile Safari at 375px.

### F2 — Guitar Tuner
**User story:** As Riya, I tap "Tuner," grant mic access, pluck a string, and see whether I'm flat/sharp on EADGBE.
**Acceptance:**
- Detects pitch from mic with ±3 cents accuracy for a cleanly plucked string in a quiet room.
- Shows detected note, target note (nearest of EADGBE), and a needle/meter (±50 cents range).
- Turns green within ±5 cents of target.
- Handles mic-denied state with a clear CTA to retry.

### F3 — Chord Finder
**User story:** As Riya, I search for a chord name ("Cmaj7") and see a fretboard diagram with finger positions.
**Acceptance:**
- Search input with live fuzzy match against a library of ≥80 chords (major, minor, 7, maj7, m7, sus2/sus4 across 12 roots).
- Results render an SVG fretboard diagram with finger numbers, muted strings (×), and open strings (o).
- Clicking a chord opens a larger view with the chord name and notes spelled out.

## Out of Scope (explicit)
| Cut | Why |
|---|---|
| User accounts / saved progress | No backend; localStorage is enough for a 1-day MVP. |
| Auto chord detection from arbitrary YouTube URL | 6-month ML problem. Competes with Chordify. Validate demand first. |
| Real-time mic chord validation while song plays | Polyphonic pitch + source separation — research problem. |
| Auto BPM / beat tracking | Songs are manually timed in MVP JSON. |
| Chord trainer drills | Non-core for 1-day scope; v2. |
| Play-along neck-visualization background | Nice-to-have polish; v2. |
| User-submitted songs | Moderation burden; v2. |

## Success Metrics (first 2 weeks post-launch)
- **Activation:** ≥40% of landing-page visitors click into a song.
- **Core action:** ≥25% of song-page visitors press play AND stay ≥60s (proxy for "played along").
- **Tool use:** ≥15% of sessions open the tuner.
- **Qualitative:** 5 real guitarists tested in person; ≥3 say "I'd use this."

**Kill criteria:** if <10% of visitors press play on a song, the hero experience is wrong — don't add features, fix the core loop.
