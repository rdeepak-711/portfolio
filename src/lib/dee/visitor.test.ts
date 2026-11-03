import { describe, it, expect, vi } from 'vitest'
import { describeOrigin, formatAsks, formatDigest, parseOrigin, visitorFromHeaders } from './visitor'
import { createDeeHandler, createDailyHandler, type ChatLogEntry } from './handlers'
import { MemoryStore } from './rate-limit'

const chat = (over: Partial<ChatLogEntry>): ChatLogEntry => ({ at: '2026-11-02T10:00:00Z', sessionId: 'dee-a', mode: 'recruiter', question: 'Q?', source: 'primary', escalate: false, turns: 1, answer: 'A.', ...over })

describe('visitor origin', () => {
  it('keeps clean values and drops anything that does not look right', () => {
    expect(parseOrigin({ ref: 'LI', referrer: 'linkedin.com', landing: '/' })).toEqual({ ref: 'li', referrer: 'linkedin.com', landing: '/' })
    expect(parseOrigin({ ref: '<script>', referrer: 'https://x.com/a', landing: 'javascript:1' })).toEqual({ ref: '', referrer: '', landing: '' })
    expect(parseOrigin(null)).toEqual({ ref: '', referrer: '', landing: '' })
  })

  it('reads location and device from Vercel headers', () => {
    const h = new Headers({ 'x-vercel-ip-country': 'IN', 'x-vercel-ip-country-region': 'TN', 'x-vercel-ip-city': 'Chennai%20City', 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile' })
    expect(visitorFromHeaders(h)).toEqual({ country: 'IN', region: 'TN', city: 'Chennai City', device: 'mobile' })
  })

  it('describes a visitor in one line', () => {
    expect(describeOrigin({ ref: 'li', referrer: 'linkedin.com', city: 'Chennai', country: 'IN', device: 'desktop', landing: '/' })).toBe('?ref=li via linkedin.com · Chennai, IN · desktop · first page /')
  })
})

describe('daily digest', () => {
  const now = new Date('2026-11-03T03:30:00Z')
  it('groups the last 24 hours by visitor and leaves out test sessions', () => {
    const d = formatDigest([
      chat({ sessionId: 'dee-a', question: 'Notice period?', answer: '30 days.', city: 'Bengaluru' }),
      chat({ sessionId: 'dee-a', at: '2026-11-02T10:01:00Z', question: 'Salary?', escalate: true }),
      chat({ sessionId: 'dee-b', question: 'Docker?' }),
      chat({ sessionId: 'smoke-test', question: 'test' }),
      chat({ sessionId: 'dee-c', at: '2026-10-30T10:00:00Z', question: 'old' }),
    ], now)
    expect(d).toMatchObject({ count: 3, visitors: 2 })
    expect(d.text).toContain('Notice period?')
    expect(d.text).toContain('30 days.')
    expect(d.text).toContain('Dee offered to send it to you')
    expect(d.text).not.toContain('test')
    expect(d.text).not.toContain('old')
  })

  it('says so when nobody asked', () => {
    expect(formatDigest([], now).text).toBe('No one asked Dee anything in the last 24 hours.')
  })

  it('goes out in the daily email even when the question bank is empty', async () => {
    const emailDeepak = vi.fn(async () => true)
    const res = await createDailyHandler({
      cronSecret: 'c', answerSecret: 's', siteUrl: 'https://x', bank: [],
      recentAskQuestions: async () => [], askedIds: async () => new Set(), markAsked: vi.fn(async () => {}),
      emailDeepak, recentChats: async () => [chat({ question: 'Where is he based?' })], now: () => now,
    })(new Request('http://x', { headers: { authorization: 'Bearer c' } }))
    expect((await res.json()).chats).toBe(1)
    expect(emailDeepak.mock.calls[0][1]).toContain('Where is he based?')
  })
})

describe('chat log', () => {
  it('logs the answer, origin and location, and no IP', async () => {
    const logChat = vi.fn(async () => {})
    const handler = createDeeHandler({
      store: new MemoryStore(), spentToday: async () => 0, addSpend: async () => {}, price: { inputPerMTok: 1, outputPerMTok: 5 },
      primary: vi.fn(async () => ({ text: 'Deepak built sites.', claimIds: ['F2'], escalate: false, usage: { inputTokens: 1, outputTokens: 1 } })), fallback: vi.fn(), logChat,
    })
    await handler(new Request('http://x/api/dee', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '9.9.9.9', 'x-vercel-ip-city': 'Pune', 'x-vercel-ip-country': 'IN' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'Sites?' }], mode: 'recruiter', sessionId: 's1', origin: { ref: 'li', referrer: 'linkedin.com', landing: '/' } }) }))
    const entry = (logChat.mock.calls[0] as unknown[])[0] as ChatLogEntry
    expect(entry).toMatchObject({ answer: 'Deepak built sites.', ref: 'li', referrer: 'linkedin.com', city: 'Pune', country: 'IN' })
    expect(JSON.stringify(entry)).not.toContain('9.9.9.9')
  })
})

describe('digest: test sessions and Ask Deepak requests (3 Nov)', () => {
  const now = new Date('2026-11-02T12:00:00Z')

  it('leaves out Claude test sessions as well as smoke- ones', () => {
    const d = formatDigest([chat({ sessionId: 'claude-smoke-1', question: 'Notice?' }), chat({ sessionId: 'dee-z', question: 'Real?' })], now)
    expect(d).toMatchObject({ count: 1, visitors: 1 })
    expect(d.text).not.toContain('Notice?')
  })

  it('lists Ask Deepak requests from the last 24 hours with who sent them and where they were delivered', () => {
    const text = formatAsks([
      { question: 'Can he start in 2 weeks?', email: 'r@acme.com', name: 'Riya', company: 'Acme', at: '2026-11-02T10:00:00Z', delivered: { email: true, telegram: false } },
      { question: 'Old one?', email: 'o@x.com', at: '2026-10-30T10:00:00Z' },
      { question: 'No time on it?', email: 'n@x.com' },
    ], now)
    expect(text).toContain('1 person used Ask Deepak')
    expect(text).toContain('Riya (Acme) <r@acme.com>')
    expect(text).toContain('Can he start in 2 weeks?')
    expect(text).toContain('email sent · Telegram failed')
    expect(text).not.toContain('Old one?')
    expect(text).not.toContain('No time on it?')
  })

  it('says so when nobody used Ask Deepak', () => {
    expect(formatAsks([], now)).toBe('No one used Ask Deepak in the last 24 hours.')
  })

  it('puts the Ask Deepak section in the daily email', async () => {
    const emailDeepak = vi.fn(async () => true)
    await createDailyHandler({
      cronSecret: 'c', answerSecret: 's', siteUrl: 'https://x', bank: [],
      recentAskQuestions: async () => [], askedIds: async () => new Set(), markAsked: vi.fn(async () => {}),
      emailDeepak, recentChats: async () => [], now: () => now,
      recentAsks: async () => [{ question: 'Is he open to contract?', email: 'f@x.com', at: '2026-11-02T11:00:00Z' }],
    })(new Request('http://x', { headers: { authorization: 'Bearer c' } }))
    const body = emailDeepak.mock.calls[0][1] as string
    expect(body).toContain('ASKED YOU DIRECTLY (Ask Deepak form)')
    expect(body).toContain('Is he open to contract?')
  })
})
