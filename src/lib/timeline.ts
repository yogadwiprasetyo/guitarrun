import type { ChordHit } from './songs'

export interface ActiveChord {
  index: number
  hit: ChordHit
  nextHit: ChordHit | null
  startsAt: number
  endsAt: number
}

// Binary search — returns the last hit with t <= time.
export function activeChordAt(timeline: ChordHit[], time: number): ActiveChord | null {
  if (!timeline.length || time < timeline[0].t) return null
  let lo = 0
  let hi = timeline.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (timeline[mid].t <= time) lo = mid
    else hi = mid - 1
  }
  const hit = timeline[lo]
  const nextHit = timeline[lo + 1] ?? null
  return {
    index: lo,
    hit,
    nextHit,
    startsAt: hit.t,
    endsAt: nextHit ? nextHit.t : hit.t + 4, // approximate tail
  }
}
