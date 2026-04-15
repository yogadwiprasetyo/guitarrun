#!/usr/bin/env node
/**
 * Fetch synced lyrics for every song in src/data/songs.json.
 *
 * Priority:
 *   1. YouTube closed-captions via the public timedtext endpoint
 *      (only works for videos that ship real captions).
 *   2. LRClib (free, no auth) — returns LRC-format synced lyrics.
 *
 * Persists `song.lyrics: Array<{t, text}>` + `song.lyricsSource`.
 * Does NOT mutate any existing field (timeline, chordsUsed, etc.).
 * Re-runnable — only touches songs missing `lyrics`.
 *
 * USAGE:
 *   node scripts/lyrics-fetch.mjs [--id=<songId>] [--limit=N] [--dry] [--force]
 *
 *   --id=<songId>  Process only the given song (smoke test before bulk run).
 *   --limit=N      Cap the total processed this run.
 *   --dry          Fetch + log, do not write.
 *   --force        Re-fetch even for songs that already have lyrics.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const ROOT = resolve(dirname(__filename), '..')
const SONGS_PATH = resolve(ROOT, 'src/data/songs.json')

const args = process.argv.slice(2)
const ID = (() => {
  const m = args.find((a) => a.startsWith('--id='))
  return m ? m.split('=')[1] : null
})()
const LIMIT = (() => {
  const m = args.find((a) => a.startsWith('--limit='))
  return m ? Number(m.split('=')[1]) : Infinity
})()
const DRY = args.includes('--dry')
const FORCE = args.includes('--force')

const songs = JSON.parse(readFileSync(SONGS_PATH, 'utf8'))

function shouldProcess(s) {
  if (ID) return s.id === ID
  if (FORCE) return true
  return !(Array.isArray(s.lyrics) && s.lyrics.length > 0)
}

const pending = songs.filter(shouldProcess)
console.log(`Pending: ${pending.length} of ${songs.length} songs`)
console.log(`Mode: ${DRY ? 'DRY-RUN' : 'LIVE'}${FORCE ? ' · FORCE' : ''}`)
console.log(`Limit: ${LIMIT === Infinity ? 'all' : LIMIT}`)
console.log()

// ----- YouTube timedtext -----

async function fetchYouTubeCaptions(videoId) {
  const urls = [
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en-US`,
    `https://www.youtube.com/api/timedtext?v=${videoId}`,
  ]
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (guitarrun lyrics script)' },
      })
      if (!res.ok) continue
      const xml = await res.text()
      if (!xml || xml.length < 50) continue
      const parsed = parseTimedTextXml(xml)
      if (parsed.length > 0) return parsed
    } catch {
      // try next
    }
  }
  return null
}

function parseTimedTextXml(xml) {
  const re = /<text\s+start="([\d.]+)"(?:\s+dur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g
  const lines = []
  let m
  while ((m = re.exec(xml)) !== null) {
    const t = Number(m[1])
    const raw = m[3]
    const text = decodeEntities(raw)
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (text && Number.isFinite(t)) lines.push({ t: Number(t.toFixed(2)), text })
  }
  return lines
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_m, n) => String.fromCharCode(Number(n)))
}

// ----- LRClib fallback -----

async function fetchLRClib(title, artist, durationSeconds) {
  const url = new URL('https://lrclib.net/api/get')
  url.searchParams.set('track_name', title)
  url.searchParams.set('artist_name', artist)
  if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
    url.searchParams.set('duration', String(Math.round(durationSeconds)))
  }
  const headers = {
    'User-Agent':
      'guitarrun/0.1 (https://github.com/yogadwiprasetyo/guitarrun)',
  }
  try {
    const res = await fetch(url, { headers })
    if (res.ok) {
      const json = await res.json()
      if (json.syncedLyrics) return parseLrc(json.syncedLyrics)
    }
    // Fallback 1: search with artist + title (contributor artist may be correct)
    const searchUrl = new URL('https://lrclib.net/api/search')
    searchUrl.searchParams.set('track_name', title)
    searchUrl.searchParams.set('artist_name', artist)
    let sres = await fetch(searchUrl, { headers })
    if (sres.ok) {
      const list = await sres.json()
      const hit = Array.isArray(list) ? list.find((x) => x.syncedLyrics) : null
      if (hit) return parseLrc(hit.syncedLyrics)
    }
    // Fallback 2: title-only search (contributor artist may be wrong)
    const titleOnly = new URL('https://lrclib.net/api/search')
    titleOnly.searchParams.set('track_name', title)
    sres = await fetch(titleOnly, { headers })
    if (sres.ok) {
      const list = await sres.json()
      const hit = Array.isArray(list) ? list.find((x) => x.syncedLyrics) : null
      if (hit) return parseLrc(hit.syncedLyrics)
    }
    return null
  } catch {
    return null
  }
}

function parseLrc(lrc) {
  const re = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\](.*)/g
  const out = []
  let m
  while ((m = re.exec(lrc)) !== null) {
    const min = Number(m[1])
    const sec = Number(m[2])
    const cs = Number((m[3] ?? '0').padEnd(3, '0').slice(0, 3))
    const t = min * 60 + sec + cs / 1000
    const text = (m[4] ?? '').trim()
    if (text) out.push({ t: Number(t.toFixed(2)), text })
  }
  return out.sort((a, b) => a.t - b.t)
}

// ----- driver -----

let processed = 0
let youtubeOk = 0
let lrclibOk = 0
let failed = 0
const failures = []

for (const song of pending) {
  if (processed >= LIMIT) break
  processed++
  const label = `[${processed}/${Math.min(pending.length, LIMIT)}] ${song.title} — ${song.artist}`

  let lines = await fetchYouTubeCaptions(song.youtubeId)
  let source = 'youtube-cc'
  if (lines && lines.length >= 3) {
    console.log(`${label}  YouTube CC → ${lines.length} lines`)
    youtubeOk++
  } else {
    lines = await fetchLRClib(song.title, song.artist, song.durationSeconds)
    source = 'lrclib'
    if (lines && lines.length >= 3) {
      console.log(`${label}  LRClib → ${lines.length} lines`)
      lrclibOk++
    } else {
      console.log(`${label}  ✗ no lyrics found`)
      failed++
      failures.push({ id: song.id, title: song.title, artist: song.artist })
      continue
    }
  }

  if (!DRY) {
    song.lyrics = lines
    song.lyricsSource = source
    writeFileSync(SONGS_PATH, JSON.stringify(songs, null, 2))
  }
}

console.log()
console.log(`Processed: ${processed}`)
console.log(`  YouTube CC: ${youtubeOk}`)
console.log(`  LRClib    : ${lrclibOk}`)
console.log(`  Failed    : ${failed}`)
const stillNoLyrics = songs.filter(
  (s) => !(Array.isArray(s.lyrics) && s.lyrics.length > 0),
).length
console.log(`Songs still missing lyrics after this run: ${stillNoLyrics}/${songs.length}`)
if (failures.length > 0) {
  console.log('\nFailures:')
  for (const f of failures.slice(0, 25)) console.log(`  ${f.id}: ${f.title} — ${f.artist}`)
  if (failures.length > 25) console.log(`  ... and ${failures.length - 25} more`)
}
