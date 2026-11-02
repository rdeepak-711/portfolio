import type { FaqEntry, Mode } from '@/content/dee/types'
import { answerLink, emailSubject, pickNextQuestion, validateAnswer, verifyQuestion, type StoredAnswer } from './answers'
import { offersToForward } from './forward'
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
  logChat?: (entry: ChatLogEntry) => Promise<void>
  // Facts from Deepak's own answers, merged with the static claims on every chat
  loadAnswerClaims?: () => Promise<typeof CLAIMS>
}

// One answered chat, kept so Deepak can see whether visitors use Dee. No IP is stored.
export type ChatLogEntry = {
  at: string
  sessionId: string
  mode: Mode
  question: string
  source: 'primary' | 'fallback' | 'faq'
  escalate: boolean
  turns: number
}

export type AskDeps = {
  store: CounterStore
  save: (ask: AskInput) => Promise<void>
  notify: (ask: AskInput) => Promise<{ email: boolean; telegram: boolean }>
}

const MODES: Mode[] = ['recruiter', 'founder', 'cto', 'interviewer']
const DAY_SECONDS = 24 * 60 * 60

export function createDeeHandler(deps: DeeDeps): (req: Request) => Promise<Response> {
  const baseClaims = deps.claims ?? CLAIMS
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
    // A store outage lets the request through; the spend check below fails closed instead.
    try {
      const ipLimit = await checkRateLimit(deps.store, `ip:${ip}`, 60, DAY_SECONDS)
      const sessionLimit = await checkRateLimit(deps.store, `session:${data.sessionId}`, 20, DAY_SECONDS)
      if (!ipLimit.allowed || !sessionLimit.allowed) return json({ error: 'Rate limit exceeded.' }, 429)
    } catch { /* store unavailable */ }

    const messages = data.messages as Messages
    const claims = [...baseClaims, ...(await (deps.loadAnswerClaims?.() ?? Promise.resolve([])).catch(() => []))]
    const system = buildSystemPrompt({ claims, faq, limits: LIMITS, profile: PROFILE, mode: data.mode as Mode })
    let reply: ModelReply | undefined
    let source: 'primary' | 'fallback' | 'faq' = 'faq'
    const spent = await deps.spentToday().catch(() => Infinity)
    const usePrimary = pickModel(spent) === 'primary' && deps.primary !== null
    const candidates: { client: ModelClient | null; source: 'primary' | 'fallback' }[] = usePrimary
      ? [{ client: deps.primary, source: 'primary' }, { client: deps.fallback, source: 'fallback' }]
      : [{ client: deps.fallback, source: 'fallback' }]
    for (const candidate of candidates) {
      if (!candidate.client) continue
      try {
        reply = await candidate.client(system, messages)
        source = candidate.source
        if (source === 'primary') await deps.addSpend(costUsd(reply.usage, deps.price)).catch(() => {})
        break
      } catch { /* Try the next configured model, then FAQ. */ }
    }
    if (!reply) {
      const question = [...messages].reverse().find((message) => message.role === 'user')?.content ?? ''
      reply = { ...faqAnswer(question, faq), usage: { inputTokens: 0, outputTokens: 0 } }
    }
    reply = { ...reply, text: stripClaimTags(reply.text) }
    // Backstop: an offer to pass the question on must come with the Ask Deepak button
    if (!reply.escalate && offersToForward(reply.text)) reply = { ...reply, escalate: true }
    if (findPolicyViolations(reply.text).length || ungroundedNumbers(reply.text, claims).length) {
      reply = { text: "Dee can't verify that answer. Want to use Ask Deepak?", claimIds: [], escalate: true, usage: reply.usage }
    }
    if (deps.logChat) {
      const question = [...messages].reverse().find((message) => message.role === 'user')?.content ?? ''
      await deps.logChat({
        at: new Date().toISOString(),
        sessionId: data.sessionId as string,
        mode: data.mode as Mode,
        question: question.slice(0, 500),
        source,
        escalate: reply.escalate,
        turns: messages.filter((message) => message.role === 'user').length,
      }).catch(() => { /* logging never blocks an answer */ })
    }
    const byId = new Map(claims.filter((c) => c.public).map((c) => [c.id, c]))
    const claimIds = reply.claimIds.filter((id) => byId.has(id))
    // Sources travel with the answer, because answered-question facts are not in the browser's copy of CLAIMS
    const sources = claimIds.map((id) => { const c = byId.get(id)!; return { id, label: c.sourceLabel, url: c.sourceUrl, links: c.links ?? [] } })
    return json({ text: reply.text, claimIds, sources, escalate: reply.escalate, source })
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

// The UI shows sources as chips, so drop inline tags like "[F2]" or "[F2, U1]"
function stripClaimTags(text: string): string {
  return text.replace(/\s*\[[A-Z]\d+(?:\s*,\s*[A-Z]\d+)*\]/g, '').trim()
}

function isMessage(value: unknown): value is Messages[number] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const message = value as Record<string, unknown>
  return (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string' && message.content.length <= 2000
}

function firstIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export type DailyDeps = {
  cronSecret: string | undefined
  answerSecret: string | undefined
  siteUrl: string
  recentAskQuestions: () => Promise<string[]>
  askedIds: () => Promise<Set<string>>
  markAsked: (id: string) => Promise<void>
  emailDeepak: (subject: string, text: string) => Promise<boolean>
  bank: { id: string; q: string }[]
}

// Vercel Cron calls this once a day with "Authorization: Bearer <CRON_SECRET>"
export function createDailyHandler(deps: DailyDeps): (req: Request) => Promise<Response> {
  return async (req) => {
    if (!deps.cronSecret || req.headers.get('authorization') !== `Bearer ${deps.cronSecret}`) return json({ error: 'Unauthorized.' }, 401)
    if (!deps.answerSecret) return json({ error: 'DEE_ANSWER_SECRET is not set.' }, 500)
    const next = pickNextQuestion(await deps.recentAskQuestions(), deps.bank, await deps.askedIds())
    if (!next) return json({ sent: false, reason: 'No questions left.' })
    const link = answerLink(deps.siteUrl, next, deps.answerSecret)
    const from = next.kind === 'visitor' ? 'A visitor asked Dee this, and it had no answer.' : "Today's question for Dee."
    const sent = await deps.emailDeepak(emailSubject(next.question), `${from}\n\n${next.question}\n\nAnswer it here (takes a minute):\n${link}\n\nOnce you tick "Dee can say this publicly", Dee uses your answer straight away.`)
    // Only mark it asked once the email went out, so a failed send is retried tomorrow
    if (sent) await deps.markAsked(next.id)
    return json({ sent, id: next.id, kind: next.kind })
  }
}

export type AnswerDeps = { store: CounterStore; answerSecret: string | undefined; saveAnswer: (answer: StoredAnswer) => Promise<void> }

export function createAnswerHandler(deps: AnswerDeps): (req: Request) => Promise<Response> {
  return async (req) => {
    let body: unknown
    try { body = await req.json() } catch { return json({ error: 'Invalid JSON body.' }, 400) }
    const validated = validateAnswer(body)
    if (!validated.ok) return json({ error: validated.errors }, 400)
    const { id, kind, question, sig, answer } = validated.value
    if (!deps.answerSecret || !verifyQuestion(id, kind, question, sig, deps.answerSecret)) return json({ error: ['This link is not valid.'] }, 403)
    try {
      const limit = await checkRateLimit(deps.store, `answer:${firstIp(req)}`, 30, DAY_SECONDS)
      if (!limit.allowed) return json({ error: ['Too many answers today.'] }, 429)
    } catch { /* store unavailable */ }
    await deps.saveAnswer({ id, kind, question, answer, at: new Date().toISOString(), public: validated.value.public })
    return json({ ok: true, live: validated.value.public })
  }
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status })
}
