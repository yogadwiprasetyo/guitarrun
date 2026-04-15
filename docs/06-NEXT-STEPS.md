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

### v3.1 follow-ups (queued — implement after the 24h YouTube quota window resets and the last 3 placeholders resolve)

Two issues observed on `/play/lovely-billie-eilish` (and likely all 98 imported songs):

**1. Fretboard too small / dots overlap** — `220px` container height with 4–6 frets visible compresses each slot to ~36 px short-axis × ~75 px long-axis. `computeDotRadius` floors at 6 px but the visual ratio still feels cramped, finger-number text overlaps the dot edge, and inlay markers blur into string lines.
   - Bump `Fretboard` container height on PlayPage from 220 → ~280 px desktop, ~480 px vertical mobile.
   - In `computeDotRadius`: raise the multiplier from `0.32` to `0.38`; raise the floor from 6 to 9 px.
   - Increase nut line stroke from 3 to 4; inlay radius `0.15` → `0.2`.
   - Re-snapshot Wonderwall + Lovely + a barre chord (F) at desktop 1280 and mobile 375 to confirm.

**2. Chord display "stops" mid-song** — the imported contributor timelines only have 4 hits at `t=0/4/8/12` (16 s total) per song. Every 100-song import ends after 16 s while the YouTube video plays on for 3+ min; `activeChordAt` correctly returns the last hit forever, so the user sees the highlight freeze on the final chord.
   - **Root cause:** data quality, not a sync bug.
   - **Quick fix (no backend):** `lib/songs.ts` adds `expandLoopingTimeline(song, durationSeconds, bpm)` that detects timelines shorter than the song and loops the chord progression at one-bar intervals (`60/bpm * 4` seconds per cycle) up to `durationSeconds`. Apply at PlayPage render time; tag songs `looped-timeline` so we know they're synthetic.
   - **Need video duration** — fetch via YouTube Data API `videos.list?id=<id>&part=contentDetails` (1 quota unit per call, vs. 100 for `search.list`); cache the duration into the song record so we only fetch once. Extend `scripts/yt-resolve.mjs` to also fetch + persist `durationSeconds` on each newly-resolved song.
   - **Long-term fix:** v3 P3.3 Chordino backend produces real per-second chord timelines. Once deployed, `looped-timeline` entries get reprocessed and the synthetic loop is dropped.
   - **Acceptance:** play any imported song past 16 s and the chord progression keeps cycling on-tempo; chord strip auto-scrolls; Fretboard cross-fades on each loop boundary.

### v3 P3.1 deploy (one-time, then live)
1. `pip install modal && modal token new`
2. `modal deploy backend/modal_app.py` — note the printed endpoint URL.
3. Modal workspace → Settings → Billing → set Spend cap to **$200**.
4. Vercel project → Environment Variables → add `VITE_EXTRACT_API_URL` = the endpoint URL.
5. Redeploy Vercel; smoke-test by pasting any non-curated YouTube URL on `/`.
6. Get the one-page legal sign-off on cached-derivative-only pattern (`backend/README.md`).

### v3 P3.3+ (model upgrades, optional)
- 3.3: Replace librosa template-match with Chordino or crema-py for sharper chord recognition.
- 3.4: Whisper API for synced lyrics.
- 3.5: "Report a wrong chord" UI feeding a quality flag in the Dict.

### v3 P4 chord substitution — **shipped**
`lib/difficulty.ts` + PlayPage rewiring landed. Beginner/Intermediate substitutions visible in the header hint. Add user-tunable substitutions later if community asks.

### v2.5.1 polish — partly shipped
- ✅ `?edit=1` clipboard timing helper (PlayPage edit-mode panel)
- ✅ Trainer keyboard shortcut (Esc = stop)
- ⏳ Lighthouse CI on every Vercel preview
- ⏳ Playwright visual-regression baselines for `/play/:songId` at 375/768/1280
- ⏳ Fix pre-existing axe-core color-contrast violations on eyebrow text + nav `text-ink-40` (design call)

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
