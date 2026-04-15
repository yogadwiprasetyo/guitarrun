import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ChordDiagram from '../components/ChordDiagram'
import ChordStrip from '../components/ChordStrip'
import { findSong } from '../lib/songs'
import { findChord } from '../lib/chords'
import { activeChordAt } from '../lib/timeline'
import { useYouTubePlayer } from '../hooks/useYouTubePlayer'

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${r.toString().padStart(2, '0')}`
}

export default function PlayPage() {
  const { songId } = useParams<{ songId: string }>()
  const song = songId ? findSong(songId) : undefined
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const holderRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!holderRef.current) return
    const el = document.createElement('div')
    holderRef.current.innerHTML = ''
    holderRef.current.appendChild(el)
    setContainer(el)
    return () => {
      setContainer(null)
    }
  }, [song?.youtubeId])

  const { status, currentTime, play, pause, seek } = useYouTubePlayer(
    song?.youtubeId ?? '',
    container,
  )

  const active = useMemo(
    () => (song ? activeChordAt(song.timeline, currentTime) : null),
    [song, currentTime],
  )
  const activeHit = active?.hit ?? null
  const activeShape = activeHit ? findChord(activeHit.chord) : undefined
  const nextHit = active?.nextHit ?? null
  const nextShape = nextHit ? findChord(nextHit.chord) : undefined

  if (!song) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center">
        <h1 className="font-serif italic text-[clamp(48px,8vw,72px)] mb-3">Song not found.</h1>
        <Link
          to="/"
          className="inline-block text-[11px] uppercase tracking-eyebrow text-ink-40 hover:text-ink transition-colors"
        >
          ← Back to songs
        </Link>
      </div>
    )
  }

  const isPlaying = status === 'playing'

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-24">
      <Link
        to="/"
        className="inline-block text-[11px] uppercase tracking-eyebrow text-ink-40 hover:text-ink transition-colors"
      >
        ← Songs
      </Link>

      <header className="mt-4 pb-8 border-b border-ink-20">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span className="text-[11px] uppercase tracking-eyebrow text-accent nums-tabular">
            Now playing · {song.bpm} bpm
          </span>
          <span className="text-[11px] uppercase tracking-eyebrow text-ink-40">
            {song.difficulty}
          </span>
        </div>
        <h1 className="font-serif font-semibold leading-[0.98] tracking-[-0.025em] text-[clamp(44px,7vw,76px)] mt-2">
          {song.title}
        </h1>
        <p className="font-serif italic text-[20px] text-ink-60 mt-1">{song.artist}</p>
      </header>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)] gap-8 lg:gap-12">
        <div>
          <div className="bg-surface border border-ink-20 aspect-video overflow-hidden">
            <div ref={holderRef} className="w-full h-full" />
          </div>
          {status === 'error' && (
            <div className="mt-3 text-[13px] text-accent font-serif italic">
              Video unavailable for embedding. Try another song.
            </div>
          )}

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => (isPlaying ? pause() : play())}
              disabled={status === 'loading'}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-ink text-paper text-[14px] font-medium disabled:opacity-40 hover:bg-accent transition-colors min-h-[44px]"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              type="button"
              onClick={() => seek(Math.max(0, currentTime - 5))}
              className="px-4 py-2.5 rounded-full border border-ink-20 text-ink text-[13px] hover:border-ink transition-colors min-h-[44px]"
              aria-label="Skip back 5 seconds"
            >
              −5s
            </button>
            <button
              type="button"
              onClick={() => seek(currentTime + 5)}
              className="px-4 py-2.5 rounded-full border border-ink-20 text-ink text-[13px] hover:border-ink transition-colors min-h-[44px]"
              aria-label="Skip forward 5 seconds"
            >
              +5s
            </button>
            <span className="ml-auto text-[11px] uppercase tracking-eyebrow text-ink-40 nums-tabular">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        <aside>
          <div className="text-[11px] uppercase tracking-eyebrow text-ink-40 mb-4">
            On this bar
          </div>

          <div className="bg-surface border border-ink-20 px-7 py-8 flex flex-col items-center text-center">
            <div className="text-[11px] uppercase tracking-eyebrow text-accent mb-2">Now</div>
            <div className="font-serif font-semibold text-[clamp(64px,12vw,96px)] leading-none tracking-[-0.04em]">
              {activeHit?.chord ?? '—'}
            </div>
            <p className="font-serif italic text-[17px] text-ink-60 mt-3 max-w-[260px] min-h-[1.5em]">
              {activeHit?.lyric ?? (activeHit ? '— hold this shape —' : 'Press play to begin')}
            </p>

            <div className="mt-6 min-h-[180px] flex items-center justify-center">
              {activeShape ? (
                <ChordDiagram position={activeShape.positions[0]} size="md" />
              ) : activeHit ? (
                <div className="font-serif italic text-[14px] text-ink-40">
                  ({activeHit.chord} diagram missing)
                </div>
              ) : (
                <div className="w-[140px] h-[170px] border border-dashed border-ink-20" />
              )}
            </div>

            {nextHit && (
              <div className="mt-6 pt-5 border-t border-ink-20 w-full flex items-center justify-between gap-4">
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-eyebrow text-ink-40">Next</div>
                  <div className="font-serif text-[22px] font-semibold leading-tight">
                    {nextHit.chord}
                  </div>
                  <div className="text-[11px] text-ink-40 nums-tabular mt-0.5">
                    in {Math.max(0, nextHit.t - currentTime).toFixed(1)}s
                  </div>
                </div>
                {nextShape && <ChordDiagram position={nextShape.positions[0]} size="sm" />}
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="mt-10 pt-8 border-t border-ink-20">
        <ChordStrip
          timeline={song.timeline}
          activeIndex={active?.index ?? null}
          onSeek={seek}
        />
      </div>
    </div>
  )
}
