import { describe, it, expect } from 'vitest'
import { CLAIMS } from './claims'
import { FAQ } from './faq'
import { faqAnswer } from '@/lib/dee/faq-match'
import { findPolicyViolations } from '@/lib/dee/policy'

const byId = (id: string) => CLAIMS.find((c) => c.id === id)

describe('current role and job history', () => {
  it('knows his current job at Firestorm', () => {
    const t = byId('F1')!.text
    for (const s of ['Software Engineer', 'Firestorm', 'Jul 2025', 'only developer']) expect(t, s).toContain(s)
    expect(t).not.toContain('II')
  })

  it('knows his UiPath job and dates', () => {
    const t = byId('U0')!.text
    for (const s of ['UiPath', 'RPA Developer', 'Feb 2023', 'Nov 2024']) expect(t, s).toContain(s)
    expect(findPolicyViolations(t)).toEqual([])
  })

  it('answers "what does he do now" from the FAQ without a model', () => {
    const a = faqAnswer('What does Deepak do now?', FAQ)
    expect(a.escalate).toBe(false)
    expect(a.claimIds).toContain('F1')
  })
})
