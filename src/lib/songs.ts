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
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  chordsUsed: string[]
  bpm: number
  timeline: ChordHit[]
  decade?: string
  tags?: string[]
  durationSeconds?: number   // v3.1 — for looped-timeline expansion
  lyrics?: LyricLine[]       // v3.2.1 — synced lyrics, sorted by t
  lyricsSource?: 'youtube-cc' | 'lrclib' | 'manual'
}

export type LyricLine = {
  t: number       // seconds from video start
  text: string
}

export function hasLyrics(song: Song): boolean {
  return Array.isArray(song.lyrics) && song.lyrics.length > 0
}

/**
 * If `song.timeline` is markedly shorter than the actual song length,
 * loop the chord progression at one-bar intervals until it covers the
 * full duration. Used for imported songs whose contributors only
 * provided a 4-chord verse loop.
 *
 * Returns the original timeline unchanged when:
 *  - no `durationSeconds` given (e.g. video duration unknown),
 *  - the timeline already covers ≥ 80% of the song,
 *  - the timeline is empty.
 *
 * Loop period defaults to (lastT − firstT + first interval) so the loop
 * picks up where it left off seamlessly.
 */
export function expandLoopingTimeline(
  song: Pick<Song, 'timeline' | 'bpm'>,
  durationSeconds: number | undefined,
  beatsPerBar = 4,
): ChordHit[] {
  const tl = song.timeline
  if (!durationSeconds || !Number.isFinite(durationSeconds)) return [...tl]
  if (tl.length === 0) return []
  const lastT = tl[tl.length - 1].t
  if (lastT >= durationSeconds * 0.8) return [...tl]

  const beatSeconds = 60 / Math.max(30, Math.min(220, song.bpm))
  const loopPeriod = beatSeconds * beatsPerBar
  const firstInterval = tl.length >= 2 ? tl[1].t - tl[0].t : loopPeriod
  const period = lastT - tl[0].t + firstInterval || loopPeriod

  const out: ChordHit[] = [...tl]
  let cycle = 1
  while (out[out.length - 1].t + firstInterval < durationSeconds) {
    const offset = period * cycle
    let added = 0
    for (const h of tl) {
      const nextT = h.t + offset
      if (nextT >= durationSeconds) break
      out.push({ ...h, t: Number(nextT.toFixed(2)) })
      added++
    }
    if (added === 0) break
    cycle++
    if (cycle > 1000) break // safety
  }
  return out
}

export function allChords(songs: Song[]): string[] {
  const s = new Set<string>()
  for (const song of songs) for (const c of song.chordsUsed) s.add(c)
  return [...s].sort()
}

export function filterSongs(
  songs: Song[],
  opts: {
    difficulty?: Song['difficulty']
    decade?: string
    chordSubset?: string[]
    hasLyrics?: boolean
  },
): Song[] {
  return songs.filter((s) => {
    if (opts.difficulty && s.difficulty !== opts.difficulty) return false
    if (opts.decade && s.decade !== opts.decade) return false
    if (typeof opts.hasLyrics === 'boolean' && hasLyrics(s) !== opts.hasLyrics) return false
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
