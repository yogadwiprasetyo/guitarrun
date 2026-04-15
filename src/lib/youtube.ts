// Pure utilities for parsing YouTube URLs.

export interface ParsedYouTube {
  videoId: string
  startSeconds?: number
}

const VIDEO_ID_RE = /^[\w-]{11}$/

export function parseYouTubeUrl(input: string): ParsedYouTube | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  if (VIDEO_ID_RE.test(trimmed)) return { videoId: trimmed }

  let url: URL
  try {
    url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^www\./, '')
  let videoId: string | null = null

  if (host === 'youtu.be') {
    videoId = url.pathname.replace(/^\//, '').split('/')[0] || null
  } else if (host.endsWith('youtube.com') || host === 'm.youtube.com') {
    if (url.pathname === '/watch') {
      videoId = url.searchParams.get('v')
    } else if (url.pathname.startsWith('/embed/')) {
      videoId = url.pathname.replace('/embed/', '').split('/')[0]
    } else if (url.pathname.startsWith('/shorts/')) {
      videoId = url.pathname.replace('/shorts/', '').split('/')[0]
    } else if (url.pathname.startsWith('/v/')) {
      videoId = url.pathname.replace('/v/', '').split('/')[0]
    }
  }

  if (!videoId || !VIDEO_ID_RE.test(videoId)) return null

  const tParam = url.searchParams.get('t') ?? url.searchParams.get('start')
  const startSeconds = tParam ? parseTimestamp(tParam) : undefined
  return { videoId, ...(startSeconds !== undefined ? { startSeconds } : {}) }
}

export function parseTimestamp(raw: string): number | undefined {
  if (!raw) return undefined
  if (/^\d+$/.test(raw)) return Number(raw)
  const re = /(\d+)\s*([hms])/g
  let total = 0
  let matched = false
  for (const m of raw.matchAll(re)) {
    matched = true
    const n = Number(m[1])
    if (m[2] === 'h') total += n * 3600
    else if (m[2] === 'm') total += n * 60
    else total += n
  }
  return matched ? total : undefined
}

export function isYouTubeUrlOrId(input: string): boolean {
  return parseYouTubeUrl(input) !== null
}
