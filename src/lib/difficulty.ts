// v3 P4 — chord-substitution table for Beginner/Intermediate modes.
// Mode selector on PlayPage rewires song.timeline + song.chordsUsed
// through this module so the fretboard shows the simpler shape.
//
// Original / Advanced: pass-through.
// Beginner: aggressive — every chord lands in the open-position 8-set
//           plus a few common open-voicing extensions.
// Intermediate: only swaps full-barre shapes for nearby open voicings.

export type DifficultyMode = 'beginner' | 'intermediate' | 'advanced' | 'original'

const BEGINNER_SUBS: Record<string, string> = {
  F: 'C',
  Fm: 'Em',
  'F#': 'G',
  'F#m': 'Em',
  Bb: 'A',
  Bbm: 'Am',
  B: 'A',
  Bm: 'Em',
  'C#m': 'Am',
  'D#m': 'Em',
  'G#m': 'Am',
  G7: 'G',
  C7: 'C',
  D7: 'D',
  A7: 'A',
  E7: 'E',
  B7: 'A',
  F7: 'C',
  Em7: 'Em',
  Am7: 'Am',
  Dm7: 'Dm',
  Cmaj7: 'C',
  Dmaj7: 'D',
  Gmaj7: 'G',
  Amaj7: 'A',
  Emaj7: 'E',
  Fmaj7: 'C',
  Csus4: 'C',
  Dsus4: 'D',
  Gsus4: 'G',
  Asus4: 'A',
  Esus4: 'E',
  A7sus4: 'A',
  Csus2: 'C',
  Dsus2: 'D',
  Gsus2: 'G',
  Asus2: 'A',
  Cadd9: 'C',
  Dadd9: 'D',
  Gadd9: 'G',
}

const INTERMEDIATE_SUBS: Record<string, string> = {
  F: 'Fmaj7',
  Bb: 'A',
  B: 'A',
  Bm: 'Bm7',
  'F#': 'G',
  'F#m': 'Em',
  'C#m': 'Am',
  'G#m': 'Am',
  Bbm: 'Am',
  'D#m': 'Em',
}

export function simplifyChord(name: string, mode: DifficultyMode): string {
  if (mode === 'original' || mode === 'advanced') return name
  const table = mode === 'beginner' ? BEGINNER_SUBS : INTERMEDIATE_SUBS
  return table[name] ?? name
}

export function simplifyTimeline<T extends { chord: string }>(
  timeline: ReadonlyArray<T>,
  mode: DifficultyMode,
): T[] {
  if (mode === 'original' || mode === 'advanced') return [...timeline]
  return timeline.map((h) => ({ ...h, chord: simplifyChord(h.chord, mode) }))
}

export function simplifyChordSet(chords: ReadonlyArray<string>, mode: DifficultyMode): string[] {
  if (mode === 'original' || mode === 'advanced') return [...chords]
  const out = new Set<string>()
  for (const c of chords) out.add(simplifyChord(c, mode))
  return [...out]
}

export interface SubstitutionSummary {
  count: number
  pairs: ReadonlyArray<[string, string]>
}

export function summarizeSubstitutions(
  originals: ReadonlyArray<string>,
  mode: DifficultyMode,
): SubstitutionSummary {
  if (mode === 'original' || mode === 'advanced') return { count: 0, pairs: [] }
  const seen = new Set<string>()
  const pairs: Array<[string, string]> = []
  for (const c of originals) {
    if (seen.has(c)) continue
    seen.add(c)
    const next = simplifyChord(c, mode)
    if (next !== c) pairs.push([c, next])
  }
  return { count: pairs.length, pairs }
}
