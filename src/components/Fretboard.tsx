import { useEffect, useRef, useState, type JSX } from 'react'
import type {
  FretboardShape,
  FretWindow,
  Orientation,
  RenderedShape,
} from '../lib/fretboard'
import { renderCoords } from '../lib/fretboard'

interface FretboardProps {
  current: FretboardShape | null
  next?: FretboardShape | null
  currentTime?: number
  nextStartsAt?: number | null
  window: FretWindow
  orientation: Orientation
  ariaLabel: string
  className?: string
}

const GHOST_LEAD_IN = 0.5
const CURRENT_FADE_OUT = 0.2

export function Fretboard({
  current,
  next = null,
  currentTime = 0,
  nextStartsAt = null,
  window: fretWindow,
  orientation,
  ariaLabel,
  className,
}: FretboardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    const node = containerRef.current
    if (!node) return
    let raf = 0
    const observer = new ResizeObserver((entries) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const rect = entries[0]?.contentRect
        if (rect) setSize({ width: rect.width, height: rect.height })
      })
    })
    observer.observe(node)
    const rect = node.getBoundingClientRect()
    setSize({ width: rect.width, height: rect.height })
    return () => {
      cancelAnimationFrame(raf)
      observer.disconnect()
    }
  }, [])

  const ready = size.width > 0 && size.height > 0
  const rendered =
    ready && current ? renderCoords(current, fretWindow, orientation, size) : null
  const ghostRendered =
    ready && next ? renderCoords(next, fretWindow, orientation, size) : null

  const { currentOpacity, ghostOpacity } = computeOpacities({
    currentTime,
    nextStartsAt,
    hasNext: ghostRendered !== null,
  })

  return (
    <div
      ref={containerRef}
      className={className}
      role="img"
      aria-label={ariaLabel}
      style={{ width: '100%', height: '100%' }}
    >
      {ready && (
        <svg
          width={size.width}
          height={size.height}
          viewBox={`0 0 ${size.width} ${size.height}`}
          style={{ display: 'block' }}
        >
          <FretboardGrid window={fretWindow} orientation={orientation} size={size} />
          {ghostRendered && (
            <g opacity={ghostOpacity} style={{ transition: reduceMotion ? 'none' : 'opacity 150ms linear' }}>
              <ShapeLayer rendered={ghostRendered} shape={next!} ghost />
            </g>
          )}
          {rendered && (
            <g opacity={currentOpacity} style={{ transition: reduceMotion ? 'none' : 'opacity 150ms linear' }}>
              <ShapeLayer rendered={rendered} shape={current!} />
            </g>
          )}
        </svg>
      )}
    </div>
  )
}

function computeOpacities({
  currentTime,
  nextStartsAt,
  hasNext,
}: {
  currentTime: number
  nextStartsAt: number | null
  hasNext: boolean
}): { currentOpacity: number; ghostOpacity: number } {
  if (!hasNext || nextStartsAt === null) return { currentOpacity: 1, ghostOpacity: 0 }
  const t = currentTime
  const swap = nextStartsAt
  if (t < swap - GHOST_LEAD_IN) return { currentOpacity: 1, ghostOpacity: 0 }
  if (t < swap) {
    const ramp = (t - (swap - GHOST_LEAD_IN)) / GHOST_LEAD_IN
    return { currentOpacity: 1, ghostOpacity: 0.4 * ramp }
  }
  if (t < swap + CURRENT_FADE_OUT) {
    const fade = (t - swap) / CURRENT_FADE_OUT
    return { currentOpacity: 1 - fade, ghostOpacity: 1 }
  }
  return { currentOpacity: 0, ghostOpacity: 1 }
}

function FretboardGrid({
  window: fretWindow,
  orientation,
  size,
}: {
  window: FretWindow
  orientation: Orientation
  size: { width: number; height: number }
}) {
  const isHorizontal = orientation === 'horizontal'
  const longAxis = isHorizontal ? size.width : size.height
  const shortAxis = isHorizontal ? size.height : size.width
  const padding = 0.06
  const fretSpan = longAxis * (1 - padding)
  const fretStart = longAxis * padding
  const slotCount = fretWindow.maxFret - fretWindow.minFret
  const fretStep = fretSpan / slotCount
  const stringStep = shortAxis / 5

  const elements: JSX.Element[] = []

  for (let i = 0; i < 6; i++) {
    const shortPos = i * stringStep
    const a = isHorizontal
      ? { x1: fretStart, y1: shortPos, x2: longAxis, y2: shortPos }
      : { x1: shortPos, y1: fretStart, x2: shortPos, y2: longAxis }
    elements.push(
      <line
        key={`s${i}`}
        x1={a.x1}
        y1={a.y1}
        x2={a.x2}
        y2={a.y2}
        stroke="currentColor"
        strokeOpacity={0.35}
        strokeWidth={1}
      />,
    )
  }

  for (let f = 0; f <= slotCount; f++) {
    const longPos = fretStart + f * fretStep
    const isNut = f === 0 && fretWindow.minFret === 0
    const a = isHorizontal
      ? { x1: longPos, y1: 0, x2: longPos, y2: shortAxis }
      : { x1: 0, y1: longPos, x2: shortAxis, y2: longPos }
    elements.push(
      <line
        key={`f${f}`}
        x1={a.x1}
        y1={a.y1}
        x2={a.x2}
        y2={a.y2}
        stroke="currentColor"
        strokeOpacity={isNut ? 1 : 0.35}
        strokeWidth={isNut ? 3 : 1}
      />,
    )
  }

  const inlayFrets = [3, 5, 7, 9, 12].filter(
    (f) => f > fretWindow.minFret && f <= fretWindow.maxFret,
  )
  for (const f of inlayFrets) {
    const longPos = fretStart + (f - fretWindow.minFret - 0.5) * fretStep
    const shortPos = shortAxis / 2
    const r = Math.min(fretStep, stringStep) * 0.15
    const cx = isHorizontal ? longPos : shortPos
    const cy = isHorizontal ? shortPos : longPos
    elements.push(
      <circle
        key={`inlay${f}`}
        cx={cx}
        cy={cy}
        r={r}
        fill="currentColor"
        fillOpacity={0.15}
      />,
    )
  }

  return <g>{elements}</g>
}

function ShapeLayer({
  rendered,
  shape,
  ghost = false,
}: {
  rendered: RenderedShape
  shape: FretboardShape
  ghost?: boolean
}) {
  const dotFill = ghost ? 'var(--color-accent, #5b8def)' : 'var(--color-accent, #4561e0)'
  const dotRadius = findDotRadius(rendered)
  return (
    <g>
      {rendered.markers.map((m) => (
        <text
          key={`m${m.stringIndex}`}
          x={m.x}
          y={m.y}
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize={dotRadius * 1.6}
          fill="currentColor"
          fillOpacity={0.6}
        >
          {m.kind === 'muted' ? '×' : '○'}
        </text>
      ))}
      {rendered.barres.map((b, i) => (
        <rect
          key={`b${i}`}
          x={b.x}
          y={b.y}
          width={b.width}
          height={b.height}
          rx={Math.min(b.width, b.height) / 2}
          ry={Math.min(b.width, b.height) / 2}
          fill={dotFill}
          opacity={0.85}
        />
      ))}
      {rendered.dots.map((d) => (
        <g key={`d${d.stringIndex}`}>
          <circle cx={d.x} cy={d.y} r={dotRadius} fill={dotFill} />
          {shape.fingers[d.stringIndex] > 0 && (
            <text
              x={d.x}
              y={d.y}
              dominantBaseline="middle"
              textAnchor="middle"
              fontSize={dotRadius * 1.1}
              fill="white"
              fontWeight={600}
            >
              {shape.fingers[d.stringIndex]}
            </text>
          )}
        </g>
      ))}
    </g>
  )
}

function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduce(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduce
}

function findDotRadius(rendered: RenderedShape): number {
  if (rendered.barres.length > 0) {
    const b = rendered.barres[0]
    return Math.min(b.width, b.height) / 2
  }
  return 12
}
