import { useMemo, useState } from 'react'
import ChordDiagram from '../components/ChordDiagram'
import { searchChords, type ChordShape } from '../lib/chords'

export default function ChordsPage() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<ChordShape | null>(null)

  const results = useMemo(() => searchChords(query), [query])

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-24">
      <header className="pb-8 border-b border-ink-20">
        <div className="text-[11px] uppercase tracking-eyebrow text-ink-40 mb-2">
          Library · {results.length} shape{results.length === 1 ? '' : 's'}
        </div>
        <h1 className="font-serif italic text-[clamp(36px,6vw,56px)] font-normal leading-[1.05] tracking-[-0.02em]">
          Chord Finder
        </h1>
        <p className="mt-3 font-serif text-[17px] text-ink-60 max-w-md">
          Every chord you need, no ads, one diagram.
        </p>
      </header>

      <div className="sticky top-14 z-10 -mx-5 sm:mx-0 px-5 sm:px-0 py-5 bg-paper/95 backdrop-blur border-b border-ink-20">
        <input
          type="search"
          autoFocus
          placeholder="Search a chord — try cmaj7, am, dsus4…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search chords"
          className="w-full px-0 py-3 bg-transparent border-0 border-b border-ink text-ink font-serif italic text-[22px] placeholder:text-ink-40 focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {results.length === 0 ? (
        <div className="py-20 text-center font-serif italic text-[18px] text-ink-60">
          No matches. Try a shorter query.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-ink-20 border border-ink-20">
          {results.map((chord) => (
            <button
              key={chord.name}
              type="button"
              onClick={() => setSelected(chord)}
              className="bg-surface hover:bg-paper p-5 flex flex-col items-center gap-3 transition-colors group min-h-[180px]"
              aria-label={`Open ${chord.name}`}
            >
              <div className="font-serif text-[24px] font-semibold leading-none group-hover:text-accent transition-colors">
                {chord.name}
              </div>
              <div className="flex-1 flex items-center">
                <ChordDiagram position={chord.positions[0]} size="sm" />
              </div>
              <div className="text-[10px] uppercase tracking-eyebrow text-ink-40">
                {chord.notes.slice(0, 3).join(' · ')}
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-5 z-50"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.name} chord detail`}
        >
          <div
            className="bg-surface border border-ink-20 max-w-md w-full p-8 sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-[11px] uppercase tracking-eyebrow text-accent mb-1">
              Selected
            </div>
            <h2 className="font-serif font-semibold text-[clamp(56px,10vw,88px)] leading-none tracking-[-0.03em] mb-2">
              {selected.name}
            </h2>
            <p className="font-serif italic text-[17px] text-ink-60 mb-8">
              {selected.notes.join(' — ')}
            </p>
            <div className="flex justify-center py-4">
              <ChordDiagram position={selected.positions[0]} size="lg" />
            </div>
            <div className="mt-8 pt-6 border-t border-ink-20 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-eyebrow text-ink-40">
                Open voicing
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-[11px] uppercase tracking-eyebrow text-ink hover:text-accent transition-colors"
              >
                Close ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
