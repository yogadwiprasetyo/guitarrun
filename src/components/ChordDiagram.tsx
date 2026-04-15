import type { ChordPosition } from '../lib/chords'

interface ChordDiagramProps {
  position: ChordPosition
  name?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: { width: 90, height: 110, stringSpacing: 14, fretSpacing: 18, dotRadius: 6, font: 10 },
  md: { width: 140, height: 170, stringSpacing: 22, fretSpacing: 28, dotRadius: 9, font: 13 },
  lg: { width: 220, height: 260, stringSpacing: 34, fretSpacing: 42, dotRadius: 13, font: 18 },
}

export default function ChordDiagram({ position, name, size = 'md' }: ChordDiagramProps) {
  const S = SIZES[size]
  const strings = 6
  const frets = 5
  const nameH = name ? S.font + 10 : 0
  const leftPad = S.stringSpacing
  const topPad = nameH + S.fretSpacing * 0.7
  const boardW = S.stringSpacing * (strings - 1)
  const boardH = S.fretSpacing * frets
  const showNut = position.baseFret === 1
  const barreFrets = new Set(position.barres ?? [])

  const stringX = (i: number) => leftPad + i * S.stringSpacing

  // Barre rendering: find min/max string indices that share a barre fret
  const barres: Array<{ fret: number; fromString: number; toString: number; finger: number }> = []
  for (const bf of barreFrets) {
    const indices: number[] = []
    position.frets.forEach((f, i) => { if (f === bf) indices.push(i) })
    if (indices.length >= 2) {
      const from = Math.min(...indices), to = Math.max(...indices)
      const relativeFret = bf - position.baseFret + 1
      barres.push({ fret: relativeFret, fromString: from, toString: to, finger: position.fingers[from] || 1 })
    }
  }

  return (
    <svg
      viewBox={`0 0 ${S.width} ${S.height}`}
      width={S.width}
      height={S.height}
      role="img"
      aria-label={name ? `${name} chord diagram` : 'chord diagram'}
      className="inline-block"
    >
      {name && (
        <text x={S.width / 2} y={S.font + 4} textAnchor="middle" fontSize={S.font + 3} fontWeight={600} fontFamily='"Source Serif 4", Georgia, serif' fill="#15110D">
          {name}
        </text>
      )}

      {/* Muted (×) and open (o) indicators above the nut */}
      {position.frets.map((f, i) => {
        const x = stringX(i)
        const y = topPad - 6
        if (f === -1) return <text key={`m${i}`} x={x} y={y} textAnchor="middle" fontSize={S.font} fill="#8C857A">×</text>
        if (f === 0) return <circle key={`o${i}`} cx={x} cy={y - 3} r={S.dotRadius * 0.45} fill="none" stroke="#15110D" strokeWidth={1.2} />
        return null
      })}

      {/* Fret lines */}
      {Array.from({ length: frets + 1 }).map((_, i) => {
        const y = topPad + i * S.fretSpacing
        return (
          <line
            key={`f${i}`}
            x1={leftPad} x2={leftPad + boardW}
            y1={y} y2={y}
            stroke="#15110D"
            strokeWidth={showNut && i === 0 ? 3 : 1}
          />
        )
      })}

      {/* Strings */}
      {Array.from({ length: strings }).map((_, i) => {
        const x = stringX(i)
        return <line key={`s${i}`} x1={x} x2={x} y1={topPad} y2={topPad + boardH} stroke="#15110D" strokeWidth={1} />
      })}

      {/* Base fret label when not open */}
      {!showNut && (
        <text x={leftPad + boardW + 6} y={topPad + S.fretSpacing * 0.7} fontSize={S.font} fill="#8C857A">
          {position.baseFret}fr
        </text>
      )}

      {/* Barres */}
      {barres.map((b, idx) => {
        const y = topPad + (b.fret - 0.5) * S.fretSpacing
        const x1 = stringX(b.fromString)
        const x2 = stringX(b.toString)
        return (
          <rect
            key={`b${idx}`}
            x={x1 - S.dotRadius * 0.85}
            y={y - S.dotRadius * 0.85}
            width={x2 - x1 + S.dotRadius * 1.7}
            height={S.dotRadius * 1.7}
            rx={S.dotRadius * 0.85}
            fill="#15110D"
          />
        )
      })}

      {/* Finger dots */}
      {position.frets.map((f, i) => {
        if (f <= 0) return null
        const relativeFret = f - position.baseFret + 1
        if (relativeFret < 1 || relativeFret > frets) return null
        // skip if part of a barre
        const isBarred = barres.some((b) => b.fret === relativeFret && i >= b.fromString && i <= b.toString && position.fingers[i] === b.finger)
        const cx = stringX(i)
        const cy = topPad + (relativeFret - 0.5) * S.fretSpacing
        const finger = position.fingers[i]
        return (
          <g key={`d${i}`}>
            {!isBarred && <circle cx={cx} cy={cy} r={S.dotRadius} fill="#15110D" />}
            {finger > 0 && (
              <text x={cx} y={cy + S.font * 0.35} textAnchor="middle" fontSize={S.font * 0.9} fontWeight={600} fill="#FBF8F2">
                {finger}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
