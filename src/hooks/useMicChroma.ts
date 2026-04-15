import { useCallback, useEffect, useRef, useState } from 'react'
import { chromaFromSpectrum } from '../lib/chroma'

interface UseMicChromaState {
  listening: boolean
  chroma: number[] | null
  error: string | null
  start: () => Promise<void>
  stop: () => void
}

const FFT_SIZE = 4096
const SAMPLE_RATE_FALLBACK = 44100
const SMOOTHING = 0.4

export function useMicChroma(): UseMicChromaState {
  const [listening, setListening] = useState(false)
  const [chroma, setChroma] = useState<number[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const ctxRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number | null>(null)
  const smoothedRef = useRef<number[] | null>(null)

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {})
      ctxRef.current = null
    }
    analyserRef.current = null
    smoothedRef.current = null
    setListening(false)
    setChroma(null)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new Ctor()
      await ctx.resume()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = FFT_SIZE
      analyser.smoothingTimeConstant = 0.6
      source.connect(analyser)

      streamRef.current = stream
      ctxRef.current = ctx
      analyserRef.current = analyser
      setListening(true)

      const buf = new Float32Array(analyser.frequencyBinCount)
      const sampleRate = ctx.sampleRate || SAMPLE_RATE_FALLBACK

      const tick = () => {
        if (!analyserRef.current) return
        analyserRef.current.getFloatFrequencyData(buf)
        const lin = new Float32Array(buf.length)
        for (let i = 0; i < buf.length; i++) {
          const db = buf[i]
          lin[i] = db < -75 ? 0 : Math.pow(10, db / 20)
        }
        const next = chromaFromSpectrum(lin, sampleRate, FFT_SIZE)
        if (smoothedRef.current === null) {
          smoothedRef.current = next.slice()
        } else {
          for (let i = 0; i < 12; i++) {
            smoothedRef.current[i] = SMOOTHING * smoothedRef.current[i] + (1 - SMOOTHING) * next[i]
          }
        }
        setChroma(smoothedRef.current.slice())
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'mic error'
      setError(msg)
      stop()
    }
  }, [stop])

  useEffect(() => {
    return () => stop()
  }, [stop])

  return { listening, chroma, error, start, stop }
}
