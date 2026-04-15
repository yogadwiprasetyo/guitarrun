import raw from '../data/songs.json'

export type ChordHit = {
  t: number       // seconds from video start
  chord: string   // chord name (must exist in chords.json)
  lyric?: string
}

export type Song = {
  id: string
  title: string
  artist: string
  youtubeId: string
  difficulty: 'beginner' | 'intermediate'
  chordsUsed: string[]
  bpm: number
  timeline: ChordHit[]
  decade?: string
  tags?: string[]
}

export function allChords(songs: Song[]): string[] {
  const s = new Set<string>()
  for (const song of songs) for (const c of song.chordsUsed) s.add(c)
  return [...s].sort()
}

export function filterSongs(
  songs: Song[],
  opts: { difficulty?: Song['difficulty']; decade?: string; chordSubset?: string[] },
): Song[] {
  return songs.filter((s) => {
    if (opts.difficulty && s.difficulty !== opts.difficulty) return false
    if (opts.decade && s.decade !== opts.decade) return false
    if (opts.chordSubset && opts.chordSubset.length > 0) {
      const pool = new Set(opts.chordSubset)
      return s.chordsUsed.every((c) => pool.has(c))
    }
    return true
  })
}

export const songs: Song[] = raw as Song[]

export function findSong(id: string): Song | undefined {
  return songs.find((s) => s.id === id)
}
