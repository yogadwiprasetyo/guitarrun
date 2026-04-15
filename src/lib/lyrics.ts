import type { ChordHit } from './songs'

export interface LyricLine {
  /** Absolute start time of the line. */
  startT: number
  /** Exclusive end time (start of the next line, or last hit + tail). */
  endT: number
  /** The lyric text rendered as the line. */
  lyric: string
  /** All ChordHits belonging to this line — first one carries the lyric,
   *  subsequent (lyric-less) hits are chord changes within the line. */
  hits: ChordHit[]
}

const TAIL_SECONDS = 4

/**
 * Walk the timeline and group consecutive hits into lines.
 * - A new line opens whenever a hit's `lyric` is a non-empty string.
 * - Subsequent lyric-less hits are folded into the current line as
 *   in-line chord changes.
 * - Returns [] when no hit in the timeline carries a lyric (so the UI
 *   can show an honest empty state).
 */
export function groupTimelineIntoLines(timeline: ReadonlyArray<ChordHit>): LyricLine[] {
  const lines: LyricLine[] = []
  for (const hit of timeline) {
    const lyric = (hit.lyric ?? '').trim()
    if (lyric.length > 0) {
      lines.push({
        startT: hit.t,
        endT: hit.t + TAIL_SECONDS,
        lyric,
        hits: [hit],
      })
    } else if (lines.length > 0) {
      const current = lines[lines.length - 1]
      current.hits.push(hit)
      current.endT = hit.t + TAIL_SECONDS
    }
  }
  for (let i = 0; i < lines.length - 1; i++) {
    lines[i].endT = lines[i + 1].startT
  }
  return lines
}

/**
 * Index of the active line for a given currentTime, or -1 if before the
 * first line. Returns the last index when currentTime is past the last
 * line so the UI keeps the closing line highlighted.
 */
export function findActiveLineIndex(
  lines: ReadonlyArray<LyricLine>,
  currentTime: number,
): number {
  if (lines.length === 0) return -1
  if (currentTime < lines[0].startT) return -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (currentTime >= lines[i].startT) return i
  }
  return -1
}

/**
 * For each in-line chord change, compute its left-edge x position as a
 * fraction of the line's total duration so the renderer can place chord
 * chips above approximate syllable positions.
 */
export function chordOverlayPositions(line: LyricLine): Array<{ chord: string; offset: number }> {
  const span = Math.max(0.001, line.endT - line.startT)
  return line.hits.map((h) => ({
    chord: h.chord,
    offset: Math.max(0, Math.min(1, (h.t - line.startT) / span)),
  }))
}
