import { describe, it, expect } from 'vitest'
import { NOTES, NOTE_LANES, RETIRED_NOTE_SLUGS, noteBySlug, noteForVideo } from './notes'
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

describe('writing lanes', () => {
  it('every note sits in a declared lane', () => {
    const declared = new Set(NOTE_LANES.map((l) => l.id))
    for (const n of NOTES) expect(declared.has(n.lane), `${n.slug} → ${n.lane}`).toBe(true)
  })

  // LeetCode is one lane, not the whole site: keep only the notes where I
  // found or made a real mistake, not textbook tricks
  it('keeps LeetCode to a few notes', () => {
    expect(NOTES.filter((n) => n.lane === 'leetcode').length).toBeLessThanOrEqual(4)
  })

  it('retired notes are gone from NOTES', () => {
    for (const slug of RETIRED_NOTE_SLUGS) expect(noteBySlug(slug), slug).toBeUndefined()
  })
})

describe('Travel Measured', () => {
  it('has the every-30-minutes post in its own lane, linking the live method page', () => {
    const n = noteBySlug('site-said-every-30-minutes')
    expect(n?.lane).toBe('travel-measured')
    const links = n!.body.filter((b) => b.kind === 'link')
    expect(links.map((l) => l.kind === 'link' && l.href)).toContain('https://travelmeasured.vercel.app/method')
  })

  it('every link block is https', () => {
    for (const n of NOTES)
      for (const b of n.body) if (b.kind === 'link') expect(b.href, n.slug).toMatch(/^https:\/\//)
  })
})

describe('LifeDots', () => {
  it('has the 60-second idle post under Outbuiltit, linking the live site', () => {
    const n = noteBySlug('lifedots-stops-after-60-seconds')
    expect(n?.lane).toBe('outbuiltit')
    expect(n!.body.some((b) => b.kind === 'link' && b.href === 'https://lifedots.outbuiltit.com')).toBe(true)
  })

  // LifeDots counts any sites the user picks, and the register allows installs,
  // never a user count
  it('never calls LifeDots a LeetCode tracker or states a user count', () => {
    for (const n of NOTES) {
      const text = JSON.stringify(n)
      if (!text.includes('LifeDots')) continue
      expect(text, n.slug).not.toMatch(/LeetCode tracker|\d+\s+(weekly\s+)?users|active users/i)
    }
  })
})

describe('escalation-gate #477', () => {
  it('has the merges-clean-but-crashes post under Outbuiltit, linking the packet and the PR', () => {
    const n = noteBySlug('pr-merges-clean-and-crashes')
    expect(n?.lane).toBe('outbuiltit')
    const hrefs = n!.body.flatMap((b) => (b.kind === 'link' ? [b.href] : []))
    expect(hrefs).toEqual(
      expect.arrayContaining([
        'https://gate.outbuiltit.com/hiring-agent/issues/476.html',
        'https://github.com/interviewstreet/hiring-agent/pull/477',
      ]),
    )
  })
})

describe('LifeDots research post', () => {
  it('sits under Outbuiltit, states the real corpus size and links the live site', () => {
    const n = noteBySlug('lifedots-3339-bad-reviews')
    expect(n?.lane).toBe('outbuiltit')
    expect(JSON.stringify(n)).toContain('3,339')
    expect(n!.body.some((b) => b.kind === 'link' && b.href === 'https://lifedots.outbuiltit.com')).toBe(true)
  })
})

describe('Travel Measured measured-vs-estimated post', () => {
  it('sits in its lane and links the live method and accuracy pages', () => {
    const n = noteBySlug('measured-or-estimated')
    expect(n?.lane).toBe('travel-measured')
    const hrefs = n!.body.flatMap((b) => (b.kind === 'link' ? [b.href] : []))
    expect(hrefs).toEqual(
      expect.arrayContaining(['https://travelmeasured.vercel.app/method', 'https://travelmeasured.vercel.app/accuracy']),
    )
  })
})

describe('escalation-gate MCP post', () => {
  it('sits under Outbuiltit, links the public repo, and never claims outside users', () => {
    const n = noteBySlug('escalation-gate-as-an-mcp-server')
    expect(n?.lane).toBe('outbuiltit')
    expect(n!.body.some((b) => b.kind === 'link' && b.href.startsWith('https://github.com/rdeepak-711/escalation-gate'))).toBe(true)
    expect(JSON.stringify(n)).not.toMatch(/agents use|teams use|used by/i)
  })
})
