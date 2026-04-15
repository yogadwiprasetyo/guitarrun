import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Fretboard } from '../components/Fretboard'
import TapTempo from '../components/TapTempo'
import { chords, findChord } from '../lib/chords'
import {
  computeFretWindow,
  describeShapeForA11y,
  toFretboardShape,
} from '../lib/fretboard'

type Status = 'idle' | 'running' | 'done'

const DEFAULT_POOL = ['G', 'C', 'D', 'Em', 'Am', 'E', 'A', 'Dm']
const DURATION_OPTIONS: Array<{ label: string; seconds: number | null }> = [
  { label: '60 s', seconds: 60 },
  { label: '2 min', seconds: 120 },
  { label: '5 min', seconds: 300 },
  { label: 'Endless', seconds: null },
]

export default function TrainerPage() {
  const allBeginnerChords = useMemo(
    () => chords.filter((c) => c.name.length <= 4).map((c) => c.name),
    [],
  )

  const [pool, setPool] = useState<string[]>(DEFAULT_POOL)
  const [bpm, setBpm] = useState(60)
  const [duration, setDuration] = useState<number | null>(120)
  const [status, setStatus] = useState<Status>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [currentName, setCurrentName] = useState<string | null>(null)
  const [nextName, setNextName] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [beatProgress, setBeatProgress] = useState(0)

  const tickRef = useRef<number | null>(null)
  const lastSwitchRef = useRef(0)

  const beatSeconds = 60 / bpm

  const pickChord = (excludeName: string | null): string => {
    const candidates = pool.length > 0 ? pool : DEFAULT_POOL
    if (candidates.length === 1) return candidates[0]
    let pick = candidates[Math.floor(Math.random() * candidates.length)]
    let safety = 8
    while (pick === excludeName && safety-- > 0) {
      pick = candidates[Math.floor(Math.random() * candidates.length)]
    }
    return pick
  }

  const start = () => {
    if (pool.length === 0) return
    const first = pickChord(null)
    const second = pickChord(first)
    setCurrentName(first)
    setNextName(second)
    setScore(0)
    setElapsed(0)
    setBeatProgress(0)
    lastSwitchRef.current = performance.now()
    setStatus('running')
  }

  const stop = () => {
    setStatus('idle')
    setCurrentName(null)
    setNextName(null)
  }

  useEffect(() => {
    if (status !== 'running') return
    const intervalMs = 100
    tickRef.current = window.setInterval(() => {
      const now = performance.now()
      const sinceSwitch = (now - lastSwitchRef.current) / 1000
      setElapsed((e) => e + intervalMs / 1000)
      setBeatProgress(Math.min(1, sinceSwitch / beatSeconds))

      if (sinceSwitch >= beatSeconds) {
        lastSwitchRef.current = now
        setBeatProgress(0)
        setScore((s) => s + 1)
        setCurrentName((curr) => {
          const upcoming = nextName ?? pickChord(curr)
          setNextName(pickChord(upcoming))
          return upcoming
        })
      }
    }, intervalMs)
    return () => {
      if (tickRef.current !== null) clearInterval(tickRef.current)
    }
  }, [status, beatSeconds, nextName, pool])

  useEffect(() => {
    if (status === 'running' && duration !== null && elapsed >= duration) {
      setStatus('done')
    }
  }, [status, duration, elapsed])

  useEffect(() => {
    if (status !== 'running') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        stop()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const togglePool = (name: string) => {
    setPool((p) => (p.includes(name) ? p.filter((n) => n !== name) : [...p, name]))
  }

  const fretShapes = useMemo(() => {
    const map = new Map<string, ReturnType<typeof toFretboardShape>>()
    for (const name of pool) {
      const c = findChord(name)
      if (c?.positions[0]) map.set(name, toFretboardShape(c.positions[0]))
    }
    return map
  }, [pool])

  const fretWindow = useMemo(() => computeFretWindow([...fretShapes.values()]), [fretShapes])
  const currentShape = currentName ? fretShapes.get(currentName) ?? null : null
  const nextShape = nextName ? fretShapes.get(nextName) ?? null : null
  const ariaLabel = currentShape && currentName
    ? describeShapeForA11y(currentShape, currentName)
    : 'Trainer idle'

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-24">
      <Link
        to="/"
        className="inline-block text-[11px] uppercase tracking-eyebrow text-ink-40 hover:text-ink transition-colors"
      >
        ← Home
      </Link>

      <header className="mt-4 pb-8 border-b border-ink-20">
        <div className="text-[11px] uppercase tracking-eyebrow text-accent mb-2">
          Drill · {pool.length} chord{pool.length === 1 ? '' : 's'} in pool
        </div>
        <h1 className="font-serif italic text-[clamp(36px,6vw,56px)] font-normal leading-[1.05] tracking-[-0.02em]">
          Chord Trainer
        </h1>
        <p className="mt-3 font-serif text-[17px] text-ink-60 max-w-md">
          Pick a chord pool, set a BPM, and switch on the beat. Self-report — no mic.
        </p>
      </header>

      {status === 'idle' || status === 'done' ? (
        <section className="mt-8 space-y-7">
          {status === 'done' && (
            <div className="border border-accent bg-surface p-5">
              <div className="text-[11px] uppercase tracking-eyebrow text-accent mb-1">Done</div>
              <div className="font-serif text-[28px] font-semibold">
                {score} chord change{score === 1 ? '' : 's'} in {duration}s.
              </div>
            </div>
          )}

          <fieldset className="border border-ink-20 p-5 sm:p-6">
            <legend className="text-[11px] uppercase tracking-eyebrow text-ink-40 px-2">
              Chord pool
            </legend>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {allBeginnerChords.map((name) => {
                const active = pool.includes(name)
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => togglePool(name)}
                    aria-pressed={active}
                    className={`px-2.5 py-1 rounded-full text-[12px] border transition-colors min-h-[32px] ${
                      active
                        ? 'bg-accent text-paper border-accent'
                        : 'border-ink-20 text-ink-60 hover:border-ink'
                    }`}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset className="border border-ink-20 p-5 sm:p-6">
            <legend className="text-[11px] uppercase tracking-eyebrow text-ink-40 px-2">
              Tempo · {bpm} bpm
            </legend>
            <input
              type="range"
              min={30}
              max={160}
              step={5}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              className="w-full mt-4"
              aria-label="Beats per minute"
            />
            <div className="flex justify-between text-[11px] text-ink-40 nums-tabular mt-1">
              <span>30</span>
              <span>95</span>
              <span>160</span>
            </div>
            <div className="mt-4">
              <TapTempo onChange={(b) => setBpm(Math.max(30, Math.min(160, b)))} min={30} max={160} />
            </div>
          </fieldset>

          <fieldset className="border border-ink-20 p-5 sm:p-6">
            <legend className="text-[11px] uppercase tracking-eyebrow text-ink-40 px-2">
              Duration
            </legend>
            <div className="flex flex-wrap gap-2 mt-3">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setDuration(opt.seconds)}
                  aria-pressed={duration === opt.seconds}
                  className={`px-3 py-1.5 rounded-full text-[12px] border transition-colors min-h-[32px] ${
                    duration === opt.seconds
                      ? 'bg-ink text-paper border-ink'
                      : 'border-ink-20 text-ink-60 hover:border-ink'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={start}
            disabled={pool.length === 0}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-ink text-paper text-[15px] font-medium disabled:opacity-40 hover:bg-accent transition-colors min-h-[48px]"
          >
            Start drill →
          </button>
        </section>
      ) : (
        <section className="mt-8 grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-8">
          <div className="bg-surface border border-ink-20" style={{ height: 320, padding: 16 }}>
            <Fretboard
              current={currentShape}
              next={nextShape}
              window={fretWindow}
              orientation="horizontal"
              ariaLabel={ariaLabel}
            />
          </div>

          <aside className="bg-surface border border-ink-20 p-7 flex flex-col items-center text-center">
            <div className="text-[11px] uppercase tracking-eyebrow text-accent">Now</div>
            <div className="font-serif font-semibold text-[clamp(72px,12vw,112px)] leading-none tracking-[-0.04em]">
              {currentName ?? '—'}
            </div>
            <div className="mt-3 text-[11px] uppercase tracking-eyebrow text-ink-40">
              Next · {nextName ?? '—'}
            </div>

            <div
              role="progressbar"
              aria-valuenow={Math.round(beatProgress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-6 h-1 w-full bg-ink-20 overflow-hidden"
            >
              <div
                className="h-full bg-accent"
                style={{ width: `${beatProgress * 100}%`, transition: 'width 100ms linear' }}
              />
            </div>

            <div className="mt-6 flex items-center justify-between w-full text-[11px] uppercase tracking-eyebrow text-ink-40 nums-tabular">
              <span>Score · {score}</span>
              <span>{Math.floor(elapsed)}s {duration ? `/ ${duration}s` : ''}</span>
            </div>

            <div className="mt-6 flex gap-2 w-full">
              <button
                type="button"
                onClick={stop}
                className="flex-1 px-4 py-2.5 rounded-full border border-ink-20 text-ink text-[13px] hover:border-ink transition-colors min-h-[44px]"
                aria-label="Stop drill (Esc)"
              >
                Stop · Esc
              </button>
            </div>
          </aside>
        </section>
      )}
    </div>
  )
}
