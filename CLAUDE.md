# CLAUDE.md — GuitarRun

## What this is
Client-only web app that helps a casual guitarist play along to curated YouTube songs, tune their guitar, look up chord shapes, and run chord-switch drills. Started as a 1-day MVP; v2.x added the neck-visualization fretboard, library filter, chord trainer, tap tempo, and a community contribution flow.

Canonical docs (always re-read at session start):
- `docs/01-PRD.md` — user, problem, shipped features, scope, success metrics
- `docs/02-TRD.md` — stack, module map, data model, perf budgets, risks
- `.claude/skill/SKILL.md` — build order, file layout, per-feature patterns, subagent cheat-sheet
- `docs/05-ROADMAP.md` — status of all roadmap items (shipped vs. deferred)
- `docs/06-NEXT-STEPS.md` — measure-then-decide playbook + v2.5.1 backlog
- `docs/07-DEPLOY.md` — hosting, monitoring, rollback
- `docs/08-CONTRIBUTING.md` — how to add a song / chord shape (Roadmap #6)

## Goals
1. **Shipped:** live public URL with MVP + v2.x features.
2. **In progress:** validate that casual guitarists press play and stay ≥60 s; that the fretboard hero lifts that rate; that the trainer is used.
3. Keep the codebase small enough that any future v3 feature is a few hours, not a few days.

## Non-goals
- Auto chord detection from arbitrary YouTube audio (Roadmap #7, R&D-gated).
- Real-time polyphonic chord validation against mixed audio (Roadmap #7).
- Monophonic chord validation in silent drill (Roadmap #4, deferred — no demand yet).
- User accounts, subscriptions, or any backend (Roadmap #8, retention-gated).
- Feature parity with Ultimate Guitar, Chordify, Songsterr.
- "Learn guitar from zero" curriculum.

## Key Architectural Decisions

| # | Decision | Why |
|---|---|---|
| 1 | **Static SPA, no backend** | 1-day scope. No auth, no DB, no server = no ops. |
| 2 | **Curated JSON song library (15 songs)** over auto-ingestion | Sidesteps ML + YouTube ToS. Ships *today*. |
| 3 | **YouTube IFrame API for playback, not audio extraction** | Legal, free, zero-maintenance. |
| 4 | **Pitchy (McLeod Pitch Method) for tuner** | Monophonic pitch detection is solved; lib is ~1KB. |
| 5 | **React + Vite + Tailwind** | Fastest solo-dev loop. No Next.js — no SSR requirement. |
| 6 | **No state management library** | Three isolated routes. React state + URL params is enough. |
| 7 | **Manual chord timing, not auto beat tracking** | Accuracy > coverage for 15 songs. |

## Known Pitfalls (read before coding)

1. **iOS Safari mic requires a user gesture.** `AudioContext.resume()` must run *inside* a click handler, not on mount. Always show a "Tap to start" button for the tuner.
2. **YouTube embed disabled per-video.** Some music videos block embed. Test each `youtubeId` in a private window before adding to `songs.json`.
3. **Autoplay is blocked by default on mobile.** The user presses play. Never assume autoplay.
4. **`setInterval` drifts across tabs.** Use `requestAnimationFrame` (or 250 ms poll + binary search over timeline) so re-focus doesn't show stale chord.
5. **Pitchy reports garbage on silence.** Gate UI updates by `clarity > 0.9`.
6. **Never animate `scrollLeft` or `width` for the chord strip.** Use `transform: translateX()` on a flex row — GPU-composited, no mobile jank.
7. **Do not ship `@tombatossals/chords-db` whole** (~500 KB). Import, filter to the 80 shapes you need, write to `chords.json`, remove the dependency.
8. **Avoid `any`.** Strict TypeScript. Add a typed wrapper in `lib/` if you need an escape hatch.

## Workflow Preferences

- **Re-read canonical docs at session start.** Anything in `docs/` is the source of truth, not session memory.
- **Commit cadence:** one focused commit per feature milestone. Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`.
- **Push directly to `main`.** No PRs required — current authorization (see workflow notes in v2.x sessions).
- **Don't refactor mid-feature.** Get it working, land it, then clean.
- **Test manually with a real guitar + a real phone** before calling a player-facing feature "done." No guitar nearby = note it as pending.
- **Cut scope past 50 % estimate overrun.** Thesis is "ship a working slice." Scope > polish.
- **Update PRD, TRD, NEXT-STEPS, SKILL.md, CLAUDE.md inline with each feature ship.** Docs drift = future-you lost.

## Project-Specific Rules

- **No runtime secrets.** Static build only. Analytics/Sentry keys are build-time envs set in Vercel dashboard, not committed.
- **No `console.log` in committed code.** Remove or wrap in `if (import.meta.env.DEV)`.
- **No external fetches in MVP** (songs/chords are bundled JSON). If you feel the urge to `fetch()` something, stop and ask why.
- **Accessibility baseline:** keyboard-navigable, focus visible, alt text on icons, `aria-label` on mic/tuner controls.
- **Mobile-first CSS.** Start at 375px and scale up.
- **If a change adds >200 lines of net code outside the planned scope, stop and re-plan.**

## When in doubt
Re-read `docs/01-PRD.md` "Out of Scope" before adding anything. The whole plan is built around saying no to the hard stuff for one more week.
