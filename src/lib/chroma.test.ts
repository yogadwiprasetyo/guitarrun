import { describe, it, expect } from 'vitest'
import { chromaFromSpectrum, cosine, isMatch, matchChord, normalize } from './chroma'

const PC_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function spectrumForPitchClasses(pcs: number[], sampleRate = 44100, fftSize = 4096): number[] {
  const binWidth = sampleRate / (2 * fftSize)
  const out = new Array<number>(fftSize / 2).fill(0)
  for (const pc of pcs) {
    for (const octave of [3, 4, 5]) {
      const midi = pc + 12 * (octave + 1)
      const f = 440 * Math.pow(2, (midi - 69) / 12)
      const idx = Math.round(f / binWidth)
      if (idx > 0 && idx < out.length) out[idx] = 1
    }
  }
  return out
}

describe('normalize / cosine', () => {
  it('normalizes to unit magnitude', () => {
    const v = normalize([3, 0, 4, 0])
    expect(Math.hypot(...v)).toBeCloseTo(1, 5)
  })
  it('returns zero on zero input', () => {
    expect(normalize([0, 0, 0])).toEqual([0, 0, 0])
  })
  it('cosine of identical vectors is 1', () => {
    expect(cosine([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 5)
  })
  it('cosine of orthogonal vectors is 0', () => {
    expect(cosine([1, 0], [0, 1])).toBe(0)
  })
})

describe('chromaFromSpectrum', () => {
  it('peaks at C for a C-only spectrum', () => {
    const c = PC_NAMES.indexOf('C')
    const spectrum = spectrumForPitchClasses([c])
    const chroma = chromaFromSpectrum(spectrum, 44100, 4096)
    const peak = chroma.indexOf(Math.max(...chroma))
    expect(peak).toBe(c)
  })
})

describe('matchChord', () => {
  it('identifies C major chord (C-E-G)', () => {
    const spectrum = spectrumForPitchClasses([
      PC_NAMES.indexOf('C'),
      PC_NAMES.indexOf('E'),
      PC_NAMES.indexOf('G'),
    ])
    const chroma = chromaFromSpectrum(spectrum, 44100, 4096)
    const result = matchChord(chroma)
    expect(result.name).toBe('C')
    expect(result.similarity).toBeGreaterThan(0.9)
  })

  it('identifies A minor chord (A-C-E)', () => {
    const spectrum = spectrumForPitchClasses([
      PC_NAMES.indexOf('A'),
      PC_NAMES.indexOf('C'),
      PC_NAMES.indexOf('E'),
    ])
    const chroma = chromaFromSpectrum(spectrum, 44100, 4096)
    const result = matchChord(chroma)
    expect(result.name).toBe('Am')
  })

  it('identifies G major chord (G-B-D)', () => {
    const spectrum = spectrumForPitchClasses([
      PC_NAMES.indexOf('G'),
      PC_NAMES.indexOf('B'),
      PC_NAMES.indexOf('D'),
    ])
    const chroma = chromaFromSpectrum(spectrum, 44100, 4096)
    const result = matchChord(chroma)
    expect(result.name).toBe('G')
  })

  it('honors a candidate-name filter', () => {
    const spectrum = spectrumForPitchClasses([
      PC_NAMES.indexOf('C'),
      PC_NAMES.indexOf('E'),
      PC_NAMES.indexOf('G'),
    ])
    const chroma = chromaFromSpectrum(spectrum, 44100, 4096)
    const result = matchChord(chroma, ['Am', 'Em', 'Dm'])
    expect(['Am', 'Em', 'Dm']).toContain(result.name)
  })
})

describe('isMatch', () => {
  it('passes when name matches and thresholds met', () => {
    expect(isMatch({ name: 'G', similarity: 0.95, margin: 0.1 }, 'G')).toBe(true)
  })
  it('fails on name mismatch even with high similarity', () => {
    expect(isMatch({ name: 'G', similarity: 0.95, margin: 0.1 }, 'C')).toBe(false)
  })
  it('fails when margin too small', () => {
    expect(isMatch({ name: 'G', similarity: 0.95, margin: 0.01 }, 'G')).toBe(false)
  })
  it('is case-insensitive on chord name', () => {
    expect(isMatch({ name: 'c', similarity: 0.95, margin: 0.1 }, 'C')).toBe(true)
  })
})
