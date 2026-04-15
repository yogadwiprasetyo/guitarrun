import { Link } from 'react-router-dom'
import type { Song } from '../lib/songs'

interface SongCardProps {
  song: Song
}

export default function SongCard({ song }: SongCardProps) {
  const thumb = `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg`
  return (
    <Link
      to={`/play/${song.id}`}
      className="group bg-surface flex flex-col overflow-hidden transition-colors hover:bg-paper"
      aria-label={`Play ${song.title} by ${song.artist}`}
    >
      <div className="aspect-video bg-ink/10 overflow-hidden relative">
        <img
          src={thumb}
          alt=""
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
        <div className="absolute inset-0 ring-1 ring-inset ring-ink-20 pointer-events-none" />
      </div>
      <div className="px-5 py-5 flex-1 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-serif text-[22px] font-semibold leading-[1.1] tracking-[-0.01em] truncate text-ink group-hover:text-accent transition-colors">
              {song.title}
            </div>
            <div className="font-serif italic text-[15px] text-ink-60 truncate mt-0.5">
              {song.artist}
            </div>
          </div>
          <span className="flex-shrink-0 text-[10px] uppercase tracking-eyebrow text-ink-40 pt-1">
            {song.difficulty}
          </span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-3 border-t border-ink-20 items-baseline">
          <span className="text-[10px] uppercase tracking-eyebrow text-ink-40">Uses</span>
          {song.chordsUsed.slice(0, 6).map((c) => (
            <span key={c} className="font-serif text-[14px] text-ink-60">
              {c}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
