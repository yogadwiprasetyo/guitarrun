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
  return { status: 'unsupported' }
}

export function useExtractedSong(videoId: string | null): ExtractResult {
  const [result, setResult] = useState<ExtractResult>({ status: 'pending' })
  useEffect(() => {
    if (!videoId) {
      setResult({ status: 'pending' })
      return
    }
    let cancelled = false
    setResult({ status: 'extracting' })
    fetchExtractedSong(videoId).then((r) => {
      if (!cancelled) setResult(r)
    })
    return () => {
      cancelled = true
    }
  }, [videoId])
  return result
}
