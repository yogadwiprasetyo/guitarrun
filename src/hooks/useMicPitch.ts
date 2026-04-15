import { useCallback, useEffect, useRef, useState } from 'react'
import { PitchDetector } from 'pitchy'

export type MicState = 'idle' | 'starting' | 'running' | 'denied' | 'error'

export interface MicPitchReading {
  hz: number
  clarity: number
}

interface Options {
  minClarity?: number
  minHz?: number
  maxHz?: number
  bufferSize?: number
  /** EMA smoothing factor per audio frame (0..1). Lower = smoother, slower response. */
  smoothing?: number
  /** Minimum ms between React state updates, to reduce re-renders. */
  updateIntervalMs?: number
}

export function useMicPitch(options: Options = {}) {
  const {
    minClarity = 0.93,
    minHz = 60,
    maxHz = 1200,
    bufferSize = 2048,
    smoothing = 0.18,
    updateIntervalMs = 60,
  } = options
  const [state, setState] = useState<MicState>('idle')
  const [reading, setReading] = useState<MicPitchReading | null>(null)
  const [error, setError] = useState<string | null>(null)

  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectorRef = useRef<PitchDetector<Float32Array> | null>(null)
  const bufferRef = useRef<Float32Array<ArrayBuffer> | null>(null)
  const rafRef = useRef<number | null>(null)

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    analyserRef.current?.disconnect()
    analyserRef.current = null
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {})
    }
    audioCtxRef.current = null
    detectorRef.current = null
    bufferRef.current = null
    setReading(null)
    setState('idle')
  }, [])

  const start = useCallback(async () => {
    if (state === 'running' || state === 'starting') return
    setError(null)
    setState('starting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })
      streamRef.current = stream

      const AudioCtx: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      audioCtxRef.current = ctx
      if (ctx.state === 'suspended') await ctx.resume()

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = bufferSize
      source.connect(analyser)
      analyserRef.current = analyser

      const detector = PitchDetector.forFloat32Array(analyser.fftSize)
      detector.minVolumeDecibels = -40
      detectorRef.current = detector
      bufferRef.current = new Float32Array(new ArrayBuffer(analyser.fftSize * 4))

      setState('running')

      let smoothedHz = 0
      let smoothedClarity = 0
      let lastEmit = 0

      const tick = (ts: number) => {
        const analyserNow = analyserRef.current
        const detectorNow = detectorRef.current
        const bufferNow = bufferRef.current
        const ctxNow = audioCtxRef.current
        if (!analyserNow || !detectorNow || !bufferNow || !ctxNow) return
        analyserNow.getFloatTimeDomainData(bufferNow)
        const [hz, clarity] = detectorNow.findPitch(bufferNow as Float32Array<ArrayBuffer>, ctxNow.sampleRate)

        if (clarity >= minClarity && hz >= minHz && hz <= maxHz) {
          // EMA smoothing on log-frequency so behavior is musical (equal-ratio)
          if (smoothedHz === 0) {
            smoothedHz = hz
          } else {
            const logSmoothed = Math.log(smoothedHz)
            const logNew = Math.log(hz)
            smoothedHz = Math.exp(logSmoothed + smoothing * (logNew - logSmoothed))
          }
          smoothedClarity = smoothedClarity + smoothing * (clarity - smoothedClarity)

          if (ts - lastEmit >= updateIntervalMs) {
            lastEmit = ts
            setReading({ hz: smoothedHz, clarity: smoothedClarity })
          }
        } else {
          // Silence / low confidence — decay toward no-reading over ~400ms
          if (ts - lastEmit >= 400) {
            lastEmit = ts
            smoothedHz = 0
            setReading(null)
          }
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        setState('denied')
      } else {
        setState('error')
      }
      setError(msg)
    }
  }, [state, minClarity, minHz, maxHz, bufferSize])

  useEffect(() => {
    return () => { stop() }
  }, [stop])

  return { state, reading, error, start, stop }
}
