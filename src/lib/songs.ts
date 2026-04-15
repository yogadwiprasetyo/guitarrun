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
}

export const songs: Song[] = raw as Song[]

export function findSong(id: string): Song | undefined {
  return songs.find((s) => s.id === id)
}
