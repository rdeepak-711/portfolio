import { describe, it, expect, vi } from 'vitest'
import { createDeeHandler } from './handlers'
import { MemoryStore } from './rate-limit'
import { buildSystemPrompt } from './prompt'
import { CLAIMS } from '@/content/dee/claims'
import { FAQ } from '@/content/dee/faq'
import { LIMITS } from '@/content/dee/limits'
import { PROFILE } from '@/content/dee/profile'

const price = { inputPerMTok: 1, outputPerMTok: 5 }
const ask = { messages: [{ role: 'user', content: 'How many sites did he build?' }], mode: 'recruiter', sessionId: 's1' }
const req = () => new Request('http://x/api/dee', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.1.1.1' }, body: JSON.stringify(ask) })
const reply = (text: string) => ({ text, claimIds: ['F2'], escalate: false, usage: { inputTokens: 1000, outputTokens: 100 } })
const broken = { incr: async () => { throw new Error('Redis down') } }

function deps(over: Partial<Parameters<typeof createDeeHandler>[0]> = {}) {
  return {
    store: new MemoryStore(),
    spentToday: async () => 0,
    addSpend: vi.fn(async () => {}),
    primary: vi.fn(async () => reply('Deepak built 70+ sites. [F2]')),
    fallback: vi.fn(async () => reply('Fallback: Deepak built 70+ sites.')),
    price,
    ...over,
  }
}

describe('Dee handler when the store fails', () => {
  it('still answers when the rate-limit store throws', async () => {
    const res = await createDeeHandler(deps({ store: broken }))(req())
    expect(res.status).toBe(200)
  })

  it('skips the paid model when today\'s spend cannot be read', async () => {
    const d = deps({ spentToday: async () => { throw new Error('Redis down') } })
    const body = await (await createDeeHandler(d)(req())).json()
    expect(d.primary).not.toHaveBeenCalled()
    expect(body.source).toBe('fallback')
  })

  it('keeps the answer when recording spend fails', async () => {
    const d = deps({ addSpend: vi.fn(async () => { throw new Error('Redis down') }) })
    const res = await createDeeHandler(d)(req())
    expect(res.status).toBe(200)
    expect((await res.json()).source).toBe('primary')
  })
})

describe('claim tags', () => {
  it('strips inline claim tags from the answer text, keeping claimIds', async () => {
    const d = deps({ primary: vi.fn(async () => ({ ...reply('Deepak built 70+ sites [F2, U1]. He is in Chennai. [U1]'), claimIds: ['F2', 'U1'] })) })
    const body = await (await createDeeHandler(d)(req())).json()
    expect(body.text).toBe('Deepak built 70+ sites. He is in Chennai.')
    expect(body.claimIds).toEqual(['F2', 'U1'])
  })

  it('tells the model to put claim IDs only in claimIds', () => {
    const p = buildSystemPrompt({ claims: CLAIMS, faq: FAQ, limits: LIMITS, profile: PROFILE, mode: 'recruiter' })
    expect(p).toContain('Never write claim IDs in "text"')
  })
})
