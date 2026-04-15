#!/usr/bin/env node
/**
 * One-shot resolver: replaces every `placeholder-yt` entry in
 * src/data/songs.json with a real, embeddable YouTube videoId via the
 * YouTube Data API v3 search endpoint.
 *
 * USAGE:
 *   YOUTUBE_API_KEY=... node scripts/yt-resolve.mjs [--dry] [--limit=N]
 *
 *   --dry      Run search + log proposals, do NOT mutate songs.json
 *   --limit=N  Process at most N pending songs (default: all)
 *
 * SECURITY:
 *   The API key is read from process.env.YOUTUBE_API_KEY only.
 *   Never hardcoded, never logged, never written to disk by this script.
 *   .gitignore covers *.local so a `.env.local` would also be safe, but
 *   the cleanest pattern is to pass the key inline at invocation time.
 *
 * COST: YouTube Data API v3 search.list = 100 quota units per call.
 *       100 songs => 10,000 units (the entire free daily quota).
 *       Re-running on subsequent days picks up where it left off because
 *       we only touch songs still tagged 'placeholder-yt'.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const ROOT = resolve(dirname(__filename), '..')
const SONGS_PATH = resolve(ROOT, 'src/data/songs.json')

const API_KEY = process.env.YOUTUBE_API_KEY
if (!API_KEY) {
  console.error('ERROR: YOUTUBE_API_KEY env var is required.')
  console.error('Run as: YOUTUBE_API_KEY=... node scripts/yt-resolve.mjs')
  process.exit(1)
}

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const LIMIT = (() => {
  const m = args.find((a) => a.startsWith('--limit='))
  return m ? Number(m.split('=')[1]) : Infinity
})()

const songs = JSON.parse(readFileSync(SONGS_PATH, 'utf8'))

const pending = songs.filter((s) => (s.tags ?? []).includes('placeholder-yt'))
console.log(`Pending: ${pending.length} of ${songs.length} songs flagged placeholder-yt`)
console.log(`Mode: ${DRY ? 'DRY-RUN (no writes)' : 'LIVE (will mutate songs.json)'}`)
console.log(`Limit: ${LIMIT === Infinity ? 'all' : LIMIT}`)
console.log()

let processed = 0
let resolved = 0
let failed = 0
const failures = []

function parseISODurationToSeconds(iso) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso || '')
  if (!m) return null
  const h = Number(m[1] ?? 0)
  const min = Number(m[2] ?? 0)
  const s = Number(m[3] ?? 0)
  return h * 3600 + min * 60 + s
}

async function fetchDurations(videoIds) {
  if (videoIds.length === 0) return new Map()
  const out = new Map()
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50)
    const url = new URL('https://www.googleapis.com/youtube/v3/videos')
    url.searchParams.set('part', 'contentDetails')
    url.searchParams.set('id', batch.join(','))
    url.searchParams.set('key', API_KEY)
    const res = await fetch(url)
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`videos.list HTTP ${res.status}: ${body.slice(0, 200)}`)
    }
    const json = await res.json()
    for (const item of json.items ?? []) {
      const sec = parseISODurationToSeconds(item.contentDetails?.duration)
      if (sec !== null) out.set(item.id, sec)
    }
  }
  return out
}

async function searchYouTube(query) {
  const url = new URL('https://www.googleapis.com/youtube/v3/search')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('q', query)
  url.searchParams.set('type', 'video')
  url.searchParams.set('videoEmbeddable', 'true')
  url.searchParams.set('videoCategoryId', '10') // Music
  url.searchParams.set('maxResults', '1')
  url.searchParams.set('key', API_KEY)
  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`)
  }
  const json = await res.json()
  const item = json.items?.[0]
  if (!item) return null
  return {
    videoId: item.id?.videoId,
    title: item.snippet?.title,
    channel: item.snippet?.channelTitle,
  }
}

const seenIds = new Set(songs.map((s) => s.youtubeId))

for (const song of pending) {
  if (processed >= LIMIT) break
  processed++
  const query = `${song.title} ${song.artist}`
  process.stdout.write(`[${processed}/${Math.min(pending.length, LIMIT)}] ${song.title} — ${song.artist} ... `)
  try {
    const hit = await searchYouTube(query)
    if (!hit?.videoId) {
      console.log('NO RESULT')
      failed++
      failures.push({ id: song.id, query, reason: 'no result' })
      continue
    }
    if (seenIds.has(hit.videoId) && hit.videoId !== song.youtubeId) {
      console.log(`DUP (${hit.videoId}) — skipped`)
      failed++
      failures.push({ id: song.id, query, reason: `duplicate ${hit.videoId}` })
      continue
    }
    console.log(`→ ${hit.videoId}  (${hit.channel})`)
    if (!DRY) {
      seenIds.delete(song.youtubeId)
      seenIds.add(hit.videoId)
      song.youtubeId = hit.videoId
      song.tags = (song.tags ?? []).filter((t) => t !== 'placeholder-yt')
      writeFileSync(SONGS_PATH, JSON.stringify(songs, null, 2))
    }
    resolved++
  } catch (e) {
    console.log(`ERROR: ${e instanceof Error ? e.message : String(e)}`)
    failed++
    failures.push({ id: song.id, query, reason: e?.message ?? 'error' })
    if (String(e?.message ?? '').includes('quotaExceeded') || String(e?.message ?? '').includes('403')) {
      console.error('Quota likely exceeded — bailing.')
      break
    }
  }
}

console.log()
console.log(`Processed: ${processed}`)
console.log(`Resolved : ${resolved}`)
console.log(`Failed   : ${failed}`)
console.log(`Remaining placeholder-yt entries after this run: ${
  songs.filter((s) => (s.tags ?? []).includes('placeholder-yt')).length
}`)
if (failures.length > 0) {
  console.log('\nFailure detail:')
  for (const f of failures.slice(0, 20)) console.log(`  ${f.id}  [${f.reason}]  q="${f.query}"`)
  if (failures.length > 20) console.log(`  ... and ${failures.length - 20} more`)
}

// === Duration backfill (videos.list, 1 unit per call, up to 50 ids batched) ===
const needsDuration = songs.filter(
  (s) => typeof s.durationSeconds !== 'number' && /^[\w-]{11}$/.test(s.youtubeId) && !(s.tags ?? []).includes('placeholder-yt'),
)
if (!DRY && needsDuration.length > 0) {
  console.log(`\nDuration backfill: ${needsDuration.length} song(s)`)
  try {
    const durations = await fetchDurations(needsDuration.map((s) => s.youtubeId))
    let added = 0
    for (const s of needsDuration) {
      const sec = durations.get(s.youtubeId)
      if (typeof sec === 'number' && sec > 0) {
        s.durationSeconds = sec
        added++
      }
    }
    writeFileSync(SONGS_PATH, JSON.stringify(songs, null, 2))
    console.log(`  ${added}/${needsDuration.length} durations persisted`)
  } catch (e) {
    console.log(`  ERROR: ${e instanceof Error ? e.message : String(e)}`)
  }
}
