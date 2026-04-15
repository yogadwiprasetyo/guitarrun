import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Minimal wrapper around the YouTube IFrame Player API.
 * Loads the script once, creates a player into the given container element,
 * exposes play/pause/seek and a polled currentTime (updated at 4 Hz while playing).
 */

type YTPlayerState = -1 | 0 | 1 | 2 | 3 | 5

interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  getCurrentTime(): number
  getPlayerState(): YTPlayerState
  destroy(): void
}

interface YTConstructorArg {
  videoId: string
  height?: string | number
  width?: string | number
  playerVars?: Record<string, unknown>
  events?: {
    onReady?: (event: { target: YTPlayer }) => void
    onStateChange?: (event: { data: YTPlayerState }) => void
  }
}

interface YTNamespace {
  Player: new (el: HTMLElement | string, opts: YTConstructorArg) => YTPlayer
  PlayerState: { UNSTARTED: -1; ENDED: 0; PLAYING: 1; PAUSED: 2; BUFFERING: 3; CUED: 5 }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let apiPromise: Promise<YTNamespace> | null = null

function loadApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise
  apiPromise = new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve(window.YT)
      return
    }
    const existing = document.querySelector<HTMLScriptElement>('script[data-youtube-api]')
    const prior = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prior?.()
      if (window.YT) resolve(window.YT)
    }
    if (!existing) {
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      s.async = true
      s.setAttribute('data-youtube-api', 'true')
      document.head.appendChild(s)
    }
  })
  return apiPromise
}

export type PlayerStatus = 'loading' | 'ready' | 'playing' | 'paused' | 'ended' | 'buffering' | 'error'

export function useYouTubePlayer(videoId: string, container: HTMLElement | null) {
  const [status, setStatus] = useState<PlayerStatus>('loading')
  const [currentTime, setCurrentTime] = useState(0)
  const playerRef = useRef<YTPlayer | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastSampleRef = useRef(0)

  useEffect(() => {
    if (!container) return
    let cancelled = false

    loadApi().then((YT) => {
      if (cancelled || !container) return
      const player = new YT.Player(container, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: {
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
        },
        events: {
          onReady: () => {
            if (cancelled) return
            playerRef.current = player
            setStatus('ready')
          },
          onStateChange: (event) => {
            if (event.data === 1) setStatus('playing')
            else if (event.data === 2) setStatus('paused')
            else if (event.data === 0) setStatus('ended')
            else if (event.data === 3) setStatus('buffering')
          },
        },
      })
    }).catch(() => {
      if (!cancelled) setStatus('error')
    })

    return () => {
      cancelled = true
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      try { playerRef.current?.destroy() } catch { /* ignore */ }
      playerRef.current = null
    }
  }, [videoId, container])

  // Poll currentTime at ~4Hz while playing/buffering
  useEffect(() => {
    if (status !== 'playing' && status !== 'buffering') {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      return
    }
    const tick = (ts: number) => {
      if (ts - lastSampleRef.current >= 250) {
        const p = playerRef.current
        if (p) {
          const t = p.getCurrentTime()
          if (typeof t === 'number') setCurrentTime(t)
        }
        lastSampleRef.current = ts
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [status])

  const play = useCallback(() => { playerRef.current?.playVideo() }, [])
  const pause = useCallback(() => { playerRef.current?.pauseVideo() }, [])
  const seek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, true)
    setCurrentTime(seconds)
  }, [])

  return { status, currentTime, play, pause, seek }
}
