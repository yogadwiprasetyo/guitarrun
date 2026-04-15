# CLAUDE.md — GuitarRun

## What this is
A 1-day MVP of a client-only web app that helps a casual guitarist play along to curated YouTube songs, tune their guitar, and look up chord shapes.

Canonical docs:
- `docs/01-PRD.md` — user, problem, features, scope
- `docs/02-TRD.md` — stack, architecture, data, risks
- `SKILL.md` — build order, file layout, checklists
- `docs/05-ROADMAP.md` — v2 features
- `docs/06-NEXT-STEPS.md` — hour-by-hour plan
- `docs/07-DEPLOY.md` — hosting, monitoring, rollback

## Goals
1. Ship a live, public URL in one working day.
2. Validate that casual guitarists will actually press play and stay ≥60 s.
3. Keep the codebase small enough that a v2 feature is a few hours, not a few days.

## Non-goals
- Auto chord detection from arbitrary YouTube audio (v2+).
- Real-time polyphonic chord validation against mixed audio (research problem).
- User accounts, subscriptions, or any backend.
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

- **Build order is non-negotiable:** scaffold → chord finder → tuner → player → home → deploy. Each step feeds the next.
- **Ship early, iterate.** Deploy a "hello world" to Vercel in the first hour. Every subsequent push goes to a preview URL.
- **Commit cadence:** one commit per feature milestone (per `SKILL.md` step). Conventional commits: `feat:`, `fix:`, `chore:`.
- **Don't refactor mid-feature.** Get it working, land it, then clean.
- **Test manually with a real guitar + a real phone** before calling a feature "done." No guitar nearby = feature not done.
- **Whenever a feature risks stalling >30 min past estimate, cut it.** Thesis is "ship today." Scope > polish.

## Project-Specific Rules

- **No runtime secrets.** Static build only. Analytics/Sentry keys are build-time envs set in Vercel dashboard, not committed.
- **No `console.log` in committed code.** Remove or wrap in `if (import.meta.env.DEV)`.
- **No external fetches in MVP** (songs/chords are bundled JSON). If you feel the urge to `fetch()` something, stop and ask why.
- **Accessibility baseline:** keyboard-navigable, focus visible, alt text on icons, `aria-label` on mic/tuner controls.
- **Mobile-first CSS.** Start at 375px and scale up.
- **If a change adds >200 lines of net code outside the planned scope, stop and re-plan.**

## When in doubt
Re-read `docs/01-PRD.md` "Out of Scope" before adding anything. The whole plan is built around saying no to the hard stuff for one more week.
