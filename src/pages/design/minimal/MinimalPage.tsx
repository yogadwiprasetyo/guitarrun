import { useState } from 'react'
import { Link } from 'react-router-dom'
import ChordDiagram from '../../../components/ChordDiagram'
import {
  SAMPLE_SONG,
  SAMPLE_CHORDS,
  SAMPLE_ACTIVE_INDEX,
  SAMPLE_CURRENT_TIME,
  SAMPLE_DURATION,
  SAMPLE_TUNER,
  TAB_LABELS,
  formatTime,
  type DesignTab,
} from '../shared/sampleData'

const TOKENS = {
  bg: '#F5F1EA',
  surface: '#FBF8F2',
  ink: '#15110D',
  ink60: '#5C544B',
  ink40: '#8C857A',
  ink20: '#D8D2C7',
  accent: '#C2553B',
}

const SERIF =
  '"Source Serif 4", "Source Serif Pro", "Iowan Old Style", Georgia, "Times New Roman", serif'
const SANS = 'Inter, system-ui, sans-serif'

export default function MinimalPage() {
  const [tab, setTab] = useState<DesignTab>('player')

  return (
    <div
      style={{
        background: TOKENS.bg,
        color: TOKENS.ink,
        fontFamily: SANS,
        minHeight: 'calc(100vh - 56px)',
      }}
    >
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 96px' }}>
        <DesignHeader />
        <Tabs current={tab} onChange={setTab} />
        <div style={{ marginTop: 40 }}>
          {tab === 'player' && <PlayerView />}
          {tab === 'tuner' && <TunerView />}
          {tab === 'chords' && <ChordFinderView />}
        </div>
      </div>
    </div>
  )
}

function DesignHeader() {
  return (
    <header
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        paddingBottom: 28,
        borderBottom: `1px solid ${TOKENS.ink20}`,
      }}
    >
      <Link
        to="/design"
        style={{
          fontFamily: SANS,
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: TOKENS.ink60,
          textDecoration: 'none',
        }}
      >
        ← Back to design explorations
      </Link>
      <h1
        style={{
          fontFamily: SERIF,
          fontStyle: 'italic',
          fontWeight: 400,
          fontSize: 'clamp(38px, 6vw, 64px)',
          lineHeight: 1.05,
          letterSpacing: '-0.02em',
          margin: '6px 0 0',
        }}
      >
        Option A · <span style={{ fontStyle: 'normal', fontWeight: 600 }}>Minimal &amp; Clean</span>
      </h1>
      <p
        style={{
          fontFamily: SERIF,
          fontSize: 17,
          color: TOKENS.ink60,
          maxWidth: 580,
          margin: '4px 0 0',
          lineHeight: 1.45,
        }}
      >
        An editorial reading of a guitar app — generous whitespace, a serif voice, one warm
        accent. Built for the music stand.
      </p>
    </header>
  )
}

function Tabs({ current, onChange }: { current: DesignTab; onChange: (t: DesignTab) => void }) {
  const order: DesignTab[] = ['player', 'tuner', 'chords']
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 28,
        marginTop: 32,
        borderBottom: `1px solid ${TOKENS.ink20}`,
      }}
    >
      {order.map((t) => {
        const active = current === t
        return (
          <button
            key={t}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '14px 0',
              fontFamily: SERIF,
              fontStyle: 'italic',
              fontSize: 18,
              color: active ? TOKENS.ink : TOKENS.ink40,
              cursor: 'pointer',
              borderBottom: `2px solid ${active ? TOKENS.accent : 'transparent'}`,
              marginBottom: -1,
              transition: 'color 160ms ease, border-color 160ms ease',
            }}
          >
            {TAB_LABELS[t]}
          </button>
        )
      })}
    </div>
  )
}

function PlayerView() {
  const active = SAMPLE_SONG.timeline[SAMPLE_ACTIVE_INDEX]
  const next = SAMPLE_SONG.timeline[SAMPLE_ACTIVE_INDEX + 1]
  const next2 = SAMPLE_SONG.timeline[SAMPLE_ACTIVE_INDEX + 2]
  const progress = (SAMPLE_CURRENT_TIME / SAMPLE_DURATION) * 100

  return (
    <div className="min-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 5fr) minmax(0, 3fr)', gap: 56 }}>
      <style>{`@media (max-width: 880px) { .min-grid { grid-template-columns: 1fr !important; gap: 36px !important; } }`}</style>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKENS.accent }}>
            Now playing · {SAMPLE_SONG.bpm} bpm
          </span>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKENS.ink40 }}>
            Beginner
          </span>
        </div>
        <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(44px, 6vw, 76px)', lineHeight: 0.98, letterSpacing: '-0.025em', margin: '8px 0 4px' }}>
          Wonderwall
        </h2>
        <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 22, color: TOKENS.ink60, margin: 0 }}>
          Oasis, 1995
        </p>

        <div style={{ marginTop: 24, background: TOKENS.surface, border: `1px solid ${TOKENS.ink20}`, aspectRatio: '16 / 9', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 30%, rgba(194,85,59,0.08), transparent 60%), repeating-linear-gradient(45deg, rgba(21,17,13,0.02) 0 2px, transparent 2px 8px)' }} />
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 14, color: TOKENS.ink60, marginBottom: 6 }}>
              YouTube preview
            </div>
            <button type="button" aria-label="Play" style={{ width: 72, height: 72, borderRadius: '50%', border: `1px solid ${TOKENS.ink}`, background: 'transparent', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true">
                <path d="M0 0 L22 13 L0 26 Z" fill={TOKENS.ink} />
              </svg>
            </button>
          </div>
        </div>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: SANS, fontVariantNumeric: 'tabular-nums', fontSize: 13, color: TOKENS.ink60 }}>
            {formatTime(SAMPLE_CURRENT_TIME)}
          </span>
          <div style={{ flex: 1, height: 1, background: TOKENS.ink20, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: -1, height: 3, width: `${progress}%`, background: TOKENS.accent }} />
            <div style={{ position: 'absolute', left: `calc(${progress}% - 4px)`, top: -3, width: 8, height: 8, borderRadius: '50%', background: TOKENS.accent }} />
          </div>
          <span style={{ fontFamily: SANS, fontVariantNumeric: 'tabular-nums', fontSize: 13, color: TOKENS.ink60 }}>
            {formatTime(SAMPLE_DURATION)}
          </span>
        </div>
      </div>

      <aside>
        <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKENS.ink40, marginBottom: 16 }}>
          On the next bar
        </div>

        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.ink20}`, padding: '32px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: TOKENS.accent, marginBottom: 8 }}>
            Now
          </div>
          <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 96, lineHeight: 1, letterSpacing: '-0.04em' }}>
            {active.chord}
          </div>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 18, color: TOKENS.ink60, margin: '12px 0 24px', textAlign: 'center', maxWidth: 280 }}>
            {active.lyric ?? '— hold this shape —'}
          </p>

          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end' }}>
            {[next, next2].map((hit, i) => {
              if (!hit) return null
              const shape = SAMPLE_CHORDS.find((c) => c.name === hit.chord)
              return (
                <div key={i} style={{ textAlign: 'center', opacity: i === 0 ? 1 : 0.55 }}>
                  <div style={{ fontFamily: SANS, fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKENS.ink40, marginBottom: 4 }}>
                    {i === 0 ? 'Next' : 'Then'}
                  </div>
                  <div style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600 }}>{hit.chord}</div>
                  {shape && (
                    <div style={{ marginTop: 4 }}>
                      <ChordDiagram position={shape.positions[0]} size="sm" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKENS.ink40, marginBottom: 12 }}>
            Lyric scroll
          </div>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {SAMPLE_SONG.timeline.slice(Math.max(0, SAMPLE_ACTIVE_INDEX - 1), SAMPLE_ACTIVE_INDEX + 4).map((hit, i) => {
              const isActive = i === 1
              return (
                <li key={hit.t} style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '10px 0', borderTop: `1px solid ${TOKENS.ink20}`, opacity: isActive ? 1 : 0.55 }}>
                  <span style={{ fontFamily: SANS, fontVariantNumeric: 'tabular-nums', fontSize: 11, color: TOKENS.ink40, width: 40 }}>
                    {formatTime(hit.t)}
                  </span>
                  <span style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 17, width: 60, color: isActive ? TOKENS.accent : TOKENS.ink }}>
                    {hit.chord}
                  </span>
                  <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 16, color: TOKENS.ink60, flex: 1 }}>
                    {hit.lyric ?? '—'}
                  </span>
                </li>
              )
            })}
          </ol>
        </div>
      </aside>
    </div>
  )
}

function TunerView() {
  const { targetName, octave, hz, cents, targetHz } = SAMPLE_TUNER
  const offset = (cents / 50) * 220
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center', paddingTop: 24 }}>
      <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKENS.ink40 }}>
        Standard tuning · low E
      </div>
      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(120px, 22vw, 220px)', lineHeight: 0.92, letterSpacing: '-0.05em', margin: '12px 0 4px' }}>
        {targetName}
        <span style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: '0.32em', color: TOKENS.ink40, marginLeft: 12 }}>
          {octave}
        </span>
      </div>
      <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 22, color: TOKENS.ink60 }}>
        Detected {hz.toFixed(2)} Hz · target {targetHz.toFixed(2)} Hz
      </div>

      <div style={{ marginTop: 56, position: 'relative', height: 80 }}>
        <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: TOKENS.ink }} />
        {[-50, -25, 0, 25, 50].map((tick) => (
          <div key={tick} style={{ position: 'absolute', left: `calc(50% + ${(tick / 50) * 220}px)`, bottom: 0, transform: 'translateX(-50%)', fontFamily: SANS, fontVariantNumeric: 'tabular-nums', fontSize: 11, color: TOKENS.ink40 }}>
            <div style={{ width: 1, height: tick === 0 ? 20 : 12, background: tick === 0 ? TOKENS.ink : TOKENS.ink20, margin: '0 auto 4px' }} />
            {tick > 0 ? `+${tick}` : tick}
          </div>
        ))}
        <div style={{ position: 'absolute', top: -10, left: `calc(50% + ${offset}px - 1px)`, width: 2, height: 60, background: TOKENS.accent }} />
        <div style={{ position: 'absolute', top: -16, left: `calc(50% + ${offset}px - 6px)`, width: 12, height: 12, borderRadius: '50%', background: TOKENS.accent }} />
      </div>

      <div style={{ marginTop: 48, fontFamily: SERIF, fontStyle: 'italic', fontSize: 18, color: TOKENS.ink60 }}>
        {cents < 0 ? 'A touch flat' : cents > 0 ? 'A touch sharp' : 'In tune'} —{' '}
        <span style={{ fontStyle: 'normal', color: TOKENS.accent }}>tighten by {Math.abs(cents)}¢</span>
      </div>

      <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center', gap: 18, paddingTop: 28, borderTop: `1px solid ${TOKENS.ink20}`, flexWrap: 'wrap' }}>
        {['E2', 'A2', 'D3', 'G3', 'B3', 'E4'].map((s, i) => (
          <button key={s} type="button" style={{ background: i === 0 ? TOKENS.ink : 'transparent', color: i === 0 ? TOKENS.surface : TOKENS.ink60, border: `1px solid ${i === 0 ? TOKENS.ink : TOKENS.ink20}`, borderRadius: 999, padding: '10px 16px', fontFamily: SERIF, fontSize: 16, fontWeight: 600, cursor: 'pointer', minWidth: 52 }}>
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChordFinderView() {
  const [selected, setSelected] = useState(0)
  const chord = SAMPLE_CHORDS[selected] ?? SAMPLE_CHORDS[0]

  return (
    <div className="min-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 3fr)', gap: 56 }}>
      <div>
        <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKENS.ink40, marginBottom: 12 }}>
          Library · {SAMPLE_CHORDS.length} shapes in this song
        </div>
        <input placeholder="Search a chord…" style={{ width: '100%', padding: '14px 0', background: 'transparent', border: 'none', borderBottom: `1px solid ${TOKENS.ink}`, fontFamily: SERIF, fontStyle: 'italic', fontSize: 22, color: TOKENS.ink, outline: 'none' }} />
        <ol style={{ listStyle: 'none', padding: 0, margin: '24px 0 0' }}>
          {SAMPLE_CHORDS.map((c, i) => {
            const active = i === selected
            return (
              <li key={c.name}>
                <button type="button" onClick={() => setSelected(i)} style={{ width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '14px 0', borderTop: `1px solid ${TOKENS.ink20}`, cursor: 'pointer', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontFamily: SERIF, fontWeight: active ? 600 : 400, fontStyle: active ? 'normal' : 'italic', fontSize: 24, color: active ? TOKENS.accent : TOKENS.ink }}>
                    {c.name}
                  </span>
                  <span style={{ fontFamily: SANS, fontSize: 11, color: TOKENS.ink40, letterSpacing: '0.1em' }}>
                    {c.notes.join(' · ')}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <div>
        <div style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.ink20}`, padding: '40px 32px' }}>
          <div style={{ fontFamily: SANS, fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: TOKENS.accent }}>
            Selected
          </div>
          <h3 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 'clamp(56px, 8vw, 96px)', lineHeight: 1, letterSpacing: '-0.03em', margin: '6px 0 4px' }}>
            {chord.name}
          </h3>
          <p style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 18, color: TOKENS.ink60, margin: 0 }}>
            {chord.notes.join(' — ')}
          </p>

          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
            <ChordDiagram position={chord.positions[0]} size="lg" />
          </div>

          <dl style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, borderTop: `1px solid ${TOKENS.ink20}`, paddingTop: 24 }}>
            {[['Difficulty', 'Beginner'], ['Voicing', 'Open'], ['Used in', '6 songs']].map(([label, value]) => (
              <div key={label}>
                <dt style={{ fontFamily: SANS, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: TOKENS.ink40 }}>
                  {label}
                </dt>
                <dd style={{ fontFamily: SERIF, fontSize: 18, margin: 0, color: TOKENS.ink }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
