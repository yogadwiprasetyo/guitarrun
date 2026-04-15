import { describe, it, expect } from 'vitest'
import {
  simplifyChord,
  simplifyTimeline,
  simplifyChordSet,
  summarizeSubstitutions,
} from './difficulty'

describe('simplifyChord', () => {
  it('passes through in original mode', () => {
    expect(simplifyChord('F', 'original')).toBe('F')
    expect(simplifyChord('Bm', 'original')).toBe('Bm')
  })
  it('passes through in advanced mode', () => {
    expect(simplifyChord('Bb', 'advanced')).toBe('Bb')
  })
  it('substitutes barre chords for beginner', () => {
    expect(simplifyChord('F', 'beginner')).toBe('C')
    expect(simplifyChord('Bm', 'beginner')).toBe('Em')
    expect(simplifyChord('Bb', 'beginner')).toBe('A')
  })
  it('reduces extensions to triads in beginner', () => {
    expect(simplifyChord('Cmaj7', 'beginner')).toBe('C')
    expect(simplifyChord('Dsus4', 'beginner')).toBe('D')
    expect(simplifyChord('A7sus4', 'beginner')).toBe('A')
  })
  it('keeps open chords as-is in beginner', () => {
    for (const c of ['G', 'C', 'D', 'Em', 'Am', 'E', 'A', 'Dm']) {
      expect(simplifyChord(c, 'beginner')).toBe(c)
    }
  })
  it('intermediate keeps most chords, swaps full barres', () => {
    expect(simplifyChord('F', 'intermediate')).toBe('Fmaj7')
    expect(simplifyChord('Bm', 'intermediate')).toBe('Bm7')
    expect(simplifyChord('Cmaj7', 'intermediate')).toBe('Cmaj7')
  })
  it('returns input unchanged when no substitution exists', () => {
    expect(simplifyChord('Xmaj13', 'beginner')).toBe('Xmaj13')
  })
})

describe('simplifyTimeline', () => {
  it('rewrites chord field while preserving t and lyric', () => {
    const tl = [
      { t: 0, chord: 'F', lyric: 'first' },
      { t: 2, chord: 'C', lyric: 'second' },
    ]
    const out = simplifyTimeline(tl, 'beginner')
    expect(out).toEqual([
      { t: 0, chord: 'C', lyric: 'first' },
      { t: 2, chord: 'C', lyric: 'second' },
    ])
  })
  it('returns a new array (immutability)', () => {
    const tl = [{ t: 0, chord: 'F' }]
    const out = simplifyTimeline(tl, 'beginner')
    expect(out).not.toBe(tl)
  })
  it('passes through in original mode', () => {
    const tl = [{ t: 0, chord: 'Bm' }]
    expect(simplifyTimeline(tl, 'original')).toEqual(tl)
  })
})

describe('simplifyChordSet', () => {
  it('dedupes after substitution', () => {
    const out = simplifyChordSet(['F', 'C', 'Fmaj7'], 'beginner')
    expect(out.sort()).toEqual(['C'])
  })
})

describe('summarizeSubstitutions', () => {
  it('lists the pairs that were swapped', () => {
    const s = summarizeSubstitutions(['F', 'Bm', 'C'], 'beginner')
    expect(s.count).toBe(2)
    expect(s.pairs).toEqual([
      ['F', 'C'],
      ['Bm', 'Em'],
    ])
  })
  it('is empty for original mode', () => {
    expect(summarizeSubstitutions(['F', 'Bm'], 'original')).toEqual({ count: 0, pairs: [] })
  })
})
