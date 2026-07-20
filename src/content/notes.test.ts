import { describe, it, expect } from 'vitest'
import { NOTES, noteBySlug, noteForVideo } from './notes'
import { VIDEOS } from './videos'

describe('NOTES data integrity', () => {
  it('has entries', () => {
    expect(NOTES.length).toBeGreaterThan(0)
  })

  it('has unique slugs', () => {
    const slugs = NOTES.map((n) => n.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every note has a title, dek and body', () => {
    for (const n of NOTES) {
      expect(n.title.trim(), `${n.slug} title`).not.toBe('')
      expect(n.dek.trim(), `${n.slug} dek`).not.toBe('')
      expect(n.body.length, `${n.slug} body`).toBeGreaterThan(0)
    }
  })

  // a note that claims a video must point at one that exists, or the page
  // renders an embed for nothing
  it('every video reference resolves to a real video', () => {
    const known = new Set(VIDEOS.map((v) => v.slug))
    for (const n of NOTES) {
      if (n.video) expect(known.has(n.video), `${n.slug} → ${n.video}`).toBe(true)
    }
  })

  it('code blocks declare a language', () => {
    for (const n of NOTES) {
      for (const block of n.body) {
        if (block.kind === 'code') {
          expect(block.lang, `${n.slug} code lang`).toBeTruthy()
        }
      }
    }
  })

  it('every note date is a valid ISO date', () => {
    for (const n of NOTES) {
      expect(n.date, `${n.slug} date`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(n.date))).toBe(false)
    }
  })
})

describe('lookups', () => {
  it('finds a note by slug', () => {
    const first = NOTES[0]
    expect(noteBySlug(first.slug)).toEqual(first)
  })

  it('returns undefined for an unknown slug', () => {
    expect(noteBySlug('does-not-exist')).toBeUndefined()
  })

  it('finds the note written about a given video', () => {
    const withVideo = NOTES.find((n) => n.video)
    if (!withVideo) return
    expect(noteForVideo(withVideo.video!)?.slug).toBe(withVideo.slug)
  })

  it('returns undefined when a video has no note', () => {
    expect(noteForVideo('a-video-nobody-wrote-about')).toBeUndefined()
  })
})
