import type { ChordPosition } from './chords'

export interface BarreSegment {
  fromString: number
  toString: number
  fret: number
}

export interface FretboardShape {
  frets: ReadonlyArray<number>
  fingers: ReadonlyArray<number>
  barres: ReadonlyArray<BarreSegment>
  baseFret: number
}

export interface FretWindow {
  minFret: number
  maxFret: number
}

export type Orientation = 'horizontal' | 'vertical'

export interface RenderedDot {
  x: number
  y: number
  finger: number
  stringIndex: number
}

export interface RenderedBarre {
  x: number
  y: number
  width: number
  height: number
}

export interface RenderedMarker {
  x: number
  y: number
  kind: 'muted' | 'open'
  stringIndex: number
}

export interface RenderedShape {
  dots: ReadonlyArray<RenderedDot>
  barres: ReadonlyArray<RenderedBarre>
  markers: ReadonlyArray<RenderedMarker>
}

const STRING_COUNT = 6
const MIN_MAX_FRET = 5
const MAX_MAX_FRET = 12

export function toFretboardShape(position: ChordPosition): FretboardShape {
  const frets = position.frets.slice(0, STRING_COUNT)
  const fingers = position.fingers.slice(0, STRING_COUNT)
  const barres: BarreSegment[] = []

  if (position.barres && position.barres.length > 0) {
    for (const fret of position.barres) {
      const stringsAtFret: number[] = []
      for (let i = 0; i < STRING_COUNT; i++) {
        if (frets[i] === fret) stringsAtFret.push(i)
      }
      if (stringsAtFret.length >= 2) {
        barres.push({
          fromString: stringsAtFret[0],
          toString: stringsAtFret[stringsAtFret.length - 1],
          fret,
        })
      }
    }
  }

  return {
    frets: Object.freeze([...frets]),
    fingers: Object.freeze([...fingers]),
    barres: Object.freeze(barres),
    baseFret: position.baseFret,
  }
}

export function computeFretWindow(shapes: ReadonlyArray<FretboardShape>): FretWindow {
  let highest = 0
  for (const shape of shapes) {
    for (const f of shape.frets) {
      if (f > highest) highest = f
    }
  }
  const maxFret = Math.min(MAX_MAX_FRET, Math.max(MIN_MAX_FRET, highest))
  return { minFret: 0, maxFret }
}

export function renderCoords(
  shape: FretboardShape,
  window: FretWindow,
  orientation: Orientation,
  size: { width: number; height: number },
): RenderedShape {
  const slotCount = window.maxFret - window.minFret
  const padding = 0.06
  const isHorizontal = orientation === 'horizontal'

  const longAxis = isHorizontal ? size.width : size.height
  const shortAxis = isHorizontal ? size.height : size.width
  const fretSpan = longAxis * (1 - padding)
  const fretStart = longAxis * padding
  const fretStep = fretSpan / slotCount
  const stringStep = shortAxis / (STRING_COUNT - 1)

  const fretToLong = (absFret: number): number => {
    const slotIndex = absFret - window.minFret
    return fretStart + (slotIndex - 0.5) * fretStep
  }
  const markerLong = fretStart * 0.5
  const stringToShort = (stringIndex: number): number => stringIndex * stringStep

  const toPoint = (longPos: number, shortPos: number) =>
    isHorizontal ? { x: longPos, y: shortPos } : { x: shortPos, y: longPos }

  const dots: RenderedDot[] = []
  const markers: RenderedMarker[] = []
  for (let i = 0; i < STRING_COUNT; i++) {
    const fret = shape.frets[i]
    const shortPos = stringToShort(i)
    if (fret === -1) {
      const p = toPoint(markerLong, shortPos)
      markers.push({ x: p.x, y: p.y, kind: 'muted', stringIndex: i })
    } else if (fret === 0) {
      const p = toPoint(markerLong, shortPos)
      markers.push({ x: p.x, y: p.y, kind: 'open', stringIndex: i })
    } else if (fret >= window.minFret && fret <= window.maxFret) {
      const p = toPoint(fretToLong(fret), shortPos)
      dots.push({ x: p.x, y: p.y, finger: shape.fingers[i], stringIndex: i })
    }
  }

  const barres: RenderedBarre[] = []
  for (const b of shape.barres) {
    if (b.fret < window.minFret || b.fret > window.maxFret) continue
    const longPos = fretToLong(b.fret)
    const shortStart = stringToShort(b.fromString)
    const shortEnd = stringToShort(b.toString)
    const dotDiameter = Math.min(fretStep, stringStep) * 0.6
    if (isHorizontal) {
      barres.push({
        x: longPos - dotDiameter / 2,
        y: shortStart - dotDiameter / 2,
        width: dotDiameter,
        height: shortEnd - shortStart + dotDiameter,
      })
    } else {
      barres.push({
        x: shortStart - dotDiameter / 2,
        y: longPos - dotDiameter / 2,
        width: shortEnd - shortStart + dotDiameter,
        height: dotDiameter,
      })
    }
  }

  return { dots, barres, markers }
}

export function describeShapeForA11y(shape: FretboardShape, chordName: string): string {
  const stringNames = ['low E', 'A', 'D', 'G', 'B', 'high E']
  const parts: string[] = []
  for (let i = 0; i < STRING_COUNT; i++) {
    const f = shape.frets[i]
    if (f === -1) parts.push(`${stringNames[i]} muted`)
    else if (f === 0) parts.push(`${stringNames[i]} open`)
    else parts.push(`${stringNames[i]} fret ${f}`)
  }
  return `${chordName}: ${parts.join(', ')}`
}
