import { useMemo } from 'react'
import type { Song } from '../lib/songs'
import { allChords } from '../lib/songs'

export interface SongFilterState {
  difficulty: Song['difficulty'] | 'all'
  decade: string | 'all'
  chordSubset: string[]
}

interface SongFilterBarProps {
  songs: Song[]
  value: SongFilterState
  onChange: (next: SongFilterState) => void
  matchCount: number
}

export default function SongFilterBar({ songs, value, onChange, matchCount }: SongFilterBarProps) {
  const decades = useMemo(() => {
    const s = new Set<string>()
    for (const song of songs) if (song.decade) s.add(song.decade)
    return [...s].sort()
  }, [songs])

  const chords = useMemo(() => allChords(songs), [songs])

  const toggleChord = (c: string) => {
    const next = value.chordSubset.includes(c)
      ? value.chordSubset.filter((x) => x !== c)
      : [...value.chordSubset, c]
    onChange({ ...value, chordSubset: next })
  }

  const reset = () => onChange({ difficulty: 'all', decade: 'all', chordSubset: [] })

  const hasActive =
    value.difficulty !== 'all' ||
    value.decade !== 'all' ||
    value.chordSubset.length > 0

  return (
    <div className="border border-ink-20 bg-surface p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3 mb-5">
        <div className="text-[11px] uppercase tracking-eyebrow text-ink-40">
          Filter · {matchCount} match{matchCount === 1 ? '' : 'es'}
        </div>
        {hasActive && (
          <button
            type="button"
            onClick={reset}
            className="text-[11px] uppercase tracking-eyebrow text-accent hover:text-ink transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-6 gap-y-4 items-baseline">
        <label className="text-[11px] uppercase tracking-eyebrow text-ink-40">Difficulty</label>
        <div className="flex flex-wrap gap-2">
          {(['all', 'beginner', 'intermediate'] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChange({ ...value, difficulty: d })}
              className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors min-h-[32px] ${
                value.difficulty === d
                  ? 'bg-ink text-paper border-ink'
                  : 'border-ink-20 text-ink-60 hover:border-ink'
              }`}
              aria-pressed={value.difficulty === d}
            >
              {d === 'all' ? 'Any' : d}
            </button>
          ))}
        </div>

        {decades.length > 0 && (
          <>
            <label className="text-[11px] uppercase tracking-eyebrow text-ink-40">Decade</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...value, decade: 'all' })}
                className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors min-h-[32px] ${
                  value.decade === 'all'
                    ? 'bg-ink text-paper border-ink'
                    : 'border-ink-20 text-ink-60 hover:border-ink'
                }`}
                aria-pressed={value.decade === 'all'}
              >
                Any
              </button>
              {decades.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onChange({ ...value, decade: d })}
                  className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors min-h-[32px] ${
                    value.decade === d
                      ? 'bg-ink text-paper border-ink'
                      : 'border-ink-20 text-ink-60 hover:border-ink'
                  }`}
                  aria-pressed={value.decade === d}
                >
                  {d}
                </button>
              ))}
            </div>
          </>
        )}

        <label className="text-[11px] uppercase tracking-eyebrow text-ink-40 self-start pt-1">
          Chord set
        </label>
        <div>
          <p className="text-[11px] text-ink-40 mb-2 font-serif italic">
            Show songs that use <strong>only</strong> the chords you pick.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {chords.map((c) => {
              const active = value.chordSubset.includes(c)
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleChord(c)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors min-h-[28px] nums-tabular ${
                    active
                      ? 'bg-accent text-paper border-accent'
                      : 'border-ink-20 text-ink-60 hover:border-ink'
                  }`}
                  aria-pressed={active}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
