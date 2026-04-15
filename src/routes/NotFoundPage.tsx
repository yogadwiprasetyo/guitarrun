import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-24 text-center">
      <div className="text-[11px] uppercase tracking-eyebrow text-ink-40 mb-4">
        Error 404
      </div>
      <h1 className="font-serif font-semibold text-[clamp(64px,10vw,96px)] leading-none tracking-[-0.03em] mb-3">
        Out of tune.
      </h1>
      <p className="font-serif italic text-[18px] text-ink-60 mb-8">
        That page isn&rsquo;t on the setlist.
      </p>
      <Link
        to="/"
        className="inline-block text-[11px] uppercase tracking-eyebrow text-ink hover:text-accent transition-colors"
      >
        ← Back to songs
      </Link>
    </div>
  )
}
