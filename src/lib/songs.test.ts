import { describe, it, expect } from 'vitest'
import { expandLoopingTimeline, filterSongs, allChords } from './songs'
import type { ChordHit } from './songs'

const FOUR_HIT_LOOP: ChordHit[] = [
  { t: 0, chord: 'C' },
  { t: 4, chord: 'G' },
  { t: 8, chord: 'Am' },
  { t: 12, chord: 'F' },
]

describe('expandLoopingTimeline', () => {
  it('returns timeline unchanged when durationSeconds is undefined', () => {
    const out = expandLoopingTimeline({ timeline: FOUR_HIT_LOOP, bpm: 60 }, undefined)
    expect(out).toEqual(FOUR_HIT_LOOP)
  })

  it('returns timeline unchanged when it already covers ≥80% of song', () => {
    const out = expandLoopingTimeline({ timeline: FOUR_HIT_LOOP, bpm: 60 }, 14)
    expect(out).toEqual(FOUR_HIT_LOOP)
  })

  it('loops the progression to fill a 60s song', () => {
    const out = expandLoopingTimeline({ timeline: FOUR_HIT_LOOP, bpm: 60 }, 60)
    expect(out.length).toBeGreaterThan(FOUR_HIT_LOOP.length)
    for (let i = 1; i < out.length; i++) {
      expect(out[i].t).toBeGreaterThan(out[i - 1].t)
    }
    expect(out[out.length - 1].t).toBeLessThan(60)
    const chords = out.map((h) => h.chord)
    expect(chords.slice(0, 4)).toEqual(['C', 'G', 'Am', 'F'])
    expect(chords.slice(4, 8)).toEqual(['C', 'G', 'Am', 'F'])
  })

  it('preserves the original first hit at t=0', () => {
    const out = expandLoopingTimeline({ timeline: FOUR_HIT_LOOP, bpm: 60 }, 60)
    expect(out[0]).toEqual({ t: 0, chord: 'C' })
  })

  it('empty timeline stays empty', () => {
    expect(expandLoopingTimeline({ timeline: [], bpm: 120 }, 200)).toEqual([])
  })

  it('clamps absurd bpms via internal Math.max/min and still loops', () => {
    const out = expandLoopingTimeline({ timeline: FOUR_HIT_LOOP, bpm: 9999 }, 60)
    expect(out.length).toBeGreaterThan(FOUR_HIT_LOOP.length)
  })
})

describe('filterSongs / allChords', () => {
  const songs = [
    {
      id: 'a',
      title: 'A',
      artist: 'X',
      youtubeId: '12345678901',
      difficulty: 'beginner' as const,
      chordsUsed: ['C', 'G'],
      bpm: 90,
      timeline: [{ t: 0, chord: 'C' }],
      decade: '70s',
    },
    {
      id: 'b',
      title: 'B',
      artist: 'Y',
      youtubeId: '12345678902',
      difficulty: 'advanced' as const,
      chordsUsed: ['F', 'Bm'],
      bpm: 120,
      timeline: [{ t: 0, chord: 'F' }],
      decade: '80s',
    },
  ]

  it('filters by difficulty', () => {
    expect(filterSongs(songs, { difficulty: 'beginner' })).toHaveLength(1)
    expect(filterSongs(songs, { difficulty: 'advanced' })).toHaveLength(1)
  })
  it('filters by decade', () => {
    expect(filterSongs(songs, { decade: '70s' })).toHaveLength(1)
  })
  it('chord subset filter requires all chords in the subset', () => {
    expect(filterSongs(songs, { chordSubset: ['C', 'G'] })).toHaveLength(1)
    expect(filterSongs(songs, { chordSubset: ['C'] })).toHaveLength(0)
  })
  it('allChords aggregates + dedupes + sorts', () => {
    expect(allChords(songs)).toEqual(['Bm', 'C', 'F', 'G'])
  })
})
