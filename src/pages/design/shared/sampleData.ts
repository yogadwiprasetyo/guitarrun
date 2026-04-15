import { findSong } from '../../../lib/songs'
import { findChord } from '../../../lib/chords'
import type { Song } from '../../../lib/songs'
import type { ChordShape } from '../../../lib/chords'

export const SAMPLE_SONG: Song =
  findSong('wonderwall-oasis') ?? {
    id: 'wonderwall-oasis',
    title: 'Wonderwall',
    artist: 'Oasis',
    youtubeId: 'bx1Bh8ZvH84',
    difficulty: 'beginner',
    chordsUsed: ['Em7', 'G', 'Dsus4', 'A7sus4', 'Cadd9'],
    bpm: 87,
    timeline: [],
  }

export const SAMPLE_ACTIVE_INDEX = 4
export const SAMPLE_CURRENT_TIME = 18.2
export const SAMPLE_DURATION = 263

export const SAMPLE_CHORDS: ChordShape[] = SAMPLE_SONG.chordsUsed
  .map((name) => findChord(name))
  .filter((c): c is ChordShape => c !== undefined)

export const SAMPLE_TUNER = {
  noteName: 'E',
  octave: 2,
  targetName: 'E',
  targetHz: 82.41,
  hz: 81.7,
  cents: -14,
}

export const SAMPLE_TUNER_IN = {
  noteName: 'A',
  octave: 2,
  targetName: 'A',
  targetHz: 110.0,
  hz: 110.05,
  cents: 1,
}

export type DesignTab = 'player' | 'tuner' | 'chords'

export const TAB_LABELS: Record<DesignTab, string> = {
  player: 'Player',
  tuner: 'Tuner',
  chords: 'Chord Finder',
}

export function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${r.toString().padStart(2, '0')}`
}
