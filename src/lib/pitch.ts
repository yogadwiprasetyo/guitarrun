const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export interface NoteReading {
  name: string    // "E"
  octave: number  // 4
  midi: number    // 64
  exactHz: number // target Hz of this note
}

export function hzToNote(hz: number): NoteReading {
  const midi = Math.round(69 + 12 * Math.log2(hz / 440))
  const name = NOTE_NAMES[((midi % 12) + 12) % 12]
  const octave = Math.floor(midi / 12) - 1
  const exactHz = 440 * Math.pow(2, (midi - 69) / 12)
  return { name, octave, midi, exactHz }
}

export function centsOff(hz: number, targetHz: number): number {
  return 1200 * Math.log2(hz / targetHz)
}

export type TuningMode = 'standard' | 'drop-d'

// Open string frequencies (Hz) — low E to high E
export const TUNINGS: Record<TuningMode, Array<{ name: string; hz: number; octave: number }>> = {
  standard: [
    { name: 'E', octave: 2, hz: 82.41 },
    { name: 'A', octave: 2, hz: 110.00 },
    { name: 'D', octave: 3, hz: 146.83 },
    { name: 'G', octave: 3, hz: 196.00 },
    { name: 'B', octave: 3, hz: 246.94 },
    { name: 'E', octave: 4, hz: 329.63 },
  ],
  'drop-d': [
    { name: 'D', octave: 2, hz: 73.42 },
    { name: 'A', octave: 2, hz: 110.00 },
    { name: 'D', octave: 3, hz: 146.83 },
    { name: 'G', octave: 3, hz: 196.00 },
    { name: 'B', octave: 3, hz: 246.94 },
    { name: 'E', octave: 4, hz: 329.63 },
  ],
}

export interface NearestString {
  index: number
  name: string
  octave: number
  hz: number
  cents: number // -50..+50 relative to nearest
}

function findNearest(hz: number, mode: TuningMode): { index: number; deltaOctaves: number } {
  const tuning = TUNINGS[mode]
  let best = 0
  let bestDelta = Infinity
  for (let i = 0; i < tuning.length; i++) {
    const delta = Math.abs(Math.log2(hz / tuning[i].hz))
    if (delta < bestDelta) {
      bestDelta = delta
      best = i
    }
  }
  return { index: best, deltaOctaves: bestDelta }
}

// Pitchy often locks onto the 2nd or 0.5× harmonic of a plucked string.
// If the raw hz is >0.5 octaves from every guitar string, try hz/2 and hz×2
// and pick whichever candidate lands closest to a string.
export function nearestString(hz: number, mode: TuningMode): NearestString {
  const tuning = TUNINGS[mode]
  const candidates = [hz, hz / 2, hz * 2]
  let bestHz = hz
  let bestIndex = 0
  let bestDelta = Infinity
  for (const c of candidates) {
    const r = findNearest(c, mode)
    if (r.deltaOctaves < bestDelta) {
      bestDelta = r.deltaOctaves
      bestIndex = r.index
      bestHz = c
    }
  }
  const target = tuning[bestIndex]
  return {
    index: bestIndex,
    name: target.name,
    octave: target.octave,
    hz: target.hz,
    cents: centsOff(bestHz, target.hz),
  }
}
