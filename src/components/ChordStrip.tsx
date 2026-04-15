import type { ChordHit } from '../lib/songs'

interface ChordStripProps {
  timeline: ChordHit[]
  activeIndex: number | null
  onSeek?: (seconds: number) => void
}

const ITEM_W = 112
const GAP = 16

export default function ChordStrip({ timeline, activeIndex, onSeek }: ChordStripProps) {
  const stride = ITEM_W + GAP
  const activePos = activeIndex == null ? 0 : activeIndex * stride

  return (
    <div className="relative select-none" aria-label="Chord timeline">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] uppercase tracking-eyebrow text-ink-40">Timeline</span>
        <span className="text-[11px] uppercase tracking-eyebrow text-accent">Now</span>
      </div>

      <div
        className="absolute left-1/2 top-8 bottom-0 w-px bg-accent z-10 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute left-1/2 top-8 w-0 h-0 -translate-x-1/2 z-10 pointer-events-none"
        aria-hidden="true"
        style={{
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '7px solid #C2553B',
        }}
      />

      <div className="overflow-hidden py-1" style={{ minHeight: ITEM_W + 24 }}>
        <div
          className="flex will-change-transform"
          style={{
            gap: GAP,
            transform: `translate3d(calc(50% - ${activePos + ITEM_W / 2}px), 0, 0)`,
            transition: 'transform 200ms ease-out',
          }}
        >
          {timeline.map((hit, i) => {
            const isActive = i === activeIndex
            const isPast = activeIndex != null && i < activeIndex
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSeek?.(hit.t)}
                style={{ width: ITEM_W }}
                aria-label={`Seek to ${hit.chord} at ${hit.t.toFixed(1)} seconds`}
                aria-current={isActive ? 'true' : undefined}
                className={[
                  'flex-shrink-0 border px-3 py-5 flex flex-col items-center justify-center gap-1.5 transition-colors min-h-[112px]',
                  isActive
                    ? 'bg-ink text-paper border-ink'
                    : isPast
                      ? 'bg-transparent text-ink-40 border-ink-20 hover:text-ink-60'
                      : 'bg-surface text-ink border-ink-20 hover:border-ink',
                ].join(' ')}
              >
                <div
                  className={[
                    'font-serif text-[28px] font-semibold leading-none tracking-[-0.01em]',
                    isActive ? 'text-paper' : isPast ? 'text-ink-40' : 'text-ink',
                  ].join(' ')}
                >
                  {hit.chord}
                </div>
                <div
                  className={[
                    'text-[10px] uppercase tracking-eyebrow nums-tabular',
                    isActive ? 'text-paper/70' : 'text-ink-40',
                  ].join(' ')}
                >
                  {hit.t.toFixed(1)}s
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
