import { useState } from 'react'
import { Link } from 'react-router-dom'
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

const T = {
  bg: '#0A0B0E',
  panel: '#13151B',
  panelHi: '#1A1D25',
  rule: '#262A34',
  ruleHi: '#3A3F4D',
  text: '#E6E8EE',
  textDim: '#8A91A1',
  textMuted: '#5B6172',
  amber: '#FFB020',
  cyan: '#22D3EE',
  red: '#F25A4D',
}

const MONO = '"JetBrains Mono", "IBM Plex Mono", "SF Mono", Menlo, monospace'
const SANS = '"Inter", system-ui, sans-serif'

export default function StudioPage() {
  const [tab, setTab] = useState<DesignTab>('player')
  return (
    <div style={{ background: T.bg, color: T.text, fontFamily: SANS, minHeight: 'calc(100vh - 56px)' }}>
      <div
        style={{
          backgroundImage:
            'radial-gradient(900px 400px at 50% -100px, rgba(255,176,32,0.08), transparent 70%), linear-gradient(180deg, rgba(34,211,238,0.03), transparent 600px)',
          minHeight: 'calc(100vh - 56px)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 96px' }}>
          <Header />
          <Tabs current={tab} onChange={setTab} />
          <div style={{ marginTop: 20 }}>
            {tab === 'player' && <PlayerView />}
            {tab === 'tuner' && <TunerView />}
            {tab === 'chords' && <ChordView />}
          </div>
        </div>
      </div>
    </div>
  )
}

function Header() {
  return (
    <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0 20px', borderBottom: `1px solid ${T.rule}`, flexWrap: 'wrap', gap: 12 }}>
      <div>
        <Link to="/design" style={{ fontFamily: MONO, fontSize: 11, color: T.textDim, textDecoration: 'none', letterSpacing: '0.06em' }}>
          ← /design
        </Link>
        <h1 style={{ margin: '6px 0 0', fontFamily: SANS, fontSize: 24, fontWeight: 600, letterSpacing: '-0.01em' }}>
          Option B · Studio
          <span style={{ color: T.amber, fontFamily: MONO, fontSize: 13, marginLeft: 12, letterSpacing: 0 }}>v0.2-rc</span>
        </h1>
      </div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center', fontFamily: MONO, fontSize: 11, color: T.textDim }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.cyan, boxShadow: `0 0 8px ${T.cyan}` }} />
          AUDIO 48kHz
        </span>
        <span>BUF 256</span>
        <span>LAT 5.3ms</span>
      </div>
    </header>
  )
}

function Tabs({ current, onChange }: { current: DesignTab; onChange: (t: DesignTab) => void }) {
  const order: DesignTab[] = ['player', 'tuner', 'chords']
  return (
    <div role="tablist" style={{ display: 'inline-flex', marginTop: 20, padding: 4, background: T.panel, border: `1px solid ${T.rule}`, borderRadius: 8, gap: 2 }}>
      {order.map((t) => {
        const active = current === t
        return (
          <button
            key={t}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t)}
            style={{
              padding: '8px 16px',
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              background: active ? T.panelHi : 'transparent',
              color: active ? T.amber : T.textDim,
              boxShadow: active ? `inset 0 0 0 1px ${T.ruleHi}, 0 0 12px rgba(255,176,32,0.08)` : 'none',
              transition: 'all 140ms ease',
            }}
          >
            {TAB_LABELS[t]}
          </button>
        )
      })}
    </div>
  )
}

function Panel({ title, action, children, style }: { title?: string; action?: React.ReactNode; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <section
      style={{
        background: T.panel,
        border: `1px solid ${T.rule}`,
        borderRadius: 10,
        backgroundImage: `linear-gradient(180deg, ${T.panelHi} 0%, ${T.panel} 60px)`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        ...style,
      }}
    >
      {title && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${T.rule}` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: T.textDim }}>
            {title}
          </div>
          {action}
        </div>
      )}
      <div style={{ padding: 16 }}>{children}</div>
    </section>
  )
}

function Fretboard() {
  const W = 280, H = 110
  const strings = 6, frets = 5
  const stringSp = (H - 20) / (strings - 1)
  const fretSp = (W - 20) / frets
  const dots = [
    { string: 3, fret: 2, finger: 1 },
    { string: 4, fret: 3, finger: 2 },
    { string: 5, fret: 3, finger: 3 },
  ]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Fretboard">
      <defs>
        <linearGradient id="board" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1A1D25" />
          <stop offset="100%" stopColor="#0E1015" />
        </linearGradient>
        <radialGradient id="dotGlow">
          <stop offset="0%" stopColor={T.amber} stopOpacity="0.9" />
          <stop offset="60%" stopColor={T.amber} stopOpacity="0.3" />
          <stop offset="100%" stopColor={T.amber} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="10" y="10" width={W - 20} height={H - 20} fill="url(#board)" stroke={T.ruleHi} strokeWidth="1" rx="2" />
      {Array.from({ length: frets + 1 }).map((_, i) => (
        <line key={`f${i}`} x1={10 + i * fretSp} y1={10} x2={10 + i * fretSp} y2={H - 10} stroke={i === 0 ? T.amber : T.rule} strokeWidth={i === 0 ? 2 : 1} />
      ))}
      {Array.from({ length: strings }).map((_, i) => (
        <line key={`s${i}`} x1={10} y1={10 + i * stringSp} x2={W - 10} y2={10 + i * stringSp} stroke={T.ruleHi} strokeWidth={0.6 + i * 0.18} />
      ))}
      {[3, 5].map((m) => (
        <circle key={m} cx={10 + (m - 0.5) * fretSp} cy={H / 2} r={3} fill={T.ruleHi} />
      ))}
      {dots.map((d, i) => {
        const cx = 10 + (d.fret - 0.5) * fretSp
        const cy = 10 + (d.string - 1) * stringSp
        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={18} fill="url(#dotGlow)" />
            <circle cx={cx} cy={cy} r={8} fill={T.amber} stroke="#FFD37A" strokeWidth="1" />
            <text x={cx} y={cy + 3} textAnchor="middle" fontSize="9" fontWeight="700" fill="#0A0B0E">{d.finger}</text>
          </g>
        )
      })}
    </svg>
  )
}

function PlayerView() {
  const active = SAMPLE_SONG.timeline[SAMPLE_ACTIVE_INDEX]
  const next = SAMPLE_SONG.timeline[SAMPLE_ACTIVE_INDEX + 1]
  const progress = (SAMPLE_CURRENT_TIME / SAMPLE_DURATION) * 100

  return (
    <div className="studio-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
      <style>{`@media (max-width: 900px) { .studio-grid { grid-template-columns: 1fr !important; } }`}</style>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Panel title="Source · YouTube" action={<span style={{ fontFamily: MONO, fontSize: 11, color: T.textDim }}>{SAMPLE_SONG.youtubeId}</span>}>
          <div style={{ aspectRatio: '16 / 9', borderRadius: 6, position: 'relative', overflow: 'hidden', background: '#000', border: `1px solid ${T.rule}` }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 50% 40%, rgba(255,176,32,0.18), transparent 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button type="button" aria-label="Play" style={{ width: 78, height: 78, borderRadius: '50%', border: `1px solid ${T.amber}`, background: 'rgba(255,176,32,0.08)', cursor: 'pointer', boxShadow: `0 0 24px rgba(255,176,32,0.35), inset 0 0 12px rgba(255,176,32,0.2)` }}>
                <svg width="22" height="26" viewBox="0 0 22 26" aria-hidden="true">
                  <path d="M0 0 L22 13 L0 26 Z" fill={T.amber} />
                </svg>
              </button>
            </div>
            <div style={{ position: 'absolute', left: 12, bottom: 10, fontFamily: MONO, fontSize: 11, color: T.textDim }}>
              1920×1080 · 60fps
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ position: 'relative', height: 56, background: '#0A0B0E', border: `1px solid ${T.rule}`, borderRadius: 6, overflow: 'hidden' }}>
              <svg viewBox="0 0 600 56" preserveAspectRatio="none" width="100%" height="56" aria-hidden="true">
                {Array.from({ length: 240 }).map((_, i) => {
                  const x = i * 2.5
                  const seed = Math.sin(i * 0.7) * Math.cos(i * 0.31) * Math.sin(i * 0.13 + 1)
                  const h = 6 + Math.abs(seed) * 38 + (i % 13 === 0 ? 8 : 0)
                  const past = i / 240 < SAMPLE_CURRENT_TIME / SAMPLE_DURATION
                  return (
                    <rect key={i} x={x} y={28 - h / 2} width={1.4} height={h} fill={past ? T.amber : T.ruleHi} opacity={past ? 0.85 : 0.55} />
                  )
                })}
              </svg>
              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${progress}%`, width: 2, background: T.cyan, boxShadow: `0 0 8px ${T.cyan}` }} />
            </div>
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 11, color: T.textDim }}>
              <span>{formatTime(SAMPLE_CURRENT_TIME)}.{Math.round((SAMPLE_CURRENT_TIME % 1) * 100).toString().padStart(2, '0')}</span>
              <span>{SAMPLE_SONG.bpm} BPM · 4/4</span>
              <span>{formatTime(SAMPLE_DURATION)}.00</span>
            </div>
          </div>
        </Panel>

        <Panel title="Timeline · Chord track">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
            {SAMPLE_SONG.timeline.slice(0, 16).map((hit, i) => {
              const isActive = i === SAMPLE_ACTIVE_INDEX
              const isPast = i < SAMPLE_ACTIVE_INDEX
              return (
                <div key={hit.t} style={{
                  background: isActive ? 'rgba(255,176,32,0.12)' : isPast ? 'rgba(34,211,238,0.04)' : T.panelHi,
                  border: `1px solid ${isActive ? T.amber : T.rule}`,
                  borderRadius: 4,
                  padding: '10px 6px',
                  textAlign: 'center',
                  boxShadow: isActive ? `0 0 12px rgba(255,176,32,0.3)` : 'none',
                }}>
                  <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: 18, color: isActive ? T.amber : T.text }}>
                    {hit.chord}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 9, color: T.textMuted, marginTop: 2 }}>
                    {hit.t.toFixed(1)}s
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Panel title="Now · Chord">
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: T.amber, letterSpacing: '0.16em' }}>● LIVE</div>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 96, lineHeight: 1, letterSpacing: '-0.04em', color: T.text, textShadow: `0 0 30px rgba(255,176,32,0.25)`, margin: '6px 0' }}>
              {active.chord}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 11, color: T.textDim, letterSpacing: '0.1em' }}>
              NEXT → {next?.chord ?? '—'} in {next ? (next.t - SAMPLE_CURRENT_TIME).toFixed(1) : '—'}s
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <Fretboard />
          </div>
        </Panel>

        <Panel title="Song · Meta">
          <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 14, rowGap: 8, margin: 0, fontFamily: MONO, fontSize: 12 }}>
            <dt style={{ color: T.textDim }}>TITLE</dt><dd style={{ margin: 0, color: T.text }}>{SAMPLE_SONG.title}</dd>
            <dt style={{ color: T.textDim }}>ARTIST</dt><dd style={{ margin: 0, color: T.text }}>{SAMPLE_SONG.artist}</dd>
            <dt style={{ color: T.textDim }}>BPM</dt><dd style={{ margin: 0, color: T.text }}>{SAMPLE_SONG.bpm}</dd>
            <dt style={{ color: T.textDim }}>KEY</dt><dd style={{ margin: 0, color: T.text }}>F♯m / A</dd>
            <dt style={{ color: T.textDim }}>SHAPES</dt><dd style={{ margin: 0, color: T.text }}>{SAMPLE_SONG.chordsUsed.join(' · ')}</dd>
            <dt style={{ color: T.textDim }}>DIFF</dt><dd style={{ margin: 0, color: T.cyan }}>BEGINNER</dd>
          </dl>
        </Panel>
      </div>
    </div>
  )
}

function TunerView() {
  const { targetName, octave, hz, cents, targetHz } = SAMPLE_TUNER
  const segments = 41
  const center = 20
  const lit = Math.round((cents / 50) * 20) + center

  return (
    <div className="studio-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
      <Panel title="Pitch · Live">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, color: T.amber, letterSpacing: '0.18em' }}>● LISTENING</div>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 'clamp(120px, 18vw, 200px)', lineHeight: 0.9, letterSpacing: '-0.05em', textShadow: `0 0 36px rgba(255,176,32,0.25)` }}>
            {targetName}
            <span style={{ fontSize: '0.32em', color: T.textDim, marginLeft: 8, fontFamily: MONO }}>
              {octave}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 32, fontFamily: MONO, fontSize: 14, color: T.textDim, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span><span style={{ color: T.text }}>{hz.toFixed(2)}</span> Hz</span>
            <span><span style={{ color: T.text }}>{cents > 0 ? '+' : ''}{cents.toFixed(0)}</span> ¢</span>
            <span>target <span style={{ color: T.text }}>{targetHz.toFixed(2)}</span> Hz</span>
          </div>

          <div style={{ marginTop: 32, display: 'flex', gap: 3, alignItems: 'flex-end', height: 56, maxWidth: '100%', overflow: 'hidden' }}>
            {Array.from({ length: segments }).map((_, i) => {
              const dist = Math.abs(i - center)
              const isOn = (lit >= center && i >= center && i <= lit) || (lit < center && i <= center && i >= lit)
              const color = dist <= 2 ? '#3FE07A' : dist <= 8 ? T.amber : T.red
              const h = 12 + (segments - dist * 1.4) * 0.9
              return (
                <div key={i} style={{
                  width: 6,
                  height: h,
                  background: isOn ? color : T.rule,
                  boxShadow: isOn ? `0 0 8px ${color}` : 'none',
                  borderRadius: 1,
                  opacity: isOn ? 1 : 0.5,
                }} />
              )
            })}
          </div>
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', width: 280, fontFamily: MONO, fontSize: 10, color: T.textMuted }}>
            <span>−50¢</span><span>0</span><span>+50¢</span>
          </div>
        </div>
      </Panel>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Panel title="Strings">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { n: 'E2', hz: 82.41, active: true },
              { n: 'A2', hz: 110.0, active: false },
              { n: 'D3', hz: 146.83, active: false },
              { n: 'G3', hz: 196.0, active: false },
              { n: 'B3', hz: 246.94, active: false },
              { n: 'E4', hz: 329.63, active: false },
            ].map((s) => (
              <button key={s.n} type="button" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: s.active ? 'rgba(255,176,32,0.08)' : T.panelHi,
                border: `1px solid ${s.active ? T.amber : T.rule}`,
                borderRadius: 6,
                cursor: 'pointer',
                color: T.text,
                fontFamily: MONO,
              }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: s.active ? T.amber : T.text }}>{s.n}</span>
                <span style={{ fontSize: 11, color: T.textDim }}>{s.hz.toFixed(2)} Hz</span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Tuning · Standard">
          <div style={{ fontFamily: MONO, fontSize: 12, color: T.textDim, lineHeight: 1.7 }}>
            <div>EADGBE · 440 Hz</div>
            <div>Algorithm: McLeod Pitch</div>
            <div>Window: 2048 samples</div>
            <div>Clarity ≥ 0.90</div>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function ChordView() {
  const [selected, setSelected] = useState(0)
  const chord = SAMPLE_CHORDS[selected] ?? SAMPLE_CHORDS[0]

  return (
    <div className="studio-grid-3" style={{ display: 'grid', gridTemplateColumns: '260px 1fr 260px', gap: 16 }}>
      <style>{`@media (max-width: 1024px) { .studio-grid-3 { grid-template-columns: 1fr !important; } }`}</style>
      <Panel title="Library">
        <input placeholder="search…" style={{
          width: '100%',
          padding: '8px 10px',
          background: '#0A0B0E',
          border: `1px solid ${T.rule}`,
          borderRadius: 6,
          fontFamily: MONO,
          fontSize: 12,
          color: T.text,
          outline: 'none',
          boxSizing: 'border-box',
        }} />
        <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {SAMPLE_CHORDS.map((c, i) => {
            const active = i === selected
            return (
              <li key={c.name}>
                <button type="button" onClick={() => setSelected(i)} style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  background: active ? 'rgba(255,176,32,0.1)' : 'transparent',
                  border: `1px solid ${active ? T.amber : 'transparent'}`,
                  borderRadius: 4,
                  cursor: 'pointer',
                  color: active ? T.amber : T.text,
                  fontFamily: MONO,
                  fontSize: 13,
                }}>
                  <span>{c.name}</span>
                  <span style={{ color: T.textDim, fontSize: 10 }}>{c.notes.length} notes</span>
                </button>
              </li>
            )
          })}
        </ul>
      </Panel>

      <Panel title={`Inspector · ${chord.name}`} action={<span style={{ fontFamily: MONO, fontSize: 11, color: T.textDim }}>position 1/1</span>}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
          <Fretboard />
          <div style={{ marginTop: 16, fontFamily: SANS, fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', color: T.text, textShadow: `0 0 20px rgba(255,176,32,0.2)` }}>
            {chord.name}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 12, color: T.textDim, letterSpacing: '0.08em' }}>
            {chord.notes.join(' — ').toUpperCase()}
          </div>
        </div>
      </Panel>

      <Panel title="Spec">
        <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 12, rowGap: 8, margin: 0, fontFamily: MONO, fontSize: 12 }}>
          <dt style={{ color: T.textDim }}>NAME</dt><dd style={{ margin: 0 }}>{chord.name}</dd>
          <dt style={{ color: T.textDim }}>NOTES</dt><dd style={{ margin: 0 }}>{chord.notes.join(', ')}</dd>
          <dt style={{ color: T.textDim }}>FRETS</dt><dd style={{ margin: 0 }}>{chord.positions[0].frets.join(' ')}</dd>
          <dt style={{ color: T.textDim }}>FINGERS</dt><dd style={{ margin: 0 }}>{chord.positions[0].fingers.join(' ')}</dd>
          <dt style={{ color: T.textDim }}>BARRES</dt><dd style={{ margin: 0 }}>{(chord.positions[0].barres ?? []).join(', ') || '—'}</dd>
          <dt style={{ color: T.textDim }}>BASE</dt><dd style={{ margin: 0 }}>fret {chord.positions[0].baseFret}</dd>
        </dl>
      </Panel>
    </div>
  )
}
