import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SongCard from '../components/SongCard'
import SongFilterBar, { type SongFilterState } from '../components/SongFilterBar'
import SongUrlInput from '../components/SongUrlInput'
import RecentlyPlayed from '../components/RecentlyPlayed'
import { filterSongs, songs } from '../lib/songs'

const INITIAL_FILTER: SongFilterState = {
  difficulty: 'all',
  decade: 'all',
  chordSubset: [],
}

export default function HomePage() {
  const [filter, setFilter] = useState<SongFilterState>(INITIAL_FILTER)

  const results = useMemo(
    () =>
      filterSongs(songs, {
        difficulty: filter.difficulty === 'all' ? undefined : filter.difficulty,
        decade: filter.decade === 'all' ? undefined : filter.decade,
        chordSubset: filter.chordSubset,
      }),
    [filter],
  )

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-20">
      <section className="pb-12 sm:pb-16 border-b border-ink-20">
        <div className="text-[11px] uppercase tracking-eyebrow text-ink-40 mb-6">
          A quiet practice companion
        </div>
        <h1 className="font-serif font-semibold leading-[0.98] tracking-[-0.025em] text-[clamp(44px,8vw,84px)]">
          Play the song
          <span className="block italic font-normal text-accent">you actually like.</span>
        </h1>
        <p className="mt-7 max-w-xl font-serif text-[18px] leading-[1.5] text-ink-60">
          Pick a song. Watch the video. The chord you need right now is front and center,
          synced to the music. No signup, no ads &mdash; just the guitar on your lap.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/tuner"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-ink text-paper text-[14px] font-medium hover:bg-accent transition-colors"
          >
            Tune up first
            <span aria-hidden="true">&rarr;</span>
          </Link>
          <Link
            to="/chords"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-ink-20 text-ink text-[14px] font-medium hover:border-ink transition-colors"
          >
            Chord library
          </Link>
          <Link
            to="/trainer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-ink-20 text-ink text-[14px] font-medium hover:border-ink transition-colors"
          >
            Chord trainer
          </Link>
        </div>
      </section>

      <section className="pt-10 sm:pt-14">
        <div className="mb-8">
          <SongUrlInput />
        </div>

        <div className="mb-8">
          <RecentlyPlayed />
        </div>

        <div className="flex items-baseline justify-between mb-6 gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-eyebrow text-ink-40 mb-1">
              Curated library
            </div>
            <h2 className="font-serif italic text-[28px] sm:text-[36px] font-normal text-ink">
              Start here
            </h2>
          </div>
          <span className="text-[11px] uppercase tracking-eyebrow text-ink-40 nums-tabular">
            {songs.length} song{songs.length === 1 ? '' : 's'}
          </span>
        </div>

        <div className="mb-6">
          <SongFilterBar
            songs={songs}
            value={filter}
            onChange={setFilter}
            matchCount={results.length}
          />
        </div>

        {results.length === 0 ? (
          <div className="border border-dashed border-ink-20 py-16 text-center font-serif italic text-ink-60">
            No songs match these filters. Try clearing them.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-ink-20 border border-ink-20">
            {results.map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
