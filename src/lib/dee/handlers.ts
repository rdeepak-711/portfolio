import type { FaqEntry, Mode } from '@/content/dee/types'
import { CLAIMS } from '@/content/dee/claims'
import { FAQ } from '@/content/dee/faq'
import { LIMITS } from '@/content/dee/limits'
import { PROFILE } from '@/content/dee/profile'
import { validateAsk, type AskInput } from './ask'
import { costUsd, pickModel } from './budget'
import { faqAnswer } from './faq-match'
import { ungroundedNumbers } from './grounding'
import { findPolicyViolations } from './policy'
import { buildSystemPrompt } from './prompt'
import { checkRateLimit, type CounterStore } from './rate-limit'

export type ModelReply = {
  text: string
  claimIds: string[]
  escalate: boolean
  usage: { inputTokens: number; outputTokens: number; cachedInputTokens?: number }
}
type Messages = { role: 'user' | 'assistant'; content: string }[]
type ModelClient = (system: string, messages: Messages) => Promise<ModelReply>

export type DeeDeps = {
  store: CounterStore
  spentToday: () => Promise<number>
  addSpend: (usd: number) => Promise<void>
  primary: ModelClient | null
  fallback: ModelClient | null
  price: { inputPerMTok: number; outputPerMTok: number }
  claims?: typeof CLAIMS
  faq?: FaqEntry[]
}

export type AskDeps = {
  store: CounterStore
  save: (ask: AskInput) => Promise<void>
  notify: (ask: AskInput) => Promise<{ email: boolean; telegram: boolean }>
}

const MODES: Mode[] = ['recruiter', 'founder', 'cto', 'interviewer']
const DAY_SECONDS = 24 * 60 * 60

export function createDeeHandler(deps: DeeDeps): (req: Request) => Promise<Response> {
  const claims = deps.claims ?? CLAIMS
  const faq = deps.faq ?? FAQ
  return async (req) => {
    let body: unknown
    try { body = await req.json() } catch { return json({ error: 'Invalid JSON body.' }, 400) }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Invalid request body.' }, 400)
    const data = body as Record<string, unknown>
    if (!Array.isArray(data.messages) || data.messages.length === 0 || data.messages.length > 20
      || !data.messages.every(isMessage) || typeof data.sessionId !== 'string' || !data.sessionId.trim()
      || typeof data.mode !== 'string' || !MODES.includes(data.mode as Mode)) {
      return json({ error: 'Invalid request body.' }, 400)
    }

    const ip = firstIp(req)
    const ipLimit = await checkRateLimit(deps.store, `ip:${ip}`, 60, DAY_SECONDS)
    const sessionLimit = await checkRateLimit(deps.store, `session:${data.sessionId}`, 20, DAY_SECONDS)
    if (!ipLimit.allowed || !sessionLimit.allowed) return json({ error: 'Rate limit exceeded.' }, 429)

    const messages = data.messages as Messages
    const system = buildSystemPrompt({ claims, faq, limits: LIMITS, profile: PROFILE, mode: data.mode as Mode })
    let reply: ModelReply | undefined
    let source: 'primary' | 'fallback' | 'faq' = 'faq'
    const usePrimary = pickModel(await deps.spentToday()) === 'primary' && deps.primary !== null
    const candidates: { client: ModelClient | null; source: 'primary' | 'fallback' }[] = usePrimary
      ? [{ client: deps.primary, source: 'primary' }, { client: deps.fallback, source: 'fallback' }]
      : [{ client: deps.fallback, source: 'fallback' }]
    for (const candidate of candidates) {
      if (!candidate.client) continue
      try {
        reply = await candidate.client(system, messages)
        source = candidate.source
        if (source === 'primary') await deps.addSpend(costUsd(reply.usage, deps.price))
        break
      } catch { /* Try the next configured model, then FAQ. */ }
    }
    if (!reply) {
      const question = [...messages].reverse().find((message) => message.role === 'user')?.content ?? ''
      reply = { ...faqAnswer(question, faq), usage: { inputTokens: 0, outputTokens: 0 } }
    }
    if (findPolicyViolations(reply.text).length || ungroundedNumbers(reply.text, claims).length) {
      reply = { text: "Dee can't verify that answer. Want to use Ask Deepak?", claimIds: [], escalate: true, usage: reply.usage }
    }
    const known = new Set(claims.map((c) => c.id))
    return json({ text: reply.text, claimIds: reply.claimIds.filter((id) => known.has(id)), escalate: reply.escalate, source })
  }
}

export function createAskHandler(deps: AskDeps): (req: Request) => Promise<Response> {
  return async (req) => {
    let input: unknown
    try { input = await req.json() } catch { return json({ error: 'Invalid JSON body.' }, 400) }
    const validated = validateAsk(input)
    if (!validated.ok) return json({ error: validated.errors }, 400)
    if (validated.spam) return json({ ok: true })
    const limit = await checkRateLimit(deps.store, `ip:${firstIp(req)}`, 3, DAY_SECONDS)
    if (!limit.allowed) return json({ error: 'Rate limit exceeded.' }, 429)
    await deps.save(validated.value)
    const delivered = await deps.notify(validated.value)
    return json({ ok: true, delivered })
  }
}

function isMessage(value: unknown): value is Messages[number] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const message = value as Record<string, unknown>
  return (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string' && message.content.length <= 2000
}

function firstIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status })
}
