import { useState } from 'react'
import { Link } from 'react-router-dom'
import ChordDiagram from '../../../components/ChordDiagram'
import {
  SAMPLE_SONG,
  SAMPLE_CHORDS,
  SAMPLE_ACTIVE_INDEX,
  SAMPLE_CURRENT_TIME,
  SAMPLE_DURATION,
  SAMPLE_TUNER_IN,
  TAB_LABELS,
  formatTime,
  type DesignTab,
} from '../shared/sampleData'

const C = {
  cream: '#FFF7E8',
  creamHi: '#FFFDF7',
  ink: '#23202B',
  ink70: '#5A5666',
  mint: '#A8E6C8',
  mintInk: '#1F6B47',
  peach: '#FFB59A',
  peachInk: '#9B3D1F',
  sky: '#A8D2FF',
  skyInk: '#1F4F8E',
  lemon: '#FFE16A',
}

const ROUND = '"Nunito", "Mona Sans", system-ui, sans-serif'

const STICKER = (color: string): React.CSSProperties => ({
  background: color,
  border: `2.5px solid ${C.ink}`,
  borderRadius: 22,
  boxShadow: `4px 4px 0 ${C.ink}`,
})

export default function PlayfulPage() {
  const [tab, setTab] = useState<DesignTab>('player')
  return (
    <div style={{ background: C.cream, color: C.ink, fontFamily: ROUND, minHeight: 'calc(100vh - 56px)', position: 'relative', overflow: 'hidden' }}>
      <Sparkle x="6%" y="12%" size={36} color={C.peach} />
      <Sparkle x="92%" y="18%" size={28} color={C.sky} />
      <Sparkle x="88%" y="78%" size={42} color={C.mint} />
      <Sparkle x="4%" y="65%" size={32} color={C.lemon} />

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 96px', position: 'relative' }}>
        <Header />
        <Tabs current={tab} onChange={setTab} />
        <div style={{ marginTop: 32 }}>
          {tab === 'player' && <PlayerView />}
          {tab === 'tuner' && <TunerView />}
          {tab === 'chords' && <ChordsView />}
        </div>
      </div>
    </div>
  )
}

function Sparkle({ x, y, size, color }: { x: string; y: string; size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ position: 'absolute', left: x, top: y, pointerEvents: 'none' }} aria-hidden="true">
      <path d="M20 4 L23 17 L36 20 L23 23 L20 36 L17 23 L4 20 L17 17 Z" fill={color} stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

function WavyUnderline({ color = C.peach }: { color?: string }) {
  return (
    <svg viewBox="0 0 200 12" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: 10 }} aria-hidden="true">
      <path d="M0 6 Q 25 0 50 6 T 100 6 T 150 6 T 200 6" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function Header() {
  return (
    <header>
      <Link to="/design" style={{ fontFamily: ROUND, fontSize: 14, color: C.ink70, textDecoration: 'none', fontWeight: 700 }}>
        ← back to design land
      </Link>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
        <h1 style={{ fontFamily: ROUND, fontWeight: 900, fontSize: 'clamp(40px, 6vw, 64px)', lineHeight: 1, letterSpacing: '-0.02em', margin: 0 }}>
          Option C
        </h1>
        <span style={{ fontWeight: 700, fontSize: 24, color: C.peachInk, background: C.peach, padding: '4px 14px', borderRadius: 999, border: `2px solid ${C.ink}`, boxShadow: `2px 2px 0 ${C.ink}` }}>
          Playful
        </span>
      </div>
      <div style={{ marginTop: 10, maxWidth: 360 }}>
        <WavyUnderline />
      </div>
      <p style={{ fontSize: 17, color: C.ink70, marginTop: 14, maxWidth: 540, fontWeight: 600 }}>
        A guitar app that hugs you. Squishy buttons, sticker chords, and a loud, friendly &ldquo;in tune!&rdquo; when you nail the note.
      </p>
    </header>
  )
}

function Tabs({ current, onChange }: { current: DesignTab; onChange: (t: DesignTab) => void }) {
  const order: DesignTab[] = ['player', 'tuner', 'chords']
  const colors: Record<DesignTab, string> = { player: C.mint, tuner: C.sky, chords: C.peach }
  return (
    <div role="tablist" style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
      {order.map((t) => {
        const active = current === t
        return (
          <button
            key={t}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t)}
            style={{
              padding: '12px 22px',
              fontFamily: ROUND,
              fontSize: 16,
              fontWeight: 800,
              border: `2.5px solid ${C.ink}`,
              borderRadius: 999,
              cursor: 'pointer',
              background: active ? colors[t] : C.creamHi,
              color: C.ink,
              boxShadow: active ? `4px 4px 0 ${C.ink}` : `2px 2px 0 ${C.ink}`,
              transform: active ? 'translate(-2px, -2px)' : 'none',
              transition: 'transform 120ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 120ms ease, background 160ms ease',
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
    <div className="play-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 28 }}>
      <style>{`@media (max-width: 880px) { .play-grid { grid-template-columns: 1fr !important; } }`}</style>

      <div>
        <div style={{ ...STICKER(C.creamHi), padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: C.peachInk, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Now jamming
              </div>
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 900, margin: '4px 0 0', letterSpacing: '-0.02em', lineHeight: 1 }}>
                Wonderwall
              </h2>
              <div style={{ fontSize: 16, color: C.ink70, fontWeight: 700, marginTop: 4 }}>
                Oasis · 87 bpm · 5 chords
              </div>
            </div>
            <span style={{ ...STICKER(C.mint), padding: '6px 14px', fontWeight: 800, fontSize: 13, color: C.mintInk, boxShadow: `2px 2px 0 ${C.ink}` }}>
              ★ beginner
            </span>
          </div>

          <div style={{ marginTop: 18, ...STICKER(C.ink), padding: 0, position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', boxShadow: `4px 4px 0 ${C.ink}` }}>
            <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 40% 40%, ${C.peach}, ${C.sky} 80%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <button type="button" aria-label="Play" style={{ width: 88, height: 88, borderRadius: '50%', background: C.lemon, border: `3px solid ${C.ink}`, boxShadow: `5px 5px 0 ${C.ink}`, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="26" height="30" viewBox="0 0 22 26" aria-hidden="true">
                  <path d="M2 1 L22 13 L2 25 Z" fill={C.ink} stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>
              {formatTime(SAMPLE_CURRENT_TIME)}
            </span>
            <div style={{ flex: 1, height: 14, background: C.creamHi, border: `2.5px solid ${C.ink}`, borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: `linear-gradient(90deg, ${C.peach}, ${C.lemon})` }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 800, fontVariantNumeric: 'tabular-nums', minWidth: 36 }}>
              {formatTime(SAMPLE_DURATION)}
            </span>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', color: C.skyInk, textTransform: 'uppercase', marginBottom: 10 }}>
            Sing along
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SAMPLE_SONG.timeline.slice(Math.max(0, SAMPLE_ACTIVE_INDEX - 1), SAMPLE_ACTIVE_INDEX + 3).map((hit, i) => {
              const isActive = i === 1
              return (
                <div key={hit.t} style={{
                  ...STICKER(isActive ? C.lemon : C.creamHi),
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: isActive ? `4px 4px 0 ${C.ink}` : `2px 2px 0 ${C.ink}`,
                  transform: isActive ? 'rotate(-0.5deg)' : `rotate(${i % 2 === 0 ? '0.4' : '-0.3'}deg)`,
                }}>
                  <span style={{ fontSize: 22, fontWeight: 900, minWidth: 64, color: isActive ? C.peachInk : C.ink }}>
                    {hit.chord}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: isActive ? 800 : 600, color: isActive ? C.ink : C.ink70 }}>
                    {hit.lyric ?? '— groove —'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <aside>
        <div style={{ ...STICKER(C.peach), padding: '24px 20px', textAlign: 'center', transform: 'rotate(-1deg)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.peachInk, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            play this now
          </div>
          <div style={{ fontSize: 88, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', margin: '4px 0 6px' }}>
            {active.chord}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.peachInk }}>
            {active.lyric ?? 'hold steady'}
          </div>
        </div>

        <div style={{ marginTop: 18, ...STICKER(C.creamHi), padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.skyInk, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
            up next
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'space-around', flexWrap: 'wrap' }}>
            {[next, next2].filter(Boolean).map((hit, i) => {
              const shape = SAMPLE_CHORDS.find((c) => c.name === hit.chord)
              return (
                <div key={i} style={{
                  ...STICKER(i === 0 ? C.mint : C.sky),
                  padding: '10px 12px',
                  textAlign: 'center',
                  transform: `rotate(${i === 0 ? '-1.5deg' : '1.5deg'})`,
                }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.ink }}>{hit.chord}</div>
                  {shape && (
                    <div style={{ marginTop: 2, background: C.creamHi, borderRadius: 12, padding: 4 }}>
                      <ChordDiagram position={shape.positions[0]} size="sm" />
                    </div>
                  )}
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.ink70, marginTop: 4 }}>
                    in {(hit.t - SAMPLE_CURRENT_TIME).toFixed(1)}s
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </aside>
    </div>
  )
}

function TunerView() {
  const { targetName, octave, hz, cents, targetHz } = SAMPLE_TUNER_IN
  const isInTune = Math.abs(cents) <= 5

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ ...STICKER(C.mint), padding: '36px 28px', textAlign: 'center', position: 'relative', transform: 'rotate(-0.6deg)' }}>
        <div style={{ position: 'absolute', top: -16, right: 24, ...STICKER(C.lemon), padding: '8px 14px', fontSize: 13, fontWeight: 800, transform: 'rotate(6deg)', boxShadow: `3px 3px 0 ${C.ink}` }}>
          {isInTune ? 'in tune!' : `off by ${Math.abs(cents)}¢`}
        </div>

        <div style={{ fontSize: 13, fontWeight: 800, color: C.mintInk, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          string · A
        </div>
        <div style={{ fontSize: 'clamp(140px, 22vw, 220px)', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-0.05em', margin: '8px 0 4px' }}>
          {targetName}
          <span style={{ fontSize: '0.32em', color: C.ink70, marginLeft: 8 }}>{octave}</span>
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: C.ink70 }}>
          you: <span style={{ color: C.ink }}>{hz.toFixed(2)} Hz</span> · target <span style={{ color: C.ink }}>{targetHz.toFixed(2)} Hz</span>
        </div>

        <div style={{ marginTop: 32, position: 'relative', height: 70 }}>
          <div style={{ position: 'absolute', left: '8%', right: '8%', top: 30, height: 14, background: C.creamHi, border: `2.5px solid ${C.ink}`, borderRadius: 999 }}>
            <div style={{ position: 'absolute', left: '50%', top: -6, bottom: -6, width: 4, background: C.ink, borderRadius: 4 }} />
          </div>
          <div style={{
            position: 'absolute',
            left: `calc(50% + ${(cents / 50) * 40}% - 22px)`,
            top: 14,
            width: 44, height: 44,
            background: isInTune ? C.lemon : C.peach,
            border: `3px solid ${C.ink}`,
            borderRadius: '50%',
            boxShadow: `4px 4px 0 ${C.ink}`,
            transition: 'left 240ms cubic-bezier(0.34,1.56,0.64,1)',
          }} />
        </div>

        <div style={{ marginTop: 28, fontSize: 18, fontWeight: 800 }}>
          {isInTune ? 'nice — that string is locked in.' : cents < 0 ? 'tighten it up a smidge' : 'loosen just a hair'}
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {[
          { n: 'E2', c: C.peach, active: false },
          { n: 'A2', c: C.mint, active: true },
          { n: 'D3', c: C.sky, active: false },
          { n: 'G3', c: C.lemon, active: false },
          { n: 'B3', c: C.peach, active: false },
          { n: 'E4', c: C.mint, active: false },
        ].map((s) => (
          <button key={s.n} type="button" style={{
            ...STICKER(s.c),
            padding: '14px 22px',
            fontSize: 18,
            fontWeight: 900,
            cursor: 'pointer',
            transform: s.active ? 'translate(-2px, -2px) rotate(-2deg)' : 'none',
            boxShadow: s.active ? `5px 5px 0 ${C.ink}` : `3px 3px 0 ${C.ink}`,
          }}>
            {s.n}
          </button>
        ))}
      </div>
    </div>
  )
}

function ChordsView() {
  const [selected, setSelected] = useState(0)
  const chord = SAMPLE_CHORDS[selected] ?? SAMPLE_CHORDS[0]
  const palette = [C.mint, C.peach, C.sky, C.lemon, '#E0B6FF']

  return (
    <div className="play-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
      <style>{`@media (max-width: 880px) { .play-grid-3 { grid-template-columns: 1fr !important; } }`}</style>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
          <span style={{ ...STICKER(C.lemon), padding: '8px 14px', fontWeight: 800, fontSize: 14, transform: 'rotate(-2deg)' }}>
            chord stickers
          </span>
          <span style={{ fontSize: 14, color: C.ink70, fontWeight: 700 }}>
            tap any one →
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 14 }}>
          {SAMPLE_CHORDS.map((c, i) => {
            const active = i === selected
            return (
              <button key={c.name} type="button" onClick={() => setSelected(i)} style={{
                ...STICKER(palette[i % palette.length]),
                padding: 12,
                cursor: 'pointer',
                transform: active ? 'translate(-3px, -3px) rotate(-1deg)' : `rotate(${i % 2 === 0 ? '0.6' : '-0.6'}deg)`,
                boxShadow: active ? `6px 6px 0 ${C.ink}` : `3px 3px 0 ${C.ink}`,
                transition: 'transform 140ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 140ms ease',
                color: C.ink,
                fontFamily: ROUND,
              }}>
                <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{c.name}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.ink70, marginTop: 4 }}>
                  {c.notes.join(' · ')}
                </div>
                <div style={{ marginTop: 8, background: C.creamHi, borderRadius: 12, padding: 4 }}>
                  <ChordDiagram position={c.positions[0]} size="sm" />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div style={{ ...STICKER(C.creamHi), padding: '28px 24px' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: C.peachInk, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            big shape
          </div>
          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em', margin: '4px 0' }}>
            {chord.name}
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: C.ink70 }}>
            notes: {chord.notes.join(' — ')}
          </div>

          <div style={{ marginTop: 24, ...STICKER(C.cream), padding: 16, display: 'flex', justifyContent: 'center' }}>
            <ChordDiagram position={chord.positions[0]} size="lg" />
          </div>

          <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ ...STICKER(C.mint), padding: '6px 12px', fontSize: 13, fontWeight: 800, color: C.mintInk, boxShadow: `2px 2px 0 ${C.ink}` }}>
              easy
            </span>
            <span style={{ ...STICKER(C.sky), padding: '6px 12px', fontSize: 13, fontWeight: 800, color: C.skyInk, boxShadow: `2px 2px 0 ${C.ink}` }}>
              open chord
            </span>
            <span style={{ ...STICKER(C.peach), padding: '6px 12px', fontSize: 13, fontWeight: 800, color: C.peachInk, boxShadow: `2px 2px 0 ${C.ink}` }}>
              used in 6 songs
            </span>
          </div>

          <button type="button" style={{
            ...STICKER(C.lemon),
            marginTop: 22,
            padding: '14px 22px',
            fontSize: 16,
            fontWeight: 900,
            cursor: 'pointer',
            width: '100%',
            boxShadow: `4px 4px 0 ${C.ink}`,
          }}>
            try it in a song →
          </button>
        </div>
      </div>
    </div>
  )
}
