import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChordHit } from '../lib/songs'
import {
  chordOverlayPositions,
  findActiveLineIndex,
  groupTimelineIntoLines,
} from '../lib/lyrics'

interface LyricsPanelProps {
  timeline: ReadonlyArray<ChordHit>
  currentTime: number
  onSeek: (t: number) => void
  contributeHref?: string
}

const COLLAPSED_HEIGHT = 280
const EXPANDED_HEIGHT = 560

export default function LyricsPanel({
  timeline,
  currentTime,
  onSeek,
  contributeHref = 'https://github.com/yogadwiprasetyo/guitarrun/blob/main/docs/08-CONTRIBUTING.md',
}: LyricsPanelProps) {
  const lines = useMemo(() => groupTimelineIntoLines(timeline), [timeline])
  const activeIndex = useMemo(
    () => findActiveLineIndex(lines, currentTime),
    [lines, currentTime],
  )
  const [expanded, setExpanded] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)

  const scrollRef = useRef<HTMLDivElement | null>(null)
  const lineRefs = useRef<Array<HTMLLIElement | null>>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduceMotion(mq.matches)
    const onChange = () => setReduceMotion(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (activeIndex < 0) return
    const node = lineRefs.current[activeIndex]
    const container = scrollRef.current
    if (!node || !container) return
    const containerRect = container.getBoundingClientRect()
    const nodeRect = node.getBoundingClientRect()
    const offsetWithin = nodeRect.top - containerRect.top
    const targetTop = container.scrollTop + offsetWithin - containerRect.height * 0.35
    container.scrollTo({
      top: targetTop,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }, [activeIndex, reduceMotion])

  if (lines.length === 0) {
    return (
      <section
        aria-label="Lyrics"
        className="border border-ink-20 bg-surface px-6 py-10 text-center"
      >
        <div className="text-[11px] uppercase tracking-eyebrow text-ink-40 mb-2">
          Lyrics
        </div>
        <p className="font-serif italic text-[16px] text-ink-60 max-w-md mx-auto">
          Lyrics aren’t in the curated entry yet. Help out — see the{' '}
          <a
            href={contributeHref}
            target="_blank"
            rel="noreferrer"
            className="text-accent underline"
          >
            contribution guide
          </a>{' '}
          to add timed lyrics to <code className="text-ink">songs.json</code>.
        </p>
      </section>
    )
  }

  return (
    <section aria-label="Lyrics" className="border border-ink-20 bg-surface">
      <header className="flex items-baseline justify-between px-5 sm:px-6 py-3 border-b border-ink-20">
        <div className="text-[11px] uppercase tracking-eyebrow text-ink-40 nums-tabular">
          Lyrics · {lines.length} line{lines.length === 1 ? '' : 's'}
          {activeIndex >= 0 && (
            <span className="ml-2 text-accent">
              {activeIndex + 1}/{lines.length}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-pressed={expanded}
          className="text-[11px] uppercase tracking-eyebrow text-ink-60 hover:text-ink transition-colors"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </header>

      <div
        ref={scrollRef}
        className="overflow-y-auto px-5 sm:px-10 py-6"
        style={{ height: expanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT }}
      >
        <ol className="max-w-2xl mx-auto space-y-6">
          {lines.map((line, i) => {
            const isActive = i === activeIndex
            const isPast = i < activeIndex
            const overlays = chordOverlayPositions(line)
            return (
              <li
                key={`${i}-${line.startT}`}
                ref={(el) => {
                  lineRefs.current[i] = el
                }}
                className={`relative transition-opacity duration-200 ${
                  isActive ? 'opacity-100' : isPast ? 'opacity-30' : 'opacity-60'
                }`}
              >
                <div className="relative h-5">
                  {overlays.map((o, k) => (
                    <span
                      key={`${k}-${o.chord}`}
                      className={`absolute -translate-x-1/2 px-1.5 py-0.5 rounded text-[11px] font-medium nums-tabular whitespace-nowrap ${
                        isActive
                          ? 'bg-accent/10 text-accent'
                          : 'bg-ink/5 text-ink-60'
                      }`}
                      style={{ left: `${o.offset * 100}%` }}
                    >
                      {o.chord}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onSeek(line.startT)}
                  className={`block w-full text-left font-serif text-[18px] sm:text-[20px] leading-snug hover:text-accent transition-colors ${
                    isActive ? 'font-semibold' : ''
                  }`}
                  aria-label={`Seek to lyric line at ${line.startT.toFixed(1)} seconds`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  {line.lyric}
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
