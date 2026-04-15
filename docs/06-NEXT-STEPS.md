# Next Steps — Post-v3 P2

Updated 2026-04-15.

v2.x done; v3 P1 (URL ingestion + difficulty) and P2 (live chord validation) shipped; v3 P3 architecture documented and stubbed in `lib/extract.ts`. Pending decisions: backend hosting model, API budget, legal sign-off (see `docs/09-V3-PHASE-3-EXTRACTION.md`).

## Stop, measure, decide

For the next 2 weeks:

1. **Don't ship features.** Watch metrics in `docs/01-PRD.md §Success Metrics`.
2. **Talk to 5 real guitarists.** Record whether they:
   - Press play and stay ≥60 s on a song.
   - Open the Trainer at all, and if so, complete a drill.
   - Notice the fretboard hero or just keep using the chord strip.
   - Ask for chord validation, tabs, or accounts.
3. **Cut, don't add.** If a feature has no users in 2 weeks, mark it for removal in v3.

## When to wake up dev again

| Signal | Then do |
|---|---|
| 60 s play-rate lifts ≥ 3 pp post-v2.1 | Confirm hypothesis; consider iterating Trainer next. |
| Trainer used by ≥ 25 % of sessions | Add audio validation (Roadmap #4 — 3-day R&D scope). |
| ≥ 3 users explicitly request mid-song chord validation | Scope #4 → #7 progression. |
| ≥ 1 community song PR submitted | The contribution flow works; promote it on the Home page. |
| Users return ≥ 3 sessions in a week (Plausible repeat-visitor rate) | Start #8 accounts (localStorage first). |
| 60 s play-rate < 12 % | Core loop broken. Re-do the player UX before anything else. |

## Backlog

### v3 P3 backend (gated on user decisions)
1. Pick hosting (Modal / Replicate / Render — Vercel functions can't run yt-dlp + Demucs).
2. Confirm legal pattern for cached audio.
3. Implement `/api/extract` per `docs/09-V3-PHASE-3-EXTRACTION.md` stages 3.1 → 3.5.
4. Switch `lib/extract.ts:fetchExtractedSong` from stub to real fetch+poll.

### v3 P4 chord substitution (gated on signal)
- Build `lib/difficulty.ts` simplifyChord(name, mode) — barre→open variants.
- Maps F→Fmaj7, Bm→Em7, etc. for Beginner mode.
- Rewires PlayPage `mode` selector to actually re-render shapes.

### v2.5.1 polish (low-risk; do during downtime)
- `?edit=1` clipboard timing helper (lowers contribution friction).
- Lighthouse CI on every Vercel preview.
- Playwright visual-regression baselines for `/play/:songId` at 375/768/1280.
- Fix pre-existing axe-core color-contrast violations on eyebrow text + nav `text-ink-40`.
- Trainer keyboard shortcuts (space = tap tempo, esc = stop).

### v3 candidates (gated on signal)
- **#4** Mono chord validation in silent drill (3 d).
- **#5b** Acoustic BPM detection (4 d).
- **#7** Polyphonic chord validation vs. backing track (3+ weeks R&D).
- **#8** Accounts + saved progress (5 d).
- 3D fretboard (`react-three-fiber`) — only if 60 s rate plateaus.
- Multi-voicing chord picker — only if users ask.
- Left-handed flip — one-line; ship when one user asks.

## Tripwires

- v3 feature overruns budget by >50 % → cut, ship what works.
- Bundle exceeds 200 KB gzipped → audit + remove a dep.
- Any new dep adds >30 KB gzipped → fork the bits into `lib/`.
