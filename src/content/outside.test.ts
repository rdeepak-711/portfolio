import { describe, it, expect } from 'vitest'
import { OUTSIDE_WORK } from './outside'

describe('OUTSIDE_WORK', () => {
  it('has the verified entries', () => {
    const hrefs = OUTSIDE_WORK.flatMap((w) => w.links.map((l) => l.href))
    expect(hrefs).toEqual(
      expect.arrayContaining([
        'https://github.com/interviewstreet/hiring-agent/issues/479',
        'https://github.com/interviewstreet/hiring-agent/pull/480',
        'https://github.com/crewAIInc/crewAI/issues/6072#issuecomment-6423394143',
      ]),
    )
  })

  // an open PR or a comment is never described as a fix that landed ("isn't merged yet" is fine)
  it('never calls unmerged work fixed or merged', () => {
    for (const w of OUTSIDE_WORK) {
      expect(['open', 'merged', 'comment']).toContain(w.status)
      for (const l of w.links) expect(l.href, w.title).toMatch(/^https:\/\/github\.com\//)
      if (w.status !== 'merged') expect(`${w.title} ${w.plain}`, w.title).not.toMatch(/\bfixed\b|\b(was|been|got) merged\b|merged into/i)
    }
  })

  it('dates every entry', () => {
    for (const w of OUTSIDE_WORK) expect(w.date, w.title).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
