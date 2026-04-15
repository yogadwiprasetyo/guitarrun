import { describe, it, expect } from 'vitest'
import { parseYouTubeUrl, parseTimestamp, isYouTubeUrlOrId } from './youtube'

describe('parseYouTubeUrl', () => {
  it('extracts id from canonical /watch URL', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/watch?v=bx1Bh8ZvH84')).toEqual({
      videoId: 'bx1Bh8ZvH84',
    })
  })

  it('extracts id from youtu.be short URL', () => {
    expect(parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toEqual({
      videoId: 'dQw4w9WgXcQ',
    })
  })

  it('extracts id from /embed/ URL', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/embed/abcDEF12345')).toEqual({
      videoId: 'abcDEF12345',
    })
  })

  it('extracts id from /shorts/ URL', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/shorts/abcDEF12345')).toEqual({
      videoId: 'abcDEF12345',
    })
  })

  it('accepts a bare 11-char video id', () => {
    expect(parseYouTubeUrl('bx1Bh8ZvH84')).toEqual({ videoId: 'bx1Bh8ZvH84' })
  })

  it('honors a numeric t= timestamp', () => {
    expect(parseYouTubeUrl('https://youtu.be/bx1Bh8ZvH84?t=42')).toEqual({
      videoId: 'bx1Bh8ZvH84',
      startSeconds: 42,
    })
  })

  it('honors an h-m-s t= timestamp', () => {
    expect(parseYouTubeUrl('https://www.youtube.com/watch?v=bx1Bh8ZvH84&t=1m30s')).toEqual({
      videoId: 'bx1Bh8ZvH84',
      startSeconds: 90,
    })
  })

  it('returns null for non-YouTube URLs', () => {
    expect(parseYouTubeUrl('https://example.com/foo')).toBeNull()
  })

  it('returns null for nonsense input', () => {
    expect(parseYouTubeUrl('not a url')).toBeNull()
  })

  it('returns null for empty string', () => {
    expect(parseYouTubeUrl('')).toBeNull()
  })

  it('returns null for an invalid id length', () => {
    expect(parseYouTubeUrl('https://youtu.be/short')).toBeNull()
  })

  it('handles m.youtube.com mobile URL', () => {
    expect(parseYouTubeUrl('https://m.youtube.com/watch?v=abcDEF12345')).toEqual({
      videoId: 'abcDEF12345',
    })
  })
})

describe('parseTimestamp', () => {
  it('parses bare seconds', () => {
    expect(parseTimestamp('90')).toBe(90)
  })
  it('parses h-m-s combinations', () => {
    expect(parseTimestamp('2h5m')).toBe(2 * 3600 + 5 * 60)
    expect(parseTimestamp('45s')).toBe(45)
  })
  it('returns undefined for empty / unparseable', () => {
    expect(parseTimestamp('')).toBeUndefined()
    expect(parseTimestamp('abc')).toBeUndefined()
  })
})

describe('isYouTubeUrlOrId', () => {
  it('true for valid', () => {
    expect(isYouTubeUrlOrId('https://youtu.be/bx1Bh8ZvH84')).toBe(true)
  })
  it('false for invalid', () => {
    expect(isYouTubeUrlOrId('https://example.com')).toBe(false)
  })
})
