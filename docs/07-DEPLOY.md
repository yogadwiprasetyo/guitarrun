# Deployment Plan — GuitarRun MVP

## Hosting

**Vercel (free tier).** Chosen over Netlify for:
- Instant GitHub integration with per-PR preview URLs.
- Edge CDN + HTTPS by default.
- Generous free bandwidth; no surprise bill at MVP traffic.

**Fallback:** GitHub Pages — if Vercel deploy fails in the last hour of build day.

## Build & Deployment Pipeline

```
GitHub main  ──►  Vercel build hook
                  ├─ pnpm install
                  ├─ pnpm build   (Vite → dist/)
                  └─ Deploy to prod alias

GitHub feature/*  ──►  Vercel preview URL per branch
```

- **Build command:** `pnpm build`
- **Output directory:** `dist/`
- **Node version:** pinned in `.nvmrc` (20.x); mirrored in `package.json#engines`.
- **Env vars (Vercel dashboard, not committed):**
  - `VITE_PLAUSIBLE_DOMAIN`
  - `VITE_SENTRY_DSN`
- **Production branch:** `main`. Every push = production deploy.
- **Preview:** every non-main branch gets a preview URL. Share in PR for review.

## Domain & SEO Basics

- **Domain:** `guitarrun.app` (Cloudflare or Porkbun, $10–15/yr). Add under Vercel → Domains; Vercel issues SSL automatically.
- **Meta tags in `index.html`:**
  - `<title>GuitarRun — Play Any Song</title>`
  - `<meta name="description" content="Play along to songs you love. Free guitar practice with chord charts, tuner, and chord finder — no signup.">`
  - Open Graph: `og:title`, `og:description`, `og:image` (1200×630 PNG).
  - Twitter card: `summary_large_image`.
- **Favicons:** SVG primary, 32/180px PNG fallbacks.
- **`robots.txt`:** allow all.
- **`sitemap.xml`:** static; include `/`, `/tuner`, `/chords`, and one entry per song id. Regenerate at build time from `songs.json` via a small prebuild script.
- **Structured data:** JSON-LD `MusicComposition` per song page — helps long-tail searches like "wonderwall chords".
- **Performance = SEO:** hit the LCP/INP budgets in `docs/02-TRD.md`.
- **Referrer policy:** `<meta name="referrer" content="strict-origin-when-cross-origin">`.

## Post-Launch Monitoring

| Concern | Tool | Setup |
|---|---|---|
| Errors | **Sentry** (free, 5K events/mo) | `Sentry.init({ dsn, tracesSampleRate: 0.1, replaysSessionSampleRate: 0 })` in `main.tsx`. |
| Analytics | **Plausible** (paid $9/mo or self-host) | `<script>` in `index.html` wired to `VITE_PLAUSIBLE_DOMAIN`. |
| Uptime | **UptimeRobot** (free) | 5-minute HTTP check against `/`; email alerts. |
| Core Web Vitals | **Vercel Speed Insights** (free) | One click in Vercel dashboard. |

**What to watch in week 1:**
- Home → Play click-through rate (activation).
- Play-page median session duration (core action).
- Tuner open rate.
- Sentry: any recurring JS error; 5+ occurrences of the same error = fix within 24 h.
- Speed Insights: LCP, INP per route.

## Rollback Strategy

Vercel retains every production deployment. Rollback is one click.

**Manual rollback:**
1. Vercel dashboard → Deployments → find last green deployment.
2. `⋯` → **Promote to Production**.
3. ~5 seconds; CDN invalidates automatically.
4. Open an incident issue in GitHub noting the offending commit.

**Git-side rollback (if dashboard unavailable):**
```bash
git revert <bad-sha> && git push origin main
```
Vercel auto-deploys the revert.

**Guardrails:**
- No force-push to `main`.
- Never deploy Friday evening.
- Every release tag is annotated (`git tag -a v0.1.0 -m "MVP launch"`) so rollback targets are greppable.
- Sentry error-rate >2% of sessions in 15 min after a deploy = rollback first, diagnose after.
