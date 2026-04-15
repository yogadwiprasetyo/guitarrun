import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface RecentEntry {
  id: string
  title: string
  artist: string
  youtubeId: string
  kind: 'curated' | 'explore'
  visitedAt: number
}

const KEY = 'gr:recent'

export default function RecentlyPlayed() {
  const [entries, setEntries] = useState<RecentEntry[]>([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) setEntries(JSON.parse(raw) as RecentEntry[])
    } catch {
      // ignore corrupt storage
    }
  }, [])

  if (entries.length === 0) return null

  const clear = () => {
    try {
      window.localStorage.removeItem(KEY)
    } catch {
      // ignore
    }
    setEntries([])
  }

  return (
    <section className="border border-ink-20 bg-paper p-5 sm:p-6">
      <div className="flex items-baseline justify-between mb-4">
        <div className="text-[11px] uppercase tracking-eyebrow text-ink-40">
          Recently played · {entries.length}
        </div>
        <button
          type="button"
          onClick={clear}
          className="text-[11px] uppercase tracking-eyebrow text-accent hover:text-ink transition-colors"
          aria-label="Clear recently played"
        >
          Clear
        </button>
      </div>
      <ul className="flex flex-col divide-y divide-ink-20">
        {entries.map((e) => {
          const href =
            e.kind === 'curated'
              ? `/play/${e.id}`
              : `/play?yt=${encodeURIComponent(e.youtubeId)}`
          return (
            <li key={e.id}>
              <Link
                to={href}
                className="flex items-baseline justify-between gap-3 py-3 hover:text-accent transition-colors"
              >
                <span className="font-serif text-[16px] truncate">
                  {e.title}
                  {e.artist && (
                    <span className="text-ink-40 italic text-[14px] ml-2">{e.artist}</span>
                  )}
                </span>
                <span className="text-[10px] uppercase tracking-eyebrow text-ink-40 nums-tabular shrink-0">
                  {e.kind}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
