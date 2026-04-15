import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseYouTubeUrl } from '../lib/youtube'
import { songs } from '../lib/songs'

export default function SongUrlInput() {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const parsed = parseYouTubeUrl(value)
    if (!parsed) {
      setError('That doesn’t look like a YouTube URL or video ID.')
      return
    }
    const known = songs.find((s) => s.youtubeId === parsed.videoId)
    if (known) {
      navigate(`/play/${known.id}${parsed.startSeconds ? `?t=${parsed.startSeconds}` : ''}`)
    } else {
      const params = new URLSearchParams({ yt: parsed.videoId })
      if (parsed.startSeconds) params.set('t', String(parsed.startSeconds))
      navigate(`/play?${params.toString()}`)
    }
  }

  return (
    <form onSubmit={submit} className="border border-ink-20 bg-surface p-5 sm:p-6">
      <label
        htmlFor="yt-url"
        className="block text-[11px] uppercase tracking-eyebrow text-ink-40 mb-3"
      >
        Paste a YouTube link
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          id="yt-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="https://youtu.be/… or 11-char ID"
          className="flex-1 px-3 py-3 bg-paper border border-ink-20 text-ink font-serif text-[15px] focus:outline-none focus:border-ink"
          aria-describedby={error ? 'yt-url-err' : undefined}
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-ink text-paper text-[14px] font-medium disabled:opacity-40 hover:bg-accent transition-colors min-h-[44px]"
        >
          Open →
        </button>
      </div>
      {error && (
        <p
          id="yt-url-err"
          role="alert"
          className="mt-2 text-[12px] text-accent font-serif italic"
        >
          {error}
        </p>
      )}
      <p className="mt-3 text-[11px] text-ink-40 font-serif italic">
        Curated songs jump to the synced view. Other URLs open in “explore” mode — chord
        extraction is queued for the v3 Phase 3 backend.
      </p>
    </form>
  )
}
