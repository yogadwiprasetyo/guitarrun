import { describe, it, expect } from 'vitest'
import {
  groupTimelineIntoLines,
  findActiveLineIndex,
  chordOverlayPositions,
} from './lyrics'

describe('groupTimelineIntoLines', () => {
  it('returns empty array when no hit has a lyric', () => {
    expect(groupTimelineIntoLines([
      { t: 0, chord: 'C' },
      { t: 4, chord: 'G' },
    ])).toEqual([])
  })

  it('opens a new line per hit with a non-empty lyric', () => {
    const lines = groupTimelineIntoLines([
      { t: 0, chord: 'C', lyric: 'Hello' },
      { t: 4, chord: 'G', lyric: 'World' },
    ])
    expect(lines).toHaveLength(2)
    expect(lines[0].lyric).toBe('Hello')
    expect(lines[1].lyric).toBe('World')
  })

  it('folds lyric-less hits into the current line as chord changes', () => {
    const lines = groupTimelineIntoLines([
      { t: 0, chord: 'Em7', lyric: 'Today is gonna be the day' },
      { t: 2, chord: 'G' },
      { t: 4, chord: 'Cadd9' },
      { t: 8, chord: 'G', lyric: 'Anybody else but you' },
    ])
    expect(lines).toHaveLength(2)
    expect(lines[0].hits.map((h) => h.chord)).toEqual(['Em7', 'G', 'Cadd9'])
    expect(lines[1].hits.map((h) => h.chord)).toEqual(['G'])
  })

  it('endT of each line equals next line startT', () => {
    const lines = groupTimelineIntoLines([
      { t: 0, chord: 'C', lyric: 'A' },
      { t: 5, chord: 'G', lyric: 'B' },
      { t: 9, chord: 'Am', lyric: 'C' },
    ])
    expect(lines[0].endT).toBe(5)
    expect(lines[1].endT).toBe(9)
    expect(lines[2].endT).toBeGreaterThan(9)
  })

  it('treats whitespace-only lyrics as no lyric', () => {
    const lines = groupTimelineIntoLines([
      { t: 0, chord: 'C', lyric: '   ' },
      { t: 4, chord: 'G', lyric: 'Real line' },
    ])
    expect(lines).toHaveLength(1)
    expect(lines[0].lyric).toBe('Real line')
  })

  it('drops hits before the first lyric (orphans)', () => {
    const lines = groupTimelineIntoLines([
      { t: 0, chord: 'C' },
      { t: 1, chord: 'G' },
      { t: 4, chord: 'Am', lyric: 'First sung line' },
    ])
    expect(lines).toHaveLength(1)
    expect(lines[0].hits).toHaveLength(1)
  })
})

describe('findActiveLineIndex', () => {
  const lines = groupTimelineIntoLines([
    { t: 0, chord: 'C', lyric: 'one' },
    { t: 5, chord: 'G', lyric: 'two' },
    { t: 10, chord: 'Am', lyric: 'three' },
  ])

  it('returns -1 before first line', () => {
    expect(findActiveLineIndex(lines, -1)).toBe(-1)
  })
  it('returns 0 inside first line', () => {
    expect(findActiveLineIndex(lines, 2)).toBe(0)
  })
  it('returns 1 right at the start of second line', () => {
    expect(findActiveLineIndex(lines, 5)).toBe(1)
  })
  it('returns last index past the final line (sticks)', () => {
    expect(findActiveLineIndex(lines, 9999)).toBe(2)
  })
  it('returns -1 for empty input', () => {
    expect(findActiveLineIndex([], 0)).toBe(-1)
  })
})

describe('chordOverlayPositions', () => {
  it('first chord at offset 0, intermediate clamped to fraction', () => {
    const lines = groupTimelineIntoLines([
      { t: 0, chord: 'C', lyric: 'a' },
      { t: 2, chord: 'G' },
      { t: 4, chord: 'Am', lyric: 'b' },
    ])
    const ov = chordOverlayPositions(lines[0])
    expect(ov[0]).toEqual({ chord: 'C', offset: 0 })
    expect(ov[1].chord).toBe('G')
    expect(ov[1].offset).toBeCloseTo(0.5, 5)
  })
})
