import { describe, it, expect } from 'vitest'
import type { ChordPosition } from './chords'
import {
  toFretboardShape,
  computeFretWindow,
  renderCoords,
} from './fretboard'

// Synthetic fixtures mirroring shapes from src/data/chords.json
const OPEN_G: ChordPosition = {
  frets: [3, 2, 0, 0, 0, 3],
  fingers: [2, 1, 0, 0, 0, 3],
  baseFret: 1,
}

const OPEN_C: ChordPosition = {
  frets: [-1, 3, 2, 0, 1, 0],
  fingers: [0, 3, 2, 0, 1, 0],
  baseFret: 1,
}

const OPEN_D: ChordPosition = {
  frets: [-1, -1, 0, 2, 3, 2],
  fingers: [0, 0, 0, 1, 3, 2],
  baseFret: 1,
}

const F_BARRE: ChordPosition = {
  frets: [1, 3, 3, 2, 1, 1],
  fingers: [1, 3, 4, 2, 1, 1],
  barres: [1],
  baseFret: 1,
}

const CM_HIGH: ChordPosition = {
  frets: [-1, 3, 5, 5, 4, 3],
  fingers: [0, 1, 3, 4, 2, 1],
  barres: [3],
  baseFret: 3,
}

const FINGERS_ALL_ZERO: ChordPosition = {
  frets: [3, 2, 0, 0, 0, 3],
  fingers: [0, 0, 0, 0, 0, 0],
  baseFret: 1,
}

describe('toFretboardShape', () => {
  it('preserves frets, fingers, and baseFret for an open chord', () => {
    const shape = toFretboardShape(OPEN_G)
    expect([...shape.frets]).toEqual([3, 2, 0, 0, 0, 3])
    expect([...shape.fingers]).toEqual([2, 1, 0, 0, 0, 3])
    expect(shape.baseFret).toBe(1)
    expect(shape.barres).toEqual([])
  })

  it('expands barres[] into {fromString, toString, fret} segments', () => {
    const shape = toFretboardShape(F_BARRE)
    expect(shape.barres).toHaveLength(1)
    expect(shape.barres[0]).toEqual({ fromString: 0, toString: 5, fret: 1 })
  })

  it('computes barre span from fretted strings only (skips muted)', () => {
    const shape = toFretboardShape(CM_HIGH)
    expect(shape.barres).toEqual([{ fromString: 1, toString: 5, fret: 3 }])
  })

  it('treats missing barres as empty array', () => {
    const shape = toFretboardShape(OPEN_D)
    expect(shape.barres).toEqual([])
  })

  it('keeps fingers array intact even when all zero (renderer falls back)', () => {
    const shape = toFretboardShape(FINGERS_ALL_ZERO)
    expect([...shape.fingers]).toEqual([0, 0, 0, 0, 0, 0])
  })
})

describe('computeFretWindow', () => {
  it('floors maxFret at 5 for open-position chords', () => {
    const win = computeFretWindow([toFretboardShape(OPEN_G), toFretboardShape(OPEN_C)])
    expect(win.minFret).toBe(0)
    expect(win.maxFret).toBe(5)
  })

  it('expands maxFret to fit higher shapes', () => {
    const win = computeFretWindow([toFretboardShape(CM_HIGH)])
    expect(win.maxFret).toBe(5) // Cm max absolute fret = 5
  })

  it('clamps maxFret at 12', () => {
    const HIGH: ChordPosition = {
      frets: [-1, 15, 17, 17, 15, -1],
      fingers: [0, 1, 3, 4, 1, 0],
      barres: [15],
      baseFret: 15,
    }
    const win = computeFretWindow([toFretboardShape(HIGH)])
    expect(win.maxFret).toBe(12)
  })

  it('ignores muted (-1) and open (0) when computing highest fret', () => {
    const win = computeFretWindow([toFretboardShape(OPEN_D)])
    expect(win.maxFret).toBe(5)
  })

  it('returns a stable window for an empty input', () => {
    const win = computeFretWindow([])
    expect(win).toEqual({ minFret: 0, maxFret: 5 })
  })
})

describe('renderCoords — horizontal', () => {
  const size = { width: 600, height: 180 }
  const window_ = { minFret: 0, maxFret: 5 }

  it('emits one dot per fretted string (fret > 0) for open G', () => {
    const shape = toFretboardShape(OPEN_G)
    const { dots } = renderCoords(shape, window_, 'horizontal', size)
    expect(dots.map((d) => d.stringIndex).sort()).toEqual([0, 1, 5])
  })

  it('emits markers for muted and open strings', () => {
    const shape = toFretboardShape(OPEN_C)
    const { markers } = renderCoords(shape, window_, 'horizontal', size)
    const kindsByString = Object.fromEntries(markers.map((m) => [m.stringIndex, m.kind]))
    expect(kindsByString[0]).toBe('muted')
    expect(kindsByString[3]).toBe('open')
    expect(kindsByString[5]).toBe('open')
  })

  it('emits one rounded barre rect for F barre', () => {
    const shape = toFretboardShape(F_BARRE)
    const { barres } = renderCoords(shape, window_, 'horizontal', size)
    expect(barres).toHaveLength(1)
    expect(barres[0].width).toBeGreaterThan(0)
    expect(barres[0].height).toBeGreaterThan(0)
  })

  it('keeps dots inside the width/height box', () => {
    const shape = toFretboardShape(OPEN_C)
    const { dots } = renderCoords(shape, window_, 'horizontal', size)
    for (const d of dots) {
      expect(d.x).toBeGreaterThanOrEqual(0)
      expect(d.x).toBeLessThanOrEqual(size.width)
      expect(d.y).toBeGreaterThanOrEqual(0)
      expect(d.y).toBeLessThanOrEqual(size.height)
    }
  })

  it('places a fret-1 dot to the left of a fret-3 dot (horizontal)', () => {
    const shape = toFretboardShape(F_BARRE)
    const { dots } = renderCoords(shape, window_, 'horizontal', size)
    const f1 = dots.find((d) => d.stringIndex === 0) // fret 1
    const f3 = dots.find((d) => d.stringIndex === 1) // fret 3
    expect(f1).toBeDefined()
    expect(f3).toBeDefined()
    expect(f1!.x).toBeLessThan(f3!.x)
  })
})

describe('renderCoords — vertical', () => {
  const size = { width: 180, height: 600 }
  const window_ = { minFret: 0, maxFret: 5 }

  it('swaps axes: fret-1 dot above fret-3 dot', () => {
    const shape = toFretboardShape(F_BARRE)
    const { dots } = renderCoords(shape, window_, 'vertical', size)
    const f1 = dots.find((d) => d.stringIndex === 0)
    const f3 = dots.find((d) => d.stringIndex === 1)
    expect(f1!.y).toBeLessThan(f3!.y)
  })
})
