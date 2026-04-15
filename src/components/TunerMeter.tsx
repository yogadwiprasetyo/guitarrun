interface TunerMeterProps {
  cents: number | null // -50..+50, null = silent
  noteName: string | null // "E"
  octave: number | null // 4
  targetName: string | null // "E"
  targetHz: number | null // 329.63
  hz: number | null // measured
}

const INK = '#15110D'
const INK_20 = '#D8D2C7'
const INK_40 = '#8C857A'
const ACCENT = '#C2553B'
const IN_TUNE = '#4B7F4F'

const WIDTH = 440
const CENTER = WIDTH / 2
const HALF_RANGE = 190

export default function TunerMeter({
  cents,
  noteName,
  octave,
  targetName,
  targetHz,
  hz,
}: TunerMeterProps) {
  const hasReading = cents != null
  const outOfRange = hasReading && Math.abs(cents) > 45
  const clampedCents = cents == null ? 0 : Math.max(-50, Math.min(50, cents))
  const inTune = hasReading && !outOfRange && Math.abs(cents) <= 5

  const needleColor = inTune ? IN_TUNE : outOfRange ? INK_40 : ACCENT
  const needleX = CENTER + (clampedCents / 50) * HALF_RANGE

  const statusLine = (() => {
    if (!hasReading) return 'listening…'
    if (outOfRange) return 'play closer to a guitar string'
    if (inTune) return 'in tune'
    return cents! < 0 ? 'A touch flat' : 'A touch sharp'
  })()

  const ticks = [-50, -25, 0, 25, 50]

  return (
    <div className="flex flex-col items-center text-center w-full">
      <div className="text-[11px] uppercase tracking-eyebrow text-ink-40 mb-2">
        Target {targetName ?? '—'}
        {targetHz != null && (
          <>
            {' · '}
            <span className="nums-tabular">{targetHz.toFixed(2)} Hz</span>
          </>
        )}
      </div>

      <div
        className="font-serif font-semibold leading-[0.92] tracking-[-0.05em] text-[clamp(120px,22vw,220px)] transition-colors duration-150"
        style={{ color: inTune ? IN_TUNE : INK }}
      >
        {targetName ?? '—'}
        {octave != null && (
          <span className="font-serif italic font-normal text-[0.32em] align-top text-ink-40 ml-3">
            {octave}
          </span>
        )}
      </div>

      <div className="font-serif italic text-[18px] text-ink-60 mt-1 nums-tabular">
        {hz != null ? `Detected ${hz.toFixed(2)} Hz` : 'Quiet — pluck a string'}
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} 96`}
        width="100%"
        className="max-w-[520px] mt-10"
        role="img"
        aria-label={`Tuning offset ${cents != null ? cents.toFixed(0) : 'unknown'} cents`}
      >
        <line
          x1={CENTER - HALF_RANGE}
          x2={CENTER + HALF_RANGE}
          y1={64}
          y2={64}
          stroke={INK_20}
          strokeWidth={1}
        />
        <line x1={CENTER} x2={CENTER} y1={44} y2={80} stroke={INK} strokeWidth={1} />

        {ticks.map((t) => {
          const x = CENTER + (t / 50) * HALF_RANGE
          const isZero = t === 0
          return (
            <g key={t}>
              {!isZero && (
                <line x1={x} x2={x} y1={56} y2={72} stroke={INK_20} strokeWidth={1} />
              )}
              <text
                x={x}
                y={92}
                textAnchor="middle"
                fontFamily="Inter, system-ui, sans-serif"
                fontSize={11}
                fill={INK_40}
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {t > 0 ? `+${t}` : t}
              </text>
            </g>
          )
        })}

        {cents != null && (
          <g>
            <line
              x1={needleX}
              x2={needleX}
              y1={28}
              y2={80}
              stroke={needleColor}
              strokeWidth={2}
              style={{ transition: 'x1 180ms ease-out, x2 180ms ease-out, stroke 150ms ease' }}
            />
            <circle
              cx={needleX}
              cy={24}
              r={6}
              fill={needleColor}
              style={{ transition: 'cx 180ms ease-out, fill 150ms ease' }}
            />
          </g>
        )}
      </svg>

      <div className="mt-8 font-serif italic text-[18px] text-ink-60">
        {statusLine}
        {cents != null && !inTune && !outOfRange && (
          <>
            {' — '}
            <span className="not-italic font-semibold text-accent nums-tabular">
              {cents > 0 ? 'loosen' : 'tighten'} by {Math.abs(cents).toFixed(0)}¢
            </span>
          </>
        )}
      </div>

      {noteName && octave != null && targetName && noteName + octave !== targetName + octave && (
        <div className="mt-2 text-[11px] uppercase tracking-eyebrow text-ink-40">
          Detected {noteName}
          {octave}
        </div>
      )}
    </div>
  )
}
