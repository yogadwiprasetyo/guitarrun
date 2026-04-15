import { useEffect, useMemo, useState } from 'react'
import { useMicChroma } from '../hooks/useMicChroma'
import { isMatch, matchChord } from '../lib/chroma'

interface ChordValidatorProps {
  expectedChord: string | null
}

export default function ChordValidator({ expectedChord }: ChordValidatorProps) {
  const { listening, chroma, error, start, stop } = useMicChroma()
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (enabled && !listening && !error) {
      start()
    }
    if (!enabled && listening) {
      stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  useEffect(() => () => stop(), [stop])

  const candidate = useMemo(() => {
    if (!chroma) return null
    return matchChord(chroma)
  }, [chroma])

  const energy = useMemo(() => {
    if (!chroma) return 0
    let sum = 0
    for (const v of chroma) sum += v * v
    return Math.sqrt(sum)
  }, [chroma])
  const silent = energy < 0.05

  const matched = candidate && expectedChord && !silent ? isMatch(candidate, expectedChord) : false

  if (!expectedChord) return null

  return (
    <div className="border border-ink-20 bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEnabled((e) => !e)}
            aria-pressed={enabled}
            className={`px-3 py-1.5 rounded-full text-[11px] uppercase tracking-eyebrow transition-colors min-h-[32px] ${
              enabled
                ? 'bg-accent text-paper'
                : 'border border-ink-20 text-ink hover:border-ink'
            }`}
          >
            {enabled ? 'Listening · stop' : 'Validate · tap to start'}
          </button>
          <span className="text-[10px] uppercase tracking-eyebrow text-ink-40">
            Headphones recommended
          </span>
        </div>
        <span
          className={`text-[11px] uppercase tracking-eyebrow nums-tabular ${
            matched ? 'text-accent' : 'text-ink-40'
          }`}
          aria-live="polite"
        >
          {!enabled
            ? '—'
            : !chroma
              ? 'warming up'
              : silent
                ? 'silent · play a chord'
                : `heard ${candidate?.name ?? '—'} (${Math.round((candidate?.similarity ?? 0) * 100)}%)`}
        </span>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-[11px] text-accent font-serif italic">
          Mic error: {error}
        </p>
      )}
      {enabled && chroma && (
        <div className="mt-3 h-1 w-full bg-ink-20 overflow-hidden">
          <div
            className={`h-full transition-all duration-150 ${matched ? 'bg-accent' : 'bg-ink-40'}`}
            style={{ width: `${Math.round((candidate?.similarity ?? 0) * 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
