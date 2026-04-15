// v3 Phase 3.0 — client stub for the auto-extraction pipeline.
// See docs/09-V3-PHASE-3-EXTRACTION.md for the production architecture.
//
// When /api/extract lands, swap the body of fetchExtractedSong for the
// real fetch+poll. Everything else (types, hook, UI states) stays.

import { useEffect, useState } from 'react'
import type { Song } from './songs'
import { songs } from './songs'

export type ExtractStatus =
  | 'curated'
  | 'pending'
  | 'extracting'
  | 'ready'
  | 'error'
  | 'unsupported'

export interface ExtractedSong extends Song {
  source: 'curated' | 'extracted'
  extractedAt: string  // ISO 8601 UTC
  modelVersion: string
  confidence: number   // 0..1
}

export interface ExtractResult {
  status: ExtractStatus
  song?: ExtractedSong
  etaSeconds?: number
  error?: string
}

const API_URL = (import.meta.env.VITE_EXTRACT_API_URL as string | undefined)?.replace(/\/$/, '')
const POLL_INTERVAL_MS = 5000
const POLL_MAX_TRIES = 60 // 5 minutes

export async function fetchExtractedSong(videoId: string): Promise<ExtractResult> {
  const curated = songs.find((s) => s.youtubeId === videoId)
  if (curated) {
    return {
      status: 'curated',
      song: {
        ...curated,
        source: 'curated',
        extractedAt: '1970-01-01T00:00:00Z',
        modelVersion: 'curated-manual',
        confidence: 1,
      },
    }
  }
  if (!API_URL) {
    return { status: 'unsupported' }
  }
  try {
    const res = await fetch(`${API_URL}?yt=${encodeURIComponent(videoId)}`, {
      method: 'GET',
      mode: 'cors',
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return { status: 'error', error: `extract API ${res.status}: ${text.slice(0, 120)}` }
    }
    const json = (await res.json()) as ExtractResult
    return json
  } catch (e) {
    return { status: 'error', error: e instanceof Error ? e.message : 'network error' }
  }
}

export function useExtractedSong(videoId: string | null): ExtractResult {
  const [result, setResult] = useState<ExtractResult>({ status: 'pending' })
  useEffect(() => {
    if (!videoId) {
      setResult({ status: 'pending' })
      return
    }
    let cancelled = false
    let attempts = 0
    let timer: number | null = null

    const poll = async () => {
      if (cancelled) return
      attempts += 1
      const r = await fetchExtractedSong(videoId)
      if (cancelled) return
      setResult(r)
      const shouldPoll = r.status === 'extracting' && attempts < POLL_MAX_TRIES && API_URL
      if (shouldPoll) {
        timer = window.setTimeout(poll, POLL_INTERVAL_MS)
      } else if (r.status === 'extracting' && attempts >= POLL_MAX_TRIES) {
        setResult({ status: 'error', error: 'extraction timed out after 5 minutes' })
      }
    }

    setResult({ status: 'extracting' })
    poll()
    return () => {
      cancelled = true
      if (timer !== null) clearTimeout(timer)
    }
  }, [videoId])
  return result
}
