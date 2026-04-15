import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import ChordDiagram from '../components/ChordDiagram'
import ChordStrip from '../components/ChordStrip'
import ChordValidator from '../components/ChordValidator'
import { Fretboard } from '../components/Fretboard'
import { findSong } from '../lib/songs'
import { findChord } from '../lib/chords'
import {
  computeFretWindow,
  describeShapeForA11y,
  toFretboardShape,
  type FretboardShape,
} from '../lib/fretboard'
import { activeChordAt } from '../lib/timeline'
import { useYouTubePlayer } from '../hooks/useYouTubePlayer'

function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const r = Math.floor(s % 60)
  return `${m}:${r.toString().padStart(2, '0')}`
}

function useOrientationOnce(): 'horizontal' | 'vertical' {
  const [orientation] = useState<'horizontal' | 'vertical'>(() => {
    if (typeof window === 'undefined') return 'horizontal'
    return window.innerWidth <= 640 ? 'vertical' : 'horizontal'
  })
  return orientation
}

type DifficultyMode = 'beginner' | 'intermediate' | 'advanced' | 'original'
const MODE_OPTIONS: DifficultyMode[] = ['beginner', 'intermediate', 'advanced', 'original']

export default function PlayPage() {
  const { songId } = useParams<{ songId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const ytParam = searchParams.get('yt')
  const modeParam = (searchParams.get('mode') as DifficultyMode | null) ?? 'original'
  const mode: DifficultyMode = MODE_OPTIONS.includes(modeParam) ? modeParam : 'original'
  const song = songId ? findSong(songId) : undefined
  const exploreVideoId = !song && ytParam ? ytParam : null

  const setMode = (next: DifficultyMode) => {
    const params = new URLSearchParams(searchParams)
    if (next === 'original') params.delete('mode')
    else params.set('mode', next)
    setSearchParams(params, { replace: true })
  }
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
  }, [song?.youtubeId, exploreVideoId])

  const { status, currentTime, play, pause, seek } = useYouTubePlayer(
    song?.youtubeId ?? exploreVideoId ?? '',
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

  const orientation = useOrientationOnce()
  const { fretWindow, shapesByName } = useMemo(() => {
    if (!song) return { fretWindow: { minFret: 0, maxFret: 5 }, shapesByName: new Map<string, FretboardShape>() }
    const map = new Map<string, FretboardShape>()
    for (const name of song.chordsUsed) {
      const c = findChord(name)
      if (c?.positions[0]) map.set(name, toFretboardShape(c.positions[0]))
    }
    return { fretWindow: computeFretWindow([...map.values()]), shapesByName: map }
  }, [song])

  const currentFretShape = activeHit ? shapesByName.get(activeHit.chord) ?? null : null
  const nextFretShape = nextHit ? shapesByName.get(nextHit.chord) ?? null : null
  const fretAriaLabel = currentFretShape && activeHit
    ? describeShapeForA11y(currentFretShape, activeHit.chord)
    : 'Fretboard idle — press play'

  if (!song && !exploreVideoId) {
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

  if (!song && exploreVideoId) {
    return (
      <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-8 sm:pt-12 pb-24">
        <Link
          to="/"
          className="inline-block text-[11px] uppercase tracking-eyebrow text-ink-40 hover:text-ink transition-colors"
        >
          ← Songs
        </Link>
        <header className="mt-4 pb-8 border-b border-ink-20">
          <div className="text-[11px] uppercase tracking-eyebrow text-accent mb-2">
            Explore mode · auto-extraction queued
          </div>
          <h1 className="font-serif font-semibold leading-[0.98] tracking-[-0.025em] text-[clamp(36px,6vw,56px)]">
            New song · {exploreVideoId}
          </h1>
          <p className="font-serif italic text-[17px] text-ink-60 mt-3 max-w-xl">
            We can play this video, but the chord progression isn’t in the curated library yet.
            Auto chord/lyrics/BPM extraction ships in v3 Phase 3 (backend pipeline). Until
            then, see {' '}
            <Link to="/chords" className="text-accent underline">
              Chord Finder
            </Link>{' '}
            or contribute timing via {' '}
            <a
              href="https://github.com/yogadwiprasetyo/guitarrun/blob/main/docs/08-CONTRIBUTING.md"
              className="text-accent underline"
              target="_blank"
              rel="noreferrer"
            >
              the contribution guide
            </a>
            .
          </p>
        </header>

        <div className="mt-8 bg-surface border border-ink-20 aspect-video overflow-hidden">
          <div ref={holderRef} className="w-full h-full" />
        </div>
        {status === 'error' && (
          <div className="mt-3 text-[13px] text-accent font-serif italic">
            Video unavailable for embedding.
          </div>
        )}
      </div>
    )
  }

  if (!song) return null

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

        <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Difficulty mode">
          <span className="text-[11px] uppercase tracking-eyebrow text-ink-40 mr-2">Mode</span>
          {MODE_OPTIONS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors min-h-[32px] ${
                mode === m
                  ? 'bg-ink text-paper border-ink'
                  : 'border-ink-20 text-ink-60 hover:border-ink'
              }`}
            >
              {m}
            </button>
          ))}
          <span className="ml-2 text-[10px] text-ink-40 font-serif italic">
            (Beginner / Intermediate / Advanced substitution table — Phase 4)
          </span>
        </div>
      </header>

      <section
        className="mt-8 bg-surface border border-ink-20"
        style={{
          height: orientation === 'horizontal' ? 220 : 420,
          padding: 16,
          color: 'var(--color-ink, #1a1a1a)',
        }}
      >
        <Fretboard
          current={currentFretShape}
          next={nextFretShape}
          currentTime={currentTime}
          nextStartsAt={nextHit?.t ?? null}
          window={fretWindow}
          orientation={orientation}
          ariaLabel={fretAriaLabel}
        />
      </section>

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

      <div className="mt-6">
        <ChordValidator expectedChord={activeHit?.chord ?? null} />
      </div>
    </div>
  )
}
