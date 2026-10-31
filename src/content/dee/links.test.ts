import { describe, it, expect } from 'vitest'
import { CLAIMS } from './claims'
import { buildSystemPrompt } from '@/lib/dee/prompt'
import { FAQ } from './faq'
import { LIMITS } from './limits'
import { PROFILE } from './profile'

const byId = (id: string) => CLAIMS.find((c) => c.id === id)!
const hrefs = (id: string) => (byId(id).links ?? []).map((l) => l.href)

// Dee can only point at what the claims carry, so the checkable claims must carry their public pages
describe('claim links (where a visitor can check a claim)', () => {
  it('gives escalation-gate its repo, live site and a real packet', () => {
    expect(hrefs('P1')).toEqual(expect.arrayContaining([
      'https://github.com/rdeepak-711/escalation-gate',
      'https://gate.outbuiltit.com',
      'https://gate.outbuiltit.com/packets/hiring-agent-424.html',
    ]))
  })

  it('gives the hiring-agent bug its issue and open PR', () => {
    expect(hrefs('P2')).toEqual(expect.arrayContaining([
      'https://github.com/interviewstreet/hiring-agent/issues/479',
      'https://github.com/interviewstreet/hiring-agent/pull/480',
    ]))
  })

  it('links each live product to itself', () => {
    expect(hrefs('F2')).toContain('/case-study/firestorm-pipeline')
    expect(hrefs('F7')).toContain('https://crowd-tracker.com')
    expect(hrefs('F8')).toContain('https://forum.louvremuseum-guide.com/')
    expect(hrefs('F9')).toContain('https://f1weekend.co')
    expect(hrefs('P4')).toContain('https://lifedots.outbuiltit.com')
    expect(hrefs('U4')).toContain('/case-study/uipath-ml')
  })

  it('uses only https links or this site’s own paths, with a label each', () => {
    for (const c of CLAIMS) for (const l of c.links ?? []) {
      expect(l.href, `${c.id} ${l.href}`).toMatch(/^(https:\/\/|\/[a-z])/)
      expect(l.label.length, `${c.id} ${l.href}`).toBeGreaterThan(2)
    }
  })

  it('never links a private claim', () => {
    for (const c of CLAIMS) if (!c.public) expect(c.links ?? [], c.id).toEqual([])
  })
})

describe('prompt tells the model the links exist', () => {
  const prompt = buildSystemPrompt({ claims: CLAIMS, faq: FAQ, limits: LIMITS, profile: PROFILE, mode: 'recruiter' })

  it('lists each claim’s link labels next to it', () => {
    const p1 = prompt.split('\n\n').find((s) => s.startsWith('P1:'))!
    for (const l of byId('P1').links!) expect(p1).toContain(l.label)
  })

  it('says links appear under the answer and forbids inventing URLs', () => {
    expect(prompt).toMatch(/links .*under (your|the) answer/i)
    expect(prompt).toMatch(/never (write|invent|make up) (a )?URL/i)
  })
})
