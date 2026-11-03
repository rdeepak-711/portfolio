import { describe, it, expect, vi } from 'vitest'
import { createDeeHandler, createAskHandler } from './handlers'
import { notifyDeepak } from './notify'
import { MemoryStore } from './rate-limit'

const price = { inputPerMTok: 1, outputPerMTok: 5 }
const reply = (text: string, claimIds: string[] = ['F2']) => ({ text, claimIds, escalate: false, usage: { inputTokens: 1000, outputTokens: 100 } })

function deeReq(body: unknown, ip = '1.1.1.1') {
  return new Request('http://x/api/dee', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(body) })
}
const ask = { messages: [{ role: 'user', content: 'How many sites did he build?' }], mode: 'recruiter', sessionId: 's1' }

function deeDeps(over: Partial<Parameters<typeof createDeeHandler>[0]> = {}) {
  let spent = 0
  return {
    store: new MemoryStore(),
    spentToday: async () => spent,
    addSpend: vi.fn(async (usd: number) => { spent += usd }),
    primary: vi.fn(async () => reply('Deepak built 70+ sites through the pipeline.')),
    fallback: vi.fn(async () => reply('Fallback: Deepak built 70+ sites.')),
    price,
    ...over,
  }
}

describe('Dee handler', () => {
  it('shows Ask Deepak whenever the reply offers to pass the question on', async () => {
    const deps = deeDeps({ primary: vi.fn(async () => reply("He hasn't told me that yet, so I won't guess. I can send your question to Deepak.", [])) })
    const body = await (await createDeeHandler(deps)(deeReq(ask))).json()
    expect(body.escalate).toBe(true)
  })

  it('answers with the primary model and records spend', async () => {
    const deps = deeDeps()
    const res = await createDeeHandler(deps)(deeReq(ask))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({ text: 'Deepak built 70+ sites through the pipeline.', claimIds: ['F2'], escalate: false, source: 'primary' })
    expect(deps.addSpend).toHaveBeenCalledOnce()
    expect(deps.addSpend.mock.calls[0][0]).toBeCloseTo(0.0015)
  })

  it('switches to the fallback once the day is over $5', async () => {
    const deps = deeDeps({ spentToday: async () => 5 })
    const body = await (await createDeeHandler(deps)(deeReq(ask))).json()
    expect(body.source).toBe('fallback')
    expect(deps.primary).not.toHaveBeenCalled()
  })

  it('falls back when the primary throws, and to the FAQ when both fail or are missing', async () => {
    const d1 = deeDeps({ primary: vi.fn(async () => { throw new Error('down') }) })
    expect((await (await createDeeHandler(d1)(deeReq(ask))).json()).source).toBe('fallback')
    const d2 = deeDeps({ primary: null, fallback: null })
    const b2 = await (await createDeeHandler(d2)(deeReq(ask))).json()
    expect(b2.source).toBe('faq')
    expect(typeof b2.text).toBe('string')
  })

  it('replaces an answer with an invented number or a policy break by a safe escalation', async () => {
    for (const text of ['Deepak had 600+ users a day.', 'He is a Senior engineer.']) {
      const deps = deeDeps({ primary: vi.fn(async () => reply(text)) })
      const body = await (await createDeeHandler(deps)(deeReq(ask))).json()
      expect(body.text).not.toContain(text)
      expect(body.escalate).toBe(true)
    }
  })

  it('rejects bad bodies and rate-limits by IP and by session', async () => {
    const deps = deeDeps()
    const h = createDeeHandler(deps)
    expect((await h(deeReq({ nope: 1 }))).status).toBe(400)
    let last = 200
    for (let i = 0; i < 21; i++) last = (await h(deeReq({ ...ask, sessionId: 'same' }, `ip-${i}`))).status
    expect(last).toBe(429)
    const h2 = createDeeHandler(deeDeps())
    for (let i = 0; i < 61; i++) last = (await h2(deeReq({ ...ask, sessionId: `s-${i}` }, '9.9.9.9'))).status
    expect(last).toBe(429)
  })
})

function askReq(body: unknown, ip = '2.2.2.2') {
  return new Request('http://x/api/ask-deepak', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': ip }, body: JSON.stringify(body) })
}
const goodAsk = { question: 'Is he open to a contract-to-hire FDE role?', email: 'founder@example.com' }

describe('multi-turn chats (3 Nov bug)', () => {
  it('sends earlier answers to the model in the JSON reply shape, so the next reply stays JSON', async () => {
    const primary = vi.fn(async () => reply('He studied at CIT.'))
    const deps = deeDeps({ primary })
    const res = await createDeeHandler(deps)(deeReq({ mode: 'recruiter', sessionId: 's-multi', messages: [
      { role: 'user', content: 'What does he do?' },
      { role: 'assistant', content: 'Deepak builds sites.' },
      { role: 'user', content: 'College?' },
    ] }))
    expect(res.status).toBe(200)
    const sent = primary.mock.calls[0][1] as { role: string; content: string }[]
    expect(sent[0]).toEqual({ role: 'user', content: 'What does he do?' })
    expect(JSON.parse(sent[1].content)).toEqual({ text: 'Deepak builds sites.', claimIds: [], escalate: false })
    expect(sent[2]).toEqual({ role: 'user', content: 'College?' })
  })

  it('leaves an earlier answer alone if it is already in the JSON shape', async () => {
    const primary = vi.fn(async () => reply('ok'))
    const prior = JSON.stringify({ text: 'Deepak builds sites.', claimIds: ['F2'], escalate: false })
    await createDeeHandler(deeDeps({ primary }))(deeReq({ mode: 'recruiter', sessionId: 's-multi2', messages: [
      { role: 'user', content: 'What does he do?' }, { role: 'assistant', content: prior }, { role: 'user', content: 'More?' },
    ] }))
    expect((primary.mock.calls[0][1] as { content: string }[])[1].content).toBe(prior)
  })
})

describe('Ask Deepak handler', () => {
  it('saves, notifies and reports delivery', async () => {
    const save = vi.fn(async () => {})
    const notify = vi.fn(async () => ({ email: true }))
    const res = await createAskHandler({ store: new MemoryStore(), save, notify })(askReq(goodAsk))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, delivered: { email: true } })
    expect(save).toHaveBeenCalledOnce()
    expect(notify).toHaveBeenCalledOnce()
  })

  it('stores when the ask came in and whether the email got it, for the daily digest', async () => {
    const save = vi.fn(async (_ask: unknown) => {})
    const notify = vi.fn(async () => ({ email: false }))
    await createAskHandler({ store: new MemoryStore(), save, notify, now: () => new Date('2026-11-03T05:00:00Z') })(askReq(goodAsk))
    expect(save.mock.calls[0][0]).toMatchObject({ ...goodAsk, at: '2026-11-03T05:00:00.000Z', delivered: { email: false } })
  })

  it('silently drops honeypot spam, rejects bad input, limits 3 a day per IP', async () => {
    const save = vi.fn(async () => {})
    const notify = vi.fn(async () => ({ email: true }))
    const h = createAskHandler({ store: new MemoryStore(), save, notify })
    const spam = await h(askReq({ ...goodAsk, website: 'x' }))
    expect(spam.status).toBe(200)
    expect(save).not.toHaveBeenCalled()
    expect((await h(askReq({ question: 'hi' }))).status).toBe(400)
    const statuses = []
    for (let i = 0; i < 4; i++) statuses.push((await h(askReq(goodAsk, '7.7.7.7'))).status)
    expect(statuses).toEqual([200, 200, 200, 429])
  })
})

describe('notifyDeepak', () => {
  const askInput = { question: 'Can he start in January?', email: 'cto@example.com', name: 'Asha', company: 'Acme' }
  const env = { RESEND_API_KEY: 're_x', TELEGRAM_BOT_TOKEN: 'tok', TELEGRAM_CHAT_ID: '42' }  // Telegram vars left in to prove they are ignored

  it('emails deepakrameshh@gmail.com through Resend and nothing else', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))
    const r = await notifyDeepak(askInput, { fetch: fetchMock as unknown as typeof fetch, env })
    expect(r).toEqual({ email: true })
    const urls = fetchMock.mock.calls.map((c) => String(c[0]))
    expect(urls).toContain('https://api.resend.com/emails')
    expect(urls).toEqual(['https://api.resend.com/emails'])
    const resendCall = fetchMock.mock.calls.find((c) => String(c[0]).includes('resend'))!
    const body = JSON.parse(String((resendCall[1] as RequestInit).body))
    expect(JSON.stringify(body.to)).toContain('deepakrameshh@gmail.com')
    expect(body.subject).toContain('Ask Deepak')
    expect(JSON.stringify(body)).toContain('cto@example.com')
  })

  it('never throws: a failed or unconfigured channel just reports false', async () => {
    const failing = vi.fn(async () => new Response('no', { status: 500 }))
    expect(await notifyDeepak(askInput, { fetch: failing as unknown as typeof fetch, env })).toEqual({ email: false })
    const throwing = vi.fn(async () => { throw new Error('net') })
    expect(await notifyDeepak(askInput, { fetch: throwing as unknown as typeof fetch, env: {} })).toEqual({ email: false })
  })
})

describe('Dee chat log', () => {
  it('logs each answered chat without the visitor IP', async () => {
    const logChat = vi.fn(async () => {})
    const deps = deeDeps({ logChat })
    await createDeeHandler(deps)(deeReq(ask, '9.9.9.9'))
    expect(logChat).toHaveBeenCalledOnce()
    const entry = logChat.mock.calls[0][0] as Record<string, unknown>
    expect(entry).toMatchObject({ sessionId: 's1', mode: 'recruiter', question: 'How many sites did he build?', source: 'primary', escalate: false, turns: 1 })
    expect(typeof entry.at).toBe('string')
    expect(JSON.stringify(entry)).not.toContain('9.9.9.9')
  })

  it('cuts long questions to 500 characters', async () => {
    const logChat = vi.fn(async () => {})
    const long = { ...ask, messages: [{ role: 'user', content: 'x'.repeat(1500) }] }
    await createDeeHandler(deeDeps({ logChat }))(deeReq(long))
    expect((logChat.mock.calls[0][0] as { question: string }).question).toHaveLength(500)
  })

  it('still answers when logging fails', async () => {
    const deps = deeDeps({ logChat: vi.fn(async () => { throw new Error('redis down') }) })
    const res = await createDeeHandler(deps)(deeReq(ask))
    expect(res.status).toBe(200)
    expect((await res.json()).source).toBe('primary')
  })
})
