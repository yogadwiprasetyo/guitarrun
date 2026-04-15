# 08 — Design Options

Three directions for the v2 redesign of GuitarRun. Each is implemented as a fully styled, interactive mockup at `/design/<option>` in the dev app. Production routes are untouched.

| Option | Route | Vibe |
|---|---|---|
| A — Minimal & Clean | `/design/minimal` | Editorial. Calm. Serif-led. |
| B — Dark & Immersive (Studio) | `/design/studio` | DAW-inspired. Mono readouts. Glow. |
| C — Playful & Approachable | `/design/playful` | Sticker chords. Bouncy. Friendly. |

Compare them all at `/design`.

---

## Option A — Minimal & Clean

### Thesis

A guitar app for the reader. Treats the music stand like a magazine spread — generous whitespace, a serif voice, one warm accent. Aimed at the player who already has muscle memory and just wants chord names readable from arm's length without visual noise. Trade-off: less immediately exciting on first load; rewards repeat use.

### Palette

| Token | Hex | Role |
|---|---|---|
| `bg` | `#F5F1EA` | Page surface (warm near-white) |
| `surface` | `#FBF8F2` | Card / inset surface |
| `ink` | `#15110D` | Body text, rules |
| `ink-60` | `#5C544B` | Secondary text |
| `ink-40` | `#8C857A` | Tertiary / labels |
| `ink-20` | `#D8D2C7` | Hairline rules |
| `accent` | `#C2553B` | Single warm coral, used for now-playing, in-progress, focus |

### Typography

- Display: **Source Serif 4** (italic for editorial flourishes; semibold for headlines)
- Body / UI: **Inter**
- Numerics: tabular Inter (`font-variant-numeric: tabular-nums`)
- Type scale: 11 / 13 / 15 / 17 / 22 / 38 / clamp(44, 6vw, 76) / clamp(120, 22vw, 220)

### Component notes

- **Chord diagram**: existing SVG, ink dots on cream, no decoration. Big serif chord name above.
- **Tuner**: massive serif note name (the largest type on the page), thin needle on a horizontal scale, single coral accent for offset. No glow.
- **Lyric/chord strip**: vertical list, hairline rules, italic lyrics, bold chord, faded inactive rows.
- **YouTube embed**: bordered cream surface with a thin-line circular play button. No drop shadows.

### Responsive

Mobile-first. At 375px the player view stacks (`Now` card on top, video below). Single-column at <880px. Aside collapses under main column. Type clamps via `clamp()` so the hero note in tuner stays usable on small phones.

### Micro-interactions

- Tab underline shifts on hover (160ms ease)
- Active chord color shift only — no scale
- Search input: caret + bottom-rule color shift on focus
- No motion on mount

### A11y

- Body 17px, never below 13px for non-secondary text
- Coral on cream: contrast 4.6:1 (passes AA for body)
- Ink on cream: 13.4:1
- Tap targets ≥44px (string-buttons in tuner are 52px wide)
- Focus ring inherited from existing `:focus-visible` (2px coral, 2px offset)

### Core scenario — guitar in hand, phone propped up

Single coral accent + giant chord card means the player can scan from across the room. Italic lyric prevents lyric/chord confusion. Lowest visual fatigue of the three.

### Best for / trade-off

- **Best for**: regular practice; people who already know chords and want a clean teleprompter.
- **Trade-off**: looks "quiet" in screenshots / on social. Fewer sticky moments for first-timers.

---

## Option B — Dark & Immersive (Studio)

### Thesis

GuitarRun positioned as a tiny DAW. Borrowed visual cues from Logic / Ableton / amp sims: dark layered panels, monospace readouts, segmented LED tuner, glowing fingerboard. Aimed at the user who self-IDs as a hobbyist musician and likes *looking* like one. Trade-off: dark UI is harder in bright daylight (a real concern on a phone propped up by a window).

### Palette

| Token | Hex | Role |
|---|---|---|
| `bg` | `#0A0B0E` | Page surface |
| `panel` | `#13151B` | Card surface |
| `panel-hi` | `#1A1D25` | Top of card (gradient highlight) |
| `rule` | `#262A34` | 1px hairline |
| `text` | `#E6E8EE` | Body |
| `text-dim` | `#8A91A1` | Secondary |
| `amber` | `#FFB020` | Active / play / "now" accent |
| `cyan` | `#22D3EE` | Playhead, status indicator |
| `red` | `#F25A4D` | Out-of-range tuner segments |

### Typography

- UI / display: **Inter** (semibold)
- Readouts (Hz, cents, BPM, timestamps): **JetBrains Mono** (fallback IBM Plex Mono, SF Mono)
- Type scale: 9 / 11 / 12 / 14 / 16 / 24 / 56 / 96 / clamp(120, 18vw, 200)

### Component notes

- **Chord diagram**: redrawn fretboard with dark wood gradient, amber dots with radial glow, base fret indicated with mono labels.
- **Tuner**: 41-segment LED bar (green within ±5¢, amber within ±20¢, red beyond), glow proportional to lit state.
- **Lyric/chord strip**: 8-up grid timeline panel; past = cyan tint, active = amber-glowing card, future = neutral panel.
- **YouTube embed**: black surface, amber play button with inner+outer glow, mono telemetry overlay (resolution / fps).
- **Waveform progress**: SVG bar chart with cyan playhead casting a 0 0 8px shadow.

### Responsive

Two-column at ≥900px (main + 320px aside); collapses to single column on mobile. Three-column chord inspector becomes single-column at ≤1024px. LED segments naturally scale.

### Micro-interactions

- Tab pill: inset shadow + amber glow on active
- Buttons: 140ms color/glow transition
- LED meter: discrete jumps, no easing (feels "real")
- Cyan playhead pulses subtly (visible focus state)

### A11y

- All text ≥11px on dark; main UI text 12–14px mono
- Amber on `#0A0B0E`: 8.7:1; Cyan on `#0A0B0E`: 11.4:1
- Color is never the only signal — labels accompany the LED meter ("−50¢ / 0 / +50¢")
- Tap targets: string buttons are 44px tall
- Reduce motion respected: glow opacity is static, no animated shimmer

### Core scenario

Looks fantastic on a propped phone in a dimly lit room. The amber-glowing chord card is unmissable. In bright sunlight the dark surface can wash out — recommend an in-app brightness/contrast toggle if this direction wins.

### Best for / trade-off

- **Best for**: evening practice; users who want the app to feel "serious"; demos and screenshots.
- **Trade-off**: daylight legibility; some chord-finder learners may find dense spec panels intimidating.

---

## Option C — Playful & Approachable

### Thesis

A guitar app that lowers the barrier to picking up the instrument. Sticker-card chords, rubbery buttons, hand-drawn sparkles, and a loud "in tune!" celebration. Aimed at hesitant beginners and lapsed players. Trade-off: the personality is loud and not for everyone — risks looking like a kids' app to a serious hobbyist.

### Palette

| Token | Hex | Role |
|---|---|---|
| `cream` | `#FFF7E8` | Page surface |
| `cream-hi` | `#FFFDF7` | Card surface |
| `ink` | `#23202B` | Outlines + body text |
| `mint` | `#A8E6C8` | Success / "in tune" |
| `peach` | `#FFB59A` | Now-playing / primary action |
| `sky` | `#A8D2FF` | Up-next / cool secondary |
| `lemon` | `#FFE16A` | Highlight / sparkle / CTA |

### Typography

- Display: **Nunito 900** (extra bold, rounded)
- Body: **Nunito 700**
- Numerics: Nunito 800 with tabular nums
- Type scale: 11 / 13 / 14 / 17 / 24 / 36 / 48 / 76 / clamp(140, 22vw, 220)

### Component notes

- **Chord diagram**: same SVG, but presented inside a colored sticker card with `2.5px` ink outline and a `4px 4px 0` ink shadow.
- **Tuner**: large mint card, lemon "in tune!" sticker badge with rotation, springy circular indicator on a chunky bar (`cubic-bezier(0.34, 1.56, 0.64, 1)`).
- **Lyric/chord strip**: stacked sticker rows with slight rotation per row (±0.5°); active row gets lemon background.
- **YouTube embed**: peach-to-sky radial gradient inside a hard-shadow ink frame; lemon play button with thick ink outline.
- **Sparkles**: hand-drawn SVG four-point stars (NOT emoji), placed at fixed positions on the page background.

### Responsive

Mobile-first. Sticker cards stack at <880px; chord library uses `auto-fill, minmax(140px, 1fr)` so it reflows to 2 cards across at 375px. Page padding stays 24px on phone for thumb reach.

### Micro-interactions

- Sticker buttons: `translate(-2px, -2px)` + shadow grows on active (gives "press" feel)
- Tab pills: same press-down behavior on selection
- In-tune state: lemon badge appears with rotation (no confetti, no emoji)
- Chord cards in library: rotate ±0.6° at rest, snap to ±1° + bigger shadow on selection
- All transitions use spring easing (0.34, 1.56, 0.64, 1)

### A11y

- Body 14–17px, headlines never below 14px
- Ink on every accent: ≥10:1 (ink is `#23202B`, all surfaces are light)
- Outline is always 2.5px ink — no thin pastel-only borders
- Sparkles are `aria-hidden` decorations, not buttons
- Active states use color AND transform AND elevated shadow (not color alone)
- Tap targets ≥44px (sticker buttons are 48–56px tall)

### Core scenario

The peach "play this now" sticker is the loudest object on the page when a chord is active — visible across the room, hard to miss mid-strum. The "in tune!" badge gives positive feedback that survives glancing away and back.

### Best for / trade-off

- **Best for**: beginners; reactivating lapsed players; landing-page screenshots; word-of-mouth ("look at this cute thing").
- **Trade-off**: power users may find the personality too loud; harder to layer dense information into without losing the vibe.

---

## How to choose

| If the v2 thesis is… | Pick |
|---|---|
| "Serious tool casual users will respect" | A |
| "Feels like a real piece of music software" | B |
| "Lowers the bar — first-timers actually press play" | C |

A is the safest baseline and easiest to extend. B is the highest ceiling for visual polish but the riskiest in daylight. C is the most differentiated and most likely to be screenshotted, but the hardest to scale into power-user features.

Recommended next step: pick a direction, then re-render the existing production routes (`/`, `/play/:songId`, `/tuner`, `/chords`) using its tokens. The mockups at `/design/*` already cover all three core surfaces; the production code can be migrated incrementally.
