# Contributing — Add a Song to GuitarRun

Roadmap #6: community submissions via PR. No backend, no auth, no moderation queue — every song lands through GitHub review.

## Before you start

- Working local checkout (see `README.md`).
- A YouTube ID that is **embeddable** (test in incognito; some music videos disallow embed and silently fail).
- Ears + a guitar to hand-time chord changes.

## 1. Pick the song

Beginner-friendly first. Open chords or simple barres only. Avoid uploads whose embed is blocked (live performances are usually safer than VEVO).

**Verify embed:**
1. Open a private/incognito window.
2. Paste `https://www.youtube.com/embed/<youtubeId>`.
3. If it plays, embedding is allowed. If you see "Video unavailable", **pick a different upload of the same song.**

## 2. Time the chord hits

The MVP times songs by hand. There is no auto beat-tracker yet (Roadmap #5b).

1. Open the YouTube video; find the timestamp of every chord change.
2. For each change, record `{ t: <seconds>, chord: <ChordName> }`. `t` is a float in seconds from video start.
3. Optionally include `lyric` (shown under the chord on `/play/:songId`).
4. Aim for ≤4 hits per bar; over-timing makes the strip jittery.

A `?edit=1` clipboard timing helper is on the v2.5.1 backlog. Until then, scrub manually.

## 3. Add the entry

Edit `src/data/songs.json`. Append an entry that matches the `Song` schema:

```jsonc
{
  "id": "kebab-case-id",
  "title": "Song Title",
  "artist": "Artist Name",
  "youtubeId": "abcDEF12345",
  "difficulty": "beginner",          // or "intermediate" | "advanced"
  "chordsUsed": ["G", "C", "D"],
  "bpm": 88,
  "decade": "70s",
  "tags": ["folk", "easy"],
  "timeline": [
    { "t": 0,    "chord": "G", "lyric": "First line" },
    { "t": 2.4,  "chord": "C" },
    { "t": 4.8,  "chord": "D" }
  ]
}
```

Rules:
- Every chord in `chordsUsed` and `timeline[].chord` must exist in `src/data/chords.json`.
- `timeline` sorted ascending by `t`.
- Real timestamps, not estimates.
- No duplicate `id`s.

## 4. Adding a missing chord

Append to `src/data/chords.json`:

```jsonc
{
  "name": "Cmaj9",
  "notes": ["C","E","G","B","D"],
  "positions": [
    {
      "frets":   [-1, 3, 2, 0, 0, 0],
      "fingers": [0,  3, 2, 0, 0, 0],
      "barres":  [],
      "baseFret": 1
    }
  ]
}
```

Only ship `positions[0]` for v2.x. Multi-voicing is later.

## 5. Verify locally

```bash
npm test              # unit tests
npx tsc --noEmit      # type check
npm run dev           # smoke test at /play/<id>
```

Confirm by hand:
- Video plays (embed not blocked).
- Chord strip + fretboard line up with the music; no chord lags >250 ms.
- Home filter shows your song under the right decade.

## 6. Submit a PR

```
title: feat(songs): add <Title> by <Artist>
body:
- youtubeId verified embeddable in incognito
- timeline hand-timed at <bpm> bpm
- chord set: G, C, D, Em
- decade: 70s
```

Maintainer reviews timing accuracy and merges. Review is the gate; no CI for song correctness.

## Out of scope

- Tabs, scales, or solos (v3).
- Auto-detected chords (Roadmap #7, R&D).
- Web-form submission (no backend).
