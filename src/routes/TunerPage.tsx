import { useEffect, useMemo, useState } from 'react'
import { useMicPitch } from '../hooks/useMicPitch'
import { hzToNote, nearestString, TUNINGS, type TuningMode } from '../lib/pitch'
import TunerMeter from '../components/TunerMeter'

const LS_KEY = 'gr:tuner:mode'

function loadMode(): TuningMode {
  const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(LS_KEY) : null
  return raw === 'drop-d' ? 'drop-d' : 'standard'
}

export default function TunerPage() {
  const [mode, setMode] = useState<TuningMode>(loadMode)
  const { state, reading, error, start, stop } = useMicPitch()

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, mode)
    } catch {
      /* ignore */
    }
  }, [mode])

  const { nearest, note } = useMemo(() => {
    if (!reading) return { nearest: null, note: null }
    return { nearest: nearestString(reading.hz, mode), note: hzToNote(reading.hz) }
  }, [reading, mode])

  const strings = TUNINGS[mode]

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-24">
      <header className="pb-10 border-b border-ink-20">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-eyebrow text-ink-40 mb-2">
              {mode === 'standard' ? 'Standard tuning · EADGBE' : 'Drop D · DADGBE'}
            </div>
            <h1 className="font-serif italic text-[clamp(36px,6vw,56px)] font-normal leading-[1.05] tracking-[-0.02em]">
              Tuner
            </h1>
            <p className="mt-3 font-serif text-[17px] text-ink-60 max-w-md">
              Pluck one string at a time. A quiet room helps.
            </p>
          </div>
          <div
            className="flex border border-ink-20 rounded-full p-1 bg-surface text-[13px]"
            role="tablist"
            aria-label="Tuning mode"
          >
            {(['standard', 'drop-d'] as TuningMode[]).map((m) => {
              const active = mode === m
              return (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMode(m)}
                  className={[
                    'px-4 py-1.5 rounded-full transition-colors',
                    active ? 'bg-ink text-paper' : 'text-ink-60 hover:text-ink',
                  ].join(' ')}
                >
                  {m === 'standard' ? 'Standard' : 'Drop D'}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      <section className="pt-14 pb-10">
        {state === 'idle' && (
          <div className="text-center py-12">
            <p className="font-serif italic text-[18px] text-ink-60 mb-8 max-w-sm mx-auto">
              Grant microphone access to begin. We listen only while you&rsquo;re on this page —
              nothing is recorded.
            </p>
            <button
              type="button"
              onClick={start}
              className="px-7 py-3.5 rounded-full bg-ink text-paper text-[15px] font-medium hover:bg-accent transition-colors min-h-[48px]"
            >
              Tap to start
            </button>
          </div>
        )}

        {state === 'starting' && (
          <div className="text-center py-20 font-serif italic text-[18px] text-ink-60">
            Starting the mic…
          </div>
        )}

        {(state === 'denied' || state === 'error') && (
          <div className="text-center py-12">
            <p className="font-serif italic text-[18px] text-ink mb-2">
              {state === 'denied' ? 'Microphone access denied.' : 'Microphone unavailable.'}
            </p>
            {error && (
              <p className="text-[12px] text-ink-40 mb-8 max-w-sm mx-auto">{error}</p>
            )}
            <button
              type="button"
              onClick={start}
              className="px-6 py-3 rounded-full bg-ink text-paper text-[14px] font-medium hover:bg-accent transition-colors min-h-[44px]"
            >
              Try again
            </button>
          </div>
        )}

        {state === 'running' && (
          <>
            <TunerMeter
              cents={nearest?.cents ?? null}
              noteName={note?.name ?? null}
              octave={note?.octave ?? null}
              targetName={nearest?.name ?? null}
              targetHz={nearest?.hz ?? null}
              hz={reading?.hz ?? null}
            />

            <div className="mt-14 pt-8 border-t border-ink-20">
              <div className="text-[11px] uppercase tracking-eyebrow text-ink-40 text-center mb-5">
                Strings · low to high
              </div>
              <div className="flex justify-center gap-3 flex-wrap">
                {strings.map((s, i) => {
                  const active = nearest?.index === i
                  const isInTune = active && nearest && Math.abs(nearest.cents) <= 5
                  return (
                    <div
                      key={i}
                      aria-label={`String ${s.name}${active ? ' (current)' : ''}`}
                      className={[
                        'min-w-[52px] min-h-[44px] px-4 rounded-full border font-serif text-[16px] font-semibold flex items-center justify-center transition-colors',
                        active
                          ? isInTune
                            ? 'border-in_tune bg-in_tune text-paper'
                            : 'border-accent bg-accent text-paper'
                          : 'border-ink-20 bg-transparent text-ink-60',
                      ].join(' ')}
                    >
                      {s.name}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={stop}
                className="text-[11px] uppercase tracking-eyebrow text-ink-40 hover:text-ink transition-colors"
              >
                Stop mic
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
