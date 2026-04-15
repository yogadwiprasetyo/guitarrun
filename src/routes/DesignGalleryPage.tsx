import { Link } from 'react-router-dom'

type Option = {
  to: string
  letter: string
  name: string
  pitch: string
  description: string
  preview: React.ReactNode
}

const OPTIONS: Option[] = [
  {
    to: '/design/minimal',
    letter: 'A',
    name: 'Minimal & Clean',
    pitch: 'Editorial calm. Serif voice. One warm accent.',
    description:
      'Reads like a music magazine on a stand: generous whitespace, restrained accent, a serif that gives the song titles weight without shouting.',
    preview: <MinimalPreview />,
  },
  {
    to: '/design/studio',
    letter: 'B',
    name: 'Dark & Immersive',
    pitch: 'A DAW for casual guitarists. Mono readouts, glowing dots.',
    description:
      'Dark panels, luminous amber accents, monospace readouts. Borrowed cues from Logic and Ableton — feels precise and pro without the price tag.',
    preview: <StudioPreview />,
  },
  {
    to: '/design/playful',
    letter: 'C',
    name: 'Playful & Approachable',
    pitch: 'Sticker chords, squishy buttons, a friendly nudge.',
    description:
      'Cream backgrounds, hand-drawn flourishes, chunky shadows that pop on tap. The kind of app that makes a hesitant beginner press play.',
    preview: <PlayfulPreview />,
  },
]

export default function DesignGalleryPage() {
  return (
    <div style={{ background: '#F7F5F0', minHeight: 'calc(100vh - 56px)', color: '#0d0d0f' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 96px' }}>
        <header style={{ borderBottom: '1px solid rgba(13,13,15,0.1)', paddingBottom: 24, marginBottom: 36 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(13,13,15,0.55)' }}>
            Design explorations
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 800, letterSpacing: '-0.02em', margin: '6px 0 4px', lineHeight: 1.05 }}>
            Three ways guitarrun could feel.
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(13,13,15,0.6)', maxWidth: 620, margin: 0, lineHeight: 1.5 }}>
            Same product. Same data. Three different personalities. Tap any tile to open a fully styled, interactive mockup of the player, tuner, and chord finder in that direction.
          </p>
        </header>

        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
          {OPTIONS.map((opt) => (
            <Link
              key={opt.to}
              to={opt.to}
              className="design-tile"
              style={{
                textDecoration: 'none',
                color: 'inherit',
                background: 'white',
                border: '1px solid rgba(13,13,15,0.1)',
                borderRadius: 16,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 200ms ease, box-shadow 200ms ease',
                boxShadow: '0 1px 0 rgba(13,13,15,0.04)',
              }}
            >
              <div style={{ aspectRatio: '16 / 10', position: 'relative', overflow: 'hidden' }}>
                {opt.preview}
              </div>
              <div style={{ padding: '20px 22px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.18em', color: '#e85d3c' }}>
                    OPTION {opt.letter}
                  </span>
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', margin: '4px 0 6px' }}>
                  {opt.name}
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(13,13,15,0.6)', margin: '0 0 14px', lineHeight: 1.45 }}>
                  {opt.description}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(13,13,15,0.08)', paddingTop: 14 }}>
                  <span style={{ fontSize: 13, fontStyle: 'italic', color: 'rgba(13,13,15,0.7)' }}>
                    {opt.pitch}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0d0d0f' }}>
                    View →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <style>{`.design-tile:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(13,13,15,0.10); }`}</style>

        <section style={{ marginTop: 56, padding: '24px 0', borderTop: '1px solid rgba(13,13,15,0.1)' }}>
          <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(13,13,15,0.55)' }}>
            How to read these
          </div>
          <p style={{ fontSize: 15, color: 'rgba(13,13,15,0.7)', maxWidth: 720, marginTop: 8, lineHeight: 1.55 }}>
            Each mockup includes the three core surfaces — Player (Wonderwall), Tuner (low E), and Chord Finder. Switch between them with the in-page tabs. Production routes (
            <Link to="/" style={{ color: '#e85d3c', textDecoration: 'underline' }}>Home</Link>,{' '}
            <Link to="/tuner" style={{ color: '#e85d3c', textDecoration: 'underline' }}>Tuner</Link>,{' '}
            <Link to="/chords" style={{ color: '#e85d3c', textDecoration: 'underline' }}>Chords</Link>) are untouched. Compare in&nbsp;
            <code style={{ background: 'rgba(13,13,15,0.06)', padding: '2px 6px', borderRadius: 4 }}>docs/08-DESIGN-OPTIONS.md</code>.
          </p>
        </section>
      </div>
    </div>
  )
}

function MinimalPreview() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F5F1EA', padding: 20, fontFamily: '"Source Serif 4", Georgia, serif' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#8C857A', fontFamily: 'Inter, sans-serif' }}>
        Now playing
      </div>
      <div style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 6 }}>
        Wonderwall
      </div>
      <div style={{ fontSize: 14, fontStyle: 'italic', color: '#5C544B', marginTop: 2 }}>Oasis, 1995</div>
      <div style={{ marginTop: 18, padding: 16, background: '#FBF8F2', border: '1px solid #D8D2C7', textAlign: 'center' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C2553B', fontFamily: 'Inter, sans-serif' }}>
          Now
        </div>
        <div style={{ fontSize: 56, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1 }}>Em7</div>
        <div style={{ fontSize: 12, fontStyle: 'italic', color: '#5C544B', marginTop: 4 }}>
          I don&rsquo;t believe that anybody…
        </div>
      </div>
      <div style={{ marginTop: 14, height: 1, background: '#D8D2C7', position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: -1, width: '32%', height: 3, background: '#C2553B' }} />
      </div>
    </div>
  )
}

function StudioPreview() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0A0B0E', padding: 14, color: '#E6E8EE', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.16em', color: '#FFB020', fontFamily: 'JetBrains Mono, monospace' }}>● LIVE · 18.20s</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <div style={{ fontSize: 14, color: '#8A91A1', fontFamily: 'JetBrains Mono, monospace' }}>WONDERWALL · 87 BPM</div>
        <div style={{ fontSize: 9, color: '#8A91A1', fontFamily: 'JetBrains Mono, monospace' }}>BUF 256</div>
      </div>
      <div style={{ marginTop: 10, padding: 14, background: '#13151B', border: '1px solid #262A34', borderRadius: 6, textAlign: 'center', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
        <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', textShadow: '0 0 24px rgba(255,176,32,0.4)' }}>Em7</div>
        <div style={{ fontSize: 9, color: '#8A91A1', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>NEXT → G in 3.0s</div>
      </div>
      <div style={{ marginTop: 12, height: 28, background: '#0A0B0E', border: '1px solid #262A34', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
        <svg viewBox="0 0 200 28" preserveAspectRatio="none" width="100%" height="28">
          {Array.from({ length: 80 }).map((_, i) => {
            const seed = Math.sin(i * 0.7) * Math.cos(i * 0.31)
            const h = 4 + Math.abs(seed) * 18
            const past = i / 80 < 0.32
            return <rect key={i} x={i * 2.5} y={14 - h / 2} width="1.4" height={h} fill={past ? '#FFB020' : '#3A3F4D'} opacity={past ? 0.85 : 0.5} />
          })}
        </svg>
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '32%', width: 2, background: '#22D3EE', boxShadow: '0 0 6px #22D3EE' }} />
      </div>
    </div>
  )
}

function PlayfulPreview() {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#FFF7E8', padding: 16, fontFamily: 'Nunito, system-ui, sans-serif' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <span style={{ background: '#A8E6C8', border: '2px solid #23202B', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 800, boxShadow: '2px 2px 0 #23202B' }}>player</span>
        <span style={{ background: '#FFFDF7', border: '2px solid #23202B', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 800, boxShadow: '2px 2px 0 #23202B' }}>tuner</span>
      </div>
      <div style={{ background: '#FFB59A', border: '2.5px solid #23202B', borderRadius: 18, padding: '14px 16px', boxShadow: '4px 4px 0 #23202B', transform: 'rotate(-1deg)', textAlign: 'center' }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: '#9B3D1F', letterSpacing: '0.12em', textTransform: 'uppercase' }}>play this now</div>
        <div style={{ fontSize: 48, fontWeight: 900, lineHeight: 1, color: '#23202B' }}>Em7</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9B3D1F' }}>I don&rsquo;t believe that anybody…</div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <span style={{ background: '#A8E6C8', border: '2.5px solid #23202B', borderRadius: 12, padding: '6px 12px', fontWeight: 900, fontSize: 14, boxShadow: '3px 3px 0 #23202B', transform: 'rotate(-1.5deg)' }}>G</span>
        <span style={{ background: '#A8D2FF', border: '2.5px solid #23202B', borderRadius: 12, padding: '6px 12px', fontWeight: 900, fontSize: 14, boxShadow: '3px 3px 0 #23202B', transform: 'rotate(1.5deg)' }}>Dsus4</span>
      </div>
      <svg width="36" height="14" viewBox="0 0 36 24" style={{ position: 'absolute', right: 14, top: 14 }} aria-hidden="true">
        <path d="M18 2 L21 9 L28 12 L21 13 L18 19 L15 13 L8 12 L15 9 Z" fill="#FFE16A" stroke="#23202B" strokeWidth="1.5" />
      </svg>
    </div>
  )
}
