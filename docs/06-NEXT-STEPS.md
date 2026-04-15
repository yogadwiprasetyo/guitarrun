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
