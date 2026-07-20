import { describe, it, expect } from 'vitest'
import { VIDEOS, LANES, videosByLane, thumbnailUrl, watchUrl } from './videos'

describe('VIDEOS data integrity', () => {
  it('has entries', () => {
    expect(VIDEOS.length).toBeGreaterThan(0)
  })

  it('every video has a valid 11-character YouTube id', () => {
    for (const v of VIDEOS) {
      expect(v.youtubeId, `${v.slug} youtubeId`).toMatch(/^[\w-]{11}$/)
    }
  })

  it('has no duplicate YouTube ids', () => {
    const ids = VIDEOS.map((v) => v.youtubeId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has no duplicate slugs', () => {
    const slugs = VIDEOS.map((v) => v.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every video has a non-empty title and blurb', () => {
    for (const v of VIDEOS) {
      expect(v.title.trim(), `${v.slug} title`).not.toBe('')
      expect(v.blurb.trim(), `${v.slug} blurb`).not.toBe('')
    }
  })

  it('every video date is a valid ISO date', () => {
    for (const v of VIDEOS) {
      expect(v.date, `${v.slug} date`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(Number.isNaN(Date.parse(v.date)), `${v.slug} parseable`).toBe(false)
    }
  })

  // guards the UI: a video in a lane LANES doesn't know about would render nowhere
  it('every lane used by a video is declared in LANES', () => {
    const declared = new Set(LANES.map((l) => l.id))
    for (const v of VIDEOS) {
      expect(declared.has(v.lane), `lane "${v.lane}" (${v.slug}) missing from LANES`).toBe(true)
    }
  })

  it('article links, when present, are site-relative', () => {
    for (const v of VIDEOS) {
      if (v.article) expect(v.article, `${v.slug} article`).toMatch(/^\//)
    }
  })
})

describe('videosByLane', () => {
  it('returns only videos from the requested lane', () => {
    for (const lane of LANES) {
      for (const v of videosByLane(lane.id)) {
        expect(v.lane).toBe(lane.id)
      }
    }
  })

  it('returns newest first', () => {
    for (const lane of LANES) {
      const dates = videosByLane(lane.id).map((v) => Date.parse(v.date))
      const sorted = [...dates].sort((a, b) => b - a)
      expect(dates).toEqual(sorted)
    }
  })

  it('partitions VIDEOS completely across LANES', () => {
    const total = LANES.reduce((n, l) => n + videosByLane(l.id).length, 0)
    expect(total).toBe(VIDEOS.length)
  })
})

describe('url helpers', () => {
  it('thumbnailUrl points at the YouTube image CDN for that id', () => {
    expect(thumbnailUrl('ozUMkwIDjuc')).toBe('https://i.ytimg.com/vi/ozUMkwIDjuc/hqdefault.jpg')
  })

  it('watchUrl builds a shorts url', () => {
    expect(watchUrl('ozUMkwIDjuc')).toBe('https://www.youtube.com/shorts/ozUMkwIDjuc')
  })
})
