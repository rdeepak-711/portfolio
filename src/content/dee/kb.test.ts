import { describe, it, expect } from 'vitest'
import { CLAIMS } from './claims'
import { PROFILE } from './profile'
import { FAQ } from './faq'
import { LIMITS } from './limits'
import { GOLDEN } from './golden'
import { findPolicyViolations } from '@/lib/dee/policy'

const byId = (id: string) => CLAIMS.find((c) => c.id === id)

describe('claims (from the evidence register)', () => {
  const required = ['F2', 'F7', 'F8', 'F9', 'F10', 'U1', 'U2', 'U4', 'P1', 'P2', 'P4', 'P5', 'G1']

  it('has every required claim, public, with unique ids', () => {
    for (const id of required) {
      expect(byId(id), id).toBeDefined()
      expect(byId(id)!.public, id).toBe(true)
    }
    const ids = CLAIMS.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('uses the locked numbers exactly', () => {
    expect(byId('F2')!.text).toContain('70+')
    for (const n of ['108,043', '163,804', '60–70']) expect(byId('F7')!.text).toContain(n)
    expect(byId('F8')!.text).toContain('3 live forums')
    expect(byId('F9')!.text).toContain('4,616')
    expect(byId('U4')!.text).toContain('45%')
    expect(byId('U4')!.text).toContain('85–90%')
    expect(byId('P5')!.text).toContain('74')
    expect(byId('P5')!.text).toContain('77')
  })

  it('says PR #480 is open, never merged or fixed upstream', () => {
    const t = byId('P2')!.text
    expect(t).toContain('#480')
    expect(t.toLowerCase()).toContain('open')
    expect(t.toLowerCase()).not.toMatch(/merged|fixed upstream/)
  })

  it('counts LifeDots installs, never users', () => {
    const t = byId('P4')!.text
    expect(t).toContain('51 installs')
    expect(t.toLowerCase()).not.toMatch(/\busers?\b/)
  })

  it('describes the 2024–25 gap only as a family career break', () => {
    const t = byId('G1')!.text
    expect(t).toContain('career break for family reasons')
    expect(t.toLowerCase()).not.toMatch(/health|father|dad|ill/)
  })

  it('every claim has a confidence and a source label', () => {
    for (const c of CLAIMS) {
      expect(['verified', 'confirmed', 'self-reported']).toContain(c.confidence)
      expect(c.sourceLabel.length, c.id).toBeGreaterThan(2)
    }
  })

  it('no claim breaks the policy', () => {
    for (const c of CLAIMS) expect(findPolicyViolations(c.text), c.id).toEqual([])
  })
})

describe('profile', () => {
  it('positions Deepak as a Forward Deployed engineer with his location order', () => {
    expect(PROFILE.role).toContain('Forward Deployed')
    expect(PROFILE.locationOrder).toEqual(['Remote', 'Chennai', 'Bangalore'])
    expect(PROFILE.email).toBe('deepakrameshh@gmail.com')
    expect(PROFILE.links.github).toContain('github.com/rdeepak-711')
  })
})

describe('faq', () => {
  it('covers the recruiter questions', () => {
    expect(FAQ.length).toBeGreaterThanOrEqual(14)
    const qs = FAQ.map((f) => f.q.toLowerCase()).join(' | ')
    for (const topic of ['who', 'built', 'agent', 'deployed', 'claude code', 'end to end', 'strongest', 'debug', 'build for', 'weakness', 'why', 'fail', 'ask him', 'ai write']) {
      expect(qs, topic).toContain(topic)
    }
  })

  it('only cites claims that exist, and breaks no policy', () => {
    const ids = new Set(CLAIMS.map((c) => c.id))
    for (const f of FAQ) {
      for (const id of f.claimIds) expect(ids.has(id), `${f.q} → ${id}`).toBe(true)
      expect(findPolicyViolations(f.a), f.q).toEqual([])
    }
  })
})

describe('limits', () => {
  it('lists the off-limits topics and the honest gaps', () => {
    const off = LIMITS.offLimitsTopics.join(' ').toLowerCase()
    for (const t of ['salary', 'notice', 'family', 'health', 'client']) expect(off, t).toContain(t)
    const gaps = LIMITS.gaps.join(' ').toLowerCase()
    for (const t of ['hand', 'eval', 'rag', 'observability']) expect(gaps, t).toContain(t)
  })
})

describe('golden eval set', () => {
  it('has 40 cases in the agreed mix with unique ids', () => {
    expect(GOLDEN).toHaveLength(40)
    const count = (k: string) => GOLDEN.filter((g) => g.kind === k).length
    expect(count('factual')).toBe(15)
    expect(count('unknown')).toBe(10)
    expect(count('adversarial')).toBe(10)
    expect(count('tone')).toBe(5)
    expect(new Set(GOLDEN.map((g) => g.id)).size).toBe(40)
  })

  it('factual cases cite real claims; unknown cases expect escalation', () => {
    const ids = new Set(CLAIMS.map((c) => c.id))
    for (const g of GOLDEN.filter((g) => g.kind === 'factual')) {
      expect(g.mustCite?.length, g.id).toBeGreaterThan(0)
      for (const id of g.mustCite!) expect(ids.has(id), `${g.id} → ${id}`).toBe(true)
    }
    for (const g of GOLDEN.filter((g) => g.kind === 'unknown')) expect(g.mustEscalate, g.id).toBe(true)
  })
})
