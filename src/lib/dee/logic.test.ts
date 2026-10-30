import { describe, it, expect } from 'vitest'
import { extractNumbers, ungroundedNumbers } from './grounding'
import { BANNED_PHRASES, findPolicyViolations } from './policy'
import { DAILY_CAP_USD, costUsd, pickModel } from './budget'
import { MemoryStore, checkRateLimit } from './rate-limit'
import { validateAsk } from './ask'
import { TOUR_STOPS } from './tour'
import { CLAIMS } from '@/content/dee/claims'
import type { Claim } from '@/content/dee/types'

describe('grounding', () => {
  it('extracts numbers, keeping ranges, plus-numbers and currency whole', () => {
    const got = extractNumbers('70+ sites, 108,043 users, 85–90% entries, 60–70 visits, $0.41 a run, ₹1L+ and 3.5 hours')
    for (const n of ['70+', '108,043', '85–90%', '60–70', '$0.41', '₹1L+', '3.5']) expect(got, n).toContain(n)
  })

  it('flags numbers that no claim supports', () => {
    const claims: Claim[] = [{ id: 'X', text: 'It built 70+ sites with 108,043 users.', confidence: 'verified', sourceLabel: 'src', sourceUrl: null, public: true }]
    expect(ungroundedNumbers('He built 70+ sites for 108,043 users.', claims)).toEqual([])
    expect(ungroundedNumbers('He built 70+ sites for 600+ users a day.', claims)).toEqual(['600+'])
  })

  it('exempts single digits and years', () => {
    expect(ungroundedNumbers('In 2026 he shipped 3 things.', [])).toEqual([])
  })

  it('the real claims ground the headline numbers', () => {
    expect(ungroundedNumbers('70+ sites, 108,043 users, 45% to 85–90%, 4,616 users', CLAIMS)).toEqual([])
  })
})

describe('policy', () => {
  it('bans the retired and private phrases', () => {
    for (const p of ['Reckitt', 'PakkaBot', 'Senior', '600+', '68 of 117', 'fixed upstream', 'dead-letter', 'CI/CD', 'Cloud Build', 'Software Engineer II', 'salary', 'CTC', 'Quantitative']) {
      expect(BANNED_PHRASES, p).toContain(p)
    }
  })

  it('finds every hit, case-insensitively', () => {
    const v = findPolicyViolations('He is a senior engineer who worked with reckitt and fixed upstream bugs.')
    expect(v).toEqual(expect.arrayContaining(['Senior', 'Reckitt', 'fixed upstream']))
  })

  it('flags Dee speaking as Deepak, but allows Dee to introduce itself', () => {
    expect(findPolicyViolations('I built the pipeline at Firestorm.')).not.toEqual([])
    expect(findPolicyViolations("Here's my CV.")).not.toEqual([])
    expect(findPolicyViolations("I'm Dee, Deepak's guide. Deepak built the pipeline.")).toEqual([])
  })
})

describe('budget', () => {
  it('caps spend at $5 a day', () => {
    expect(DAILY_CAP_USD).toBe(5)
    expect(pickModel(0)).toBe('primary')
    expect(pickModel(4.99)).toBe('primary')
    expect(pickModel(5)).toBe('fallback')
    expect(pickModel(1, 1)).toBe('fallback')
  })

  it('prices tokens per million, including cached input', () => {
    expect(costUsd({ inputTokens: 1_000_000, outputTokens: 0 }, { inputPerMTok: 1, outputPerMTok: 5 })).toBeCloseTo(1)
    expect(costUsd({ inputTokens: 0, outputTokens: 200_000 }, { inputPerMTok: 1, outputPerMTok: 5 })).toBeCloseTo(1)
    expect(costUsd({ inputTokens: 0, outputTokens: 0, cachedInputTokens: 1_000_000 }, { inputPerMTok: 1, outputPerMTok: 5, cachedInputPerMTok: 0.1 })).toBeCloseTo(0.1)
  })
})

describe('rate limit', () => {
  it('allows up to the limit, then blocks', async () => {
    const store = new MemoryStore()
    const results = []
    for (let i = 0; i < 4; i++) results.push(await checkRateLimit(store, 'ip:1', 3, 86400))
    expect(results.map((r) => r.allowed)).toEqual([true, true, true, false])
    expect(results[0].remaining).toBe(2)
  })

  it('resets after the window', async () => {
    let now = 0
    const store = new MemoryStore(() => now)
    for (let i = 0; i < 3; i++) await checkRateLimit(store, 'k', 3, 10)
    expect((await checkRateLimit(store, 'k', 3, 10)).allowed).toBe(false)
    now = 11_000
    expect((await checkRateLimit(store, 'k', 3, 10)).allowed).toBe(true)
  })

  it('keeps keys separate', async () => {
    const store = new MemoryStore()
    await checkRateLimit(store, 'a', 1, 60)
    expect((await checkRateLimit(store, 'b', 1, 60)).allowed).toBe(true)
  })
})

describe('ask validation', () => {
  const good = { question: 'Can he start in January?', email: 'cto@example.com' }

  it('accepts a valid ask', () => {
    const r = validateAsk(good)
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.spam).toBe(false)
  })

  it('rejects a missing or bad email and a too-short or too-long question', () => {
    expect(validateAsk({ question: 'Hello there' }).ok).toBe(false)
    expect(validateAsk({ ...good, email: 'nope' }).ok).toBe(false)
    expect(validateAsk({ ...good, question: '  hi ' }).ok).toBe(false)
    expect(validateAsk({ ...good, question: 'x'.repeat(2001) }).ok).toBe(false)
    expect(validateAsk(null).ok).toBe(false)
  })

  it('marks a filled honeypot as spam without rejecting', () => {
    const r = validateAsk({ ...good, website: 'http://spam' })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.spam).toBe(true)
  })

  it('truncates a long transcript instead of rejecting', () => {
    const r = validateAsk({ ...good, transcript: 'y'.repeat(30_000) })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.value.transcript!.length).toBeLessThanOrEqual(20_000)
  })
})

describe('tour', () => {
  it('has the six stops in order', () => {
    expect(TOUR_STOPS.map((s) => s.sectionId)).toEqual(['top', 'project-factory', 'project-crowdtracker', 'project-gate', 'how-i-work', 'contact'])
  })

  it('checks a number on each project stop, cites real claims, keeps lines short and clean', () => {
    const ids = new Set(CLAIMS.map((c) => c.id))
    for (const s of TOUR_STOPS.slice(1, 4)) expect(s.pose, s.id).toBe('check')
    for (const s of TOUR_STOPS) {
      for (const id of s.claimIds) expect(ids.has(id), `${s.id} → ${id}`).toBe(true)
      for (const line of s.lines) {
        expect(line.length, line).toBeLessThanOrEqual(160)
        expect(findPolicyViolations(line), line).toEqual([])
        expect(ungroundedNumbers(line, CLAIMS), line).toEqual([])
      }
    }
  })
})
