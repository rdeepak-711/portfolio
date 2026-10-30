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

describe('Ask Deepak handler', () => {
  it('saves, notifies and reports delivery', async () => {
    const save = vi.fn(async () => {})
    const notify = vi.fn(async () => ({ email: true, telegram: true }))
    const res = await createAskHandler({ store: new MemoryStore(), save, notify })(askReq(goodAsk))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, delivered: { email: true, telegram: true } })
    expect(save).toHaveBeenCalledOnce()
    expect(notify).toHaveBeenCalledOnce()
  })

  it('silently drops honeypot spam, rejects bad input, limits 3 a day per IP', async () => {
    const save = vi.fn(async () => {})
    const notify = vi.fn(async () => ({ email: true, telegram: true }))
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
  const env = { RESEND_API_KEY: 're_x', TELEGRAM_BOT_TOKEN: 'tok', TELEGRAM_CHAT_ID: '42' }

  it('emails deepakrameshh@gmail.com through Resend and pings Telegram', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))
    const r = await notifyDeepak(askInput, { fetch: fetchMock as unknown as typeof fetch, env })
    expect(r).toEqual({ email: true, telegram: true })
    const urls = fetchMock.mock.calls.map((c) => String(c[0]))
    expect(urls).toContain('https://api.resend.com/emails')
    expect(urls.some((u) => u.startsWith('https://api.telegram.org/bottok/sendMessage'))).toBe(true)
    const resendCall = fetchMock.mock.calls.find((c) => String(c[0]).includes('resend'))!
    const body = JSON.parse(String((resendCall[1] as RequestInit).body))
    expect(JSON.stringify(body.to)).toContain('deepakrameshh@gmail.com')
    expect(body.subject).toContain('Ask Deepak')
    expect(JSON.stringify(body)).toContain('cto@example.com')
  })

  it('never throws: a failed or unconfigured channel just reports false', async () => {
    const failing = vi.fn(async () => new Response('no', { status: 500 }))
    expect(await notifyDeepak(askInput, { fetch: failing as unknown as typeof fetch, env })).toEqual({ email: false, telegram: false })
    const throwing = vi.fn(async () => { throw new Error('net') })
    expect(await notifyDeepak(askInput, { fetch: throwing as unknown as typeof fetch, env: {} })).toEqual({ email: false, telegram: false })
  })
})
