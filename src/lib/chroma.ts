// Chromagram analysis + chord template matching for live mic input.
// Headphones rule: assumes the mic captures only the player's guitar,
// so the backing track does not pollute the chroma vector.

export type Chroma = ReadonlyArray<number> // length 12, normalized

export interface ChordCandidate {
  name: string
  similarity: number
  margin: number
}

const QUALITY_TEMPLATES: Record<string, number[]> = {
  '':    [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
  'm':   [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
  '7':   [1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
  'm7':  [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0],
  'maj7':[1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
}

const ROOTS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

interface NamedTemplate {
  name: string
  vec: ReadonlyArray<number>
}

let TEMPLATES_CACHE: NamedTemplate[] | null = null
function getTemplates(): NamedTemplate[] {
  if (TEMPLATES_CACHE) return TEMPLATES_CACHE
  const out: NamedTemplate[] = []
  for (const [quality, base] of Object.entries(QUALITY_TEMPLATES)) {
    for (let r = 0; r < 12; r++) {
      const vec = new Array<number>(12)
      for (let i = 0; i < 12; i++) vec[i] = base[(i - r + 12) % 12]
      out.push({ name: ROOTS[r] + quality, vec: normalize(vec) })
    }
  }
  TEMPLATES_CACHE = out
  return out
}

export function normalize(v: ReadonlyArray<number>): number[] {
  let mag = 0
  for (const x of v) mag += x * x
  mag = Math.sqrt(mag)
  if (mag === 0) return v.slice()
  return v.map((x) => x / mag)
}

export function cosine(a: ReadonlyArray<number>, b: ReadonlyArray<number>): number {
  let dot = 0, ma = 0, mb = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    ma += a[i] * a[i]
    mb += b[i] * b[i]
  }
  if (ma === 0 || mb === 0) return 0
  return dot / Math.sqrt(ma * mb)
}

export function chromaFromSpectrum(
  freqMagnitudes: Float32Array | Uint8Array | number[],
  sampleRate: number,
  fftSize: number,
  options: { minHz?: number; maxHz?: number } = {},
): number[] {
  const minHz = options.minHz ?? 80
  const maxHz = options.maxHz ?? 1500
  const binWidth = sampleRate / (2 * fftSize)
  const acc = new Array<number>(12).fill(0)
  for (let i = 1; i < freqMagnitudes.length; i++) {
    const f = i * binWidth
    if (f < minHz || f > maxHz) continue
    const pitch = 12 * Math.log2(f / 440) + 9
    const pc = ((Math.round(pitch) % 12) + 12) % 12
    const amp = Number(freqMagnitudes[i])
    acc[pc] += amp
  }
  return normalize(acc)
}

export function matchChord(
  chroma: ReadonlyArray<number>,
  candidates: ReadonlyArray<string> | null = null,
): ChordCandidate {
  const all = getTemplates()
  const pool = candidates ? all.filter((t) => candidates.includes(t.name)) : all
  if (pool.length === 0) return { name: '', similarity: 0, margin: 0 }
  let best: NamedTemplate = pool[0]
  let bestSim = -1
  let runnerUp = -1
  for (const t of pool) {
    const sim = cosine(chroma, t.vec)
    if (sim > bestSim) {
      runnerUp = bestSim
      bestSim = sim
      best = t
    } else if (sim > runnerUp) {
      runnerUp = sim
    }
  }
  return {
    name: best.name,
    similarity: Math.max(0, bestSim),
    margin: Math.max(0, bestSim - Math.max(0, runnerUp)),
  }
}

export function isMatch(
  candidate: ChordCandidate,
  expected: string,
  thresholds: { similarity?: number; margin?: number } = {},
): boolean {
  const simMin = thresholds.similarity ?? 0.7
  const marginMin = thresholds.margin ?? 0.04
  return (
    candidate.name.toLowerCase() === expected.toLowerCase() &&
    candidate.similarity >= simMin &&
    candidate.margin >= marginMin
  )
}
