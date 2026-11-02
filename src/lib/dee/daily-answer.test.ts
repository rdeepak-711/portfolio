import { describe, it, expect, vi } from 'vitest'
import { createDeeHandler, createDailyHandler, createAnswerHandler } from './handlers'
import { MemoryStore } from './rate-limit'
import { answerToClaim, emailSubject, signQuestion, visitorQuestionId, type StoredAnswer } from './answers'

const SECRET = 'test-secret'
const stored: StoredAnswer = { id: 'd01', kind: 'daily', question: 'Why do you prefer state machines for bots?', answer: 'Because every path can be tested before a customer sees it.', at: '2026-11-03T03:30:00Z', public: true }
const post = (url: string, body: unknown) => new Request(url, { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': '1.1.1.1' }, body: JSON.stringify(body) })

describe('Dee chat with answered questions', () => {
  it('can cite an answered question and returns its source', async () => {
    const handler = createDeeHandler({
      store: new MemoryStore(), spentToday: async () => 0, addSpend: async () => {}, price: { inputPerMTok: 1, outputPerMTok: 5 },
      primary: vi.fn(async () => ({ text: 'He prefers state machines because every path can be tested first.', claimIds: ['Q-d01'], escalate: false, usage: { inputTokens: 10, outputTokens: 10 } })),
      fallback: vi.fn(),
      loadAnswerClaims: async () => [answerToClaim(stored)],
    })
    const body = await (await handler(post('http://x/api/dee', { messages: [{ role: 'user', content: 'Why state machines?' }], mode: 'recruiter', sessionId: 's1' }))).json()
    expect(body.claimIds).toEqual(['Q-d01'])
    expect(body.sources[0]).toMatchObject({ id: 'Q-d01', label: 'Deepak, answering a daily question, 3 Nov 2026' })
  })

  it('still answers when loading answers fails', async () => {
    const handler = createDeeHandler({
      store: new MemoryStore(), spentToday: async () => 0, addSpend: async () => {}, price: { inputPerMTok: 1, outputPerMTok: 5 },
      primary: vi.fn(async () => ({ text: 'Deepak built sites.', claimIds: ['F2'], escalate: false, usage: { inputTokens: 10, outputTokens: 10 } })),
      fallback: vi.fn(),
      loadAnswerClaims: async () => { throw new Error('redis down') },
    })
    expect((await handler(post('http://x/api/dee', { messages: [{ role: 'user', content: 'Sites?' }], mode: 'recruiter', sessionId: 's1' }))).status).toBe(200)
  })
})

function dailyDeps(over = {}) {
  return {
    cronSecret: 'cron', answerSecret: SECRET, siteUrl: 'https://rdeepak.vercel.app',
    recentAskQuestions: async () => ['newest question?', 'oldest question?'],
    askedIds: async () => new Set<string>(),
    markAsked: vi.fn(async () => {}),
    emailDeepak: vi.fn(async () => true),
    bank: [{ id: 'd01', q: 'Bank question?' }],
    ...over,
  }
}
const cron = (auth = 'Bearer cron') => new Request('http://x/api/dee/daily', { headers: { authorization: auth } })

describe('Daily question handler', () => {
  it('refuses calls without the cron secret', async () => {
    expect((await createDailyHandler(dailyDeps())(cron('Bearer nope'))).status).toBe(401)
  })

  it('emails the oldest unanswered visitor question with a signed link, then marks it asked', async () => {
    const deps = dailyDeps()
    const body = await (await createDailyHandler(deps)(cron())).json()
    const id = visitorQuestionId('oldest question?')
    expect(body).toMatchObject({ sent: true, id, kind: 'visitor' })
    const text = deps.emailDeepak.mock.calls[0][1] as string
    expect(text).toContain('oldest question?')
    expect(text).toContain(`sig=${signQuestion(id, 'visitor', 'oldest question?', SECRET)}`)
    expect(deps.markAsked).toHaveBeenCalledWith(id)
  })

  it('does not mark a question asked when the email fails, so it is retried', async () => {
    const deps = dailyDeps({ emailDeepak: vi.fn(async () => false) })
    await createDailyHandler(deps)(cron())
    expect(deps.markAsked).not.toHaveBeenCalled()
  })
})

describe('Email subject', () => {
  it('shows the whole question when it fits, and cuts long ones at a word', () => {
    expect(emailSubject('What is a problem you solved by changing the process instead of the code?')).toBe('Dee asks: What is a problem you solved by changing the process instead of the code?')
    const long = emailSubject('word '.repeat(60))
    expect(long.endsWith('word…')).toBe(true)
    expect(long.length).toBeLessThanOrEqual('Dee asks: '.length + 151)
  })
})

describe('Answer handler', () => {
  const valid = { id: 'd01', kind: 'daily', question: 'Bank question?', answer: 'A real answer of some length.', public: true, sig: signQuestion('d01', 'daily', 'Bank question?', SECRET) }

  it('saves an answer from a signed link', async () => {
    const saveAnswer = vi.fn(async () => {})
    const res = await createAnswerHandler({ store: new MemoryStore(), answerSecret: SECRET, saveAnswer })(post('http://x/api/dee/answer', valid))
    expect(res.status).toBe(200)
    expect(saveAnswer).toHaveBeenCalledWith(expect.objectContaining({ id: 'd01', answer: 'A real answer of some length.', public: true }))
  })

  it('rejects a forged or edited link', async () => {
    const saveAnswer = vi.fn(async () => {})
    const res = await createAnswerHandler({ store: new MemoryStore(), answerSecret: SECRET, saveAnswer })(post('http://x/api/dee/answer', { ...valid, question: 'Edited question?' }))
    expect(res.status).toBe(403)
    expect(saveAnswer).not.toHaveBeenCalled()
  })
})
