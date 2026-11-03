import type { FaqEntry, Mode } from '@/content/dee/types'
import { formatAsks, formatDigest, parseOrigin, visitorFromHeaders } from './visitor'
import { answerLink, emailSubject, pickNextQuestion, validateAnswer, verifyQuestion, type StoredAnswer } from './answers'
import { offersToForward } from './forward'
import { CLAIMS } from '@/content/dee/claims'
import { FAQ } from '@/content/dee/faq'
import { LIMITS } from '@/content/dee/limits'
import { PROFILE } from '@/content/dee/profile'
import { validateAsk, type AskInput, type StoredAsk } from './ask'
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
  // Set by the model clients when the reply could not be read as the JSON shape; raw is what the model wrote
  invalid?: boolean
  raw?: string
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
  // Added 2 Nov: the exchange plus where the visitor came from and opened Dee. No IP.
  answer?: string
  claimIds?: string[]
  ref?: string
  referrer?: string
  landing?: string
  country?: string
  region?: string
  city?: string
  device?: string
}

export type AskDeps = {
  store: CounterStore
  save: (ask: StoredAsk) => Promise<void>
  notify: (ask: AskInput) => Promise<{ email: boolean }>
  now?: () => Date
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
        const history = asModelHistory(messages)
        reply = await candidate.client(system, history)
        source = candidate.source
        if (source === 'primary') await deps.addSpend(costUsd(reply.usage, deps.price)).catch(() => {})
        // One repair retry, told exactly what was wrong; only failed replies cost a second call
        const problems = replyProblems(reply, claims)
        if (problems.length) {
          const draft = reply.raw ?? JSON.stringify({ text: reply.text, claimIds: reply.claimIds, escalate: reply.escalate })
          try {
            const retry = await candidate.client(system, [...history, { role: 'assistant', content: draft }, { role: 'user', content: repairNote(problems) }])
            if (source === 'primary') await deps.addSpend(costUsd(retry.usage, deps.price)).catch(() => {})
            reply = retry
          } catch { /* keep the first reply; the final check below decides */ }
        }
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
    if (replyProblems(reply, claims).length) {
      reply = { text: "Dee can't answer that from Deepak's public record. Want to ask him directly?", claimIds: [], escalate: true, usage: reply.usage }
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
        answer: reply.text.slice(0, 1000),
        claimIds: reply.claimIds,
        ...parseOrigin(data.origin),
        ...visitorFromHeaders(req.headers),
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
    // Notify first so the saved copy records which channels got it; the daily digest shows that
    const delivered = await deps.notify(validated.value)
    await deps.save({ ...validated.value, at: (deps.now?.() ?? new Date()).toISOString(), delivered })
    return json({ ok: true, delivered })
  }
}

// What is wrong with a reply, in words the model can act on. Empty means it can be shown.
function replyProblems(reply: ModelReply, claims: typeof CLAIMS): string[] {
  if (reply.invalid) return ['it was plain text, not the required JSON object']
  const problems: string[] = []
  const banned = findPolicyViolations(reply.text)
  if (banned.length) problems.push(`it used words Dee must never write: ${banned.map((w) => `"${w}"`).join(', ')}`)
  const numbers = ungroundedNumbers(reply.text, claims)
  if (numbers.length) problems.push(`it used numbers that are not in the public claims: ${numbers.join(', ')}`)
  const cited = claims.filter((c) => reply.claimIds.includes(c.id))
  if (/\b(open|see|check)\b[^.]{0,60}\b(below|write-up|transcript|certificate)\b/i.test(reply.text) && !cited.some((c) => c.links?.length)) {
    problems.push('it told the visitor to open a link or document that none of its cited claims has')
  }
  return problems
}

function repairNote(problems: string[]): string {
  return [
    `Your last reply cannot be shown because ${problems.join('; and ')}.`,
    'Answer the visitor\'s last question again. Return only the JSON object {"text": string, "claimIds": string[], "escalate": boolean}.',
    'Use only numbers that appear in the public claims. If the visitor used a number that is not in them, do not repeat it; say what the record does show.',
    'If the question is about pay, salary, CTC or job offers, say Deepak keeps that private and offer to send the question to him, without using the banned words.',
  ].join(' ')
}

// Earlier answers come back from the browser as plain text. Sent to the model like that, it copies the
// plain-text style and drops the JSON shape, so every second question failed to parse (3 Nov 2026).
// Rewrap them in the reply shape; the claim ids are not known here, and the model does not need them.
function asModelHistory(messages: Messages): Messages {
  return messages.map((message) => {
    if (message.role !== 'assistant') return message
    try {
      const parsed = JSON.parse(message.content) as Record<string, unknown>
      if (parsed && typeof parsed.text === 'string') return message
    } catch { /* plain text, wrap it below */ }
    return { role: 'assistant', content: JSON.stringify({ text: message.content, claimIds: [], escalate: false }) }
  })
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
  recentChats?: () => Promise<ChatLogEntry[]>
  recentAsks?: () => Promise<StoredAsk[]>
  now?: () => Date
}

// Vercel Cron calls this once a day with "Authorization: Bearer <CRON_SECRET>"
export function createDailyHandler(deps: DailyDeps): (req: Request) => Promise<Response> {
  return async (req) => {
    if (!deps.cronSecret || req.headers.get('authorization') !== `Bearer ${deps.cronSecret}`) return json({ error: 'Unauthorized.' }, 401)
    if (!deps.answerSecret) return json({ error: 'DEE_ANSWER_SECRET is not set.' }, 500)
    const chats = await (deps.recentChats?.() ?? Promise.resolve([])).catch(() => [] as ChatLogEntry[])
    const now = deps.now?.() ?? new Date()
    const digest = formatDigest(chats, now)
    const asks = await (deps.recentAsks?.() ?? Promise.resolve([])).catch(() => [] as StoredAsk[])
    const next = pickNextQuestion(await deps.recentAskQuestions(), deps.bank, await deps.askedIds())
    let questionPart = 'No questions left to ask you. Add more to DAILY_QUESTIONS.'
    if (next) {
      const link = answerLink(deps.siteUrl, next, deps.answerSecret)
      const from = next.kind === 'visitor' ? 'A visitor asked Dee this, and it had no answer.' : "Today's question for Dee."
      questionPart = `${from}\n\n${next.question}\n\nAnswer it here (takes a minute):\n${link}\n\nOnce you tick "Dee can say this publicly", Dee uses your answer straight away.`
    }
    const subject = next ? emailSubject(next.question) : `Dee: ${digest.count} questions in the last 24 hours`
    const sent = await deps.emailDeepak(subject, `${questionPart}\n\n---\n\nWHAT VISITORS ASKED DEE\n\n${digest.text}\n\n---\n\nASKED YOU DIRECTLY (Ask Deepak form)\n\n${formatAsks(asks, now)}`)
    // Only mark it asked once the email went out, so a failed send is retried tomorrow
    if (sent && next) await deps.markAsked(next.id)
    return json({ sent, id: next?.id ?? null, kind: next?.kind ?? null, chats: digest.count })
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
