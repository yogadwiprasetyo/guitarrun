import raw from '../data/chords.json'

export type ChordPosition = {
  frets: number[]   // 6 items, low E → high E; -1 muted
  fingers: number[] // 0 open / no finger; 1-4 fingers
  barres?: number[] // fret numbers where a barre sits
  baseFret: number  // 1 = open; otherwise top of fretboard display
}

export type ChordShape = {
  name: string
  notes: string[]
  positions: ChordPosition[]
}

export const chords: ChordShape[] = raw as ChordShape[]

export function findChord(name: string): ChordShape | undefined {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, '')
  return chords.find((c) => c.name.toLowerCase() === normalized)
}

export function searchChords(query: string): ChordShape[] {
  const q = query.trim().toLowerCase().replace(/\s+/g, '')
  if (!q) return chords
  // Exact match first, then prefix, then substring
  const exact: ChordShape[] = []
  const prefix: ChordShape[] = []
  const contains: ChordShape[] = []
  for (const c of chords) {
    const n = c.name.toLowerCase()
    if (n === q) exact.push(c)
    else if (n.startsWith(q)) prefix.push(c)
    else if (n.includes(q)) contains.push(c)
  }
  return [...exact, ...prefix, ...contains]
}
