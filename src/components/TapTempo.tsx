import { useEffect, useRef, useState } from 'react'

interface TapTempoProps {
  onChange: (bpm: number) => void
  min?: number
  max?: number
}

const RESET_AFTER_MS = 2000
const MAX_TAPS = 8

export default function TapTempo({ onChange, min = 30, max = 200 }: TapTempoProps) {
  const tapsRef = useRef<number[]>([])
  const [tapCount, setTapCount] = useState(0)
  const [lastBpm, setLastBpm] = useState<number | null>(null)
  const resetTimerRef = useRef<number | null>(null)

  const reset = () => {
    tapsRef.current = []
    setTapCount(0)
  }

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current)
    }
  }, [])

  const handleTap = () => {
    const now = performance.now()
    const taps = tapsRef.current
    if (taps.length > 0 && now - taps[taps.length - 1] > RESET_AFTER_MS) {
      taps.length = 0
    }
    taps.push(now)
    if (taps.length > MAX_TAPS) taps.shift()
    setTapCount(taps.length)

    if (taps.length >= 2) {
      const intervals: number[] = []
      for (let i = 1; i < taps.length; i++) intervals.push(taps[i] - taps[i - 1])
      const avgMs = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const bpm = Math.round(60000 / avgMs)
      const clamped = Math.max(min, Math.min(max, bpm))
      setLastBpm(clamped)
      onChange(clamped)
    }

    if (resetTimerRef.current !== null) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = window.setTimeout(reset, RESET_AFTER_MS)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleTap()
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleTap}
        onKeyDown={handleKeyDown}
        className="px-4 py-2 rounded-full border border-ink-20 text-ink text-[12px] uppercase tracking-eyebrow hover:border-ink active:bg-accent active:text-paper transition-colors min-h-[36px] nums-tabular"
        aria-label="Tap to set tempo"
      >
        Tap · {tapCount}
      </button>
      {lastBpm !== null && (
        <span className="text-[11px] text-ink-40 nums-tabular">
          → {lastBpm} bpm
        </span>
      )}
    </div>
  )
}
