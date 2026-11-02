// Deepak's answers to forwarded and daily questions, turned into facts Dee can cite.
// Pure functions only; storage and email live in clients.ts.
import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import type { Claim } from '@/content/dee/types'
import { findPolicyViolations } from './policy'

export type QaKind = 'daily' | 'visitor'
export type StoredAnswer = { id: string; kind: QaKind; question: string; answer: string; at: string; public: boolean }
export type NextQuestion = { id: string; kind: QaKind; question: string }

const SIG_LENGTH = 32

export function visitorQuestionId(question: string): string {
  return 'v' + createHash('sha256').update(question.trim()).digest('hex').slice(0, 10)
}

// The link in the email carries the question itself; the signature stops anyone forging one
export function signQuestion(id: string, kind: QaKind, question: string, secret: string): string {
  return createHmac('sha256', secret).update(`${id}\n${kind}\n${question}`).digest('hex').slice(0, SIG_LENGTH)
}

export function verifyQuestion(id: string, kind: QaKind, question: string, sig: string, secret: string): boolean {
  if (!secret || typeof sig !== 'string' || sig.length !== SIG_LENGTH) return false
  const expected = Buffer.from(signQuestion(id, kind, question, secret))
  return timingSafeEqual(expected, Buffer.from(sig))
}

export function answerLink(siteUrl: string, next: NextQuestion, secret: string): string {
  const params = new URLSearchParams({ id: next.id, kind: next.kind, q: next.question, sig: signQuestion(next.id, next.kind, next.question, secret) })
  return `${siteUrl.replace(/\/$/, '')}/dee/answer?${params.toString()}`
}

// Visitor questions waiting longest go first, then the bank in order
export function pickNextQuestion(visitorQuestions: string[], bank: { id: string; q: string }[], asked: Set<string>): NextQuestion | null {
  for (const question of [...visitorQuestions].reverse()) {
    const id = visitorQuestionId(question)
    if (!asked.has(id)) return { id, kind: 'visitor', question }
  }
  const daily = bank.find((item) => !asked.has(item.id))
  return daily ? { id: daily.id, kind: 'daily', question: daily.q } : null
}

export type AnswerInput = { id: string; kind: QaKind; question: string; sig: string; answer: string; public: boolean }

export function validateAnswer(input: unknown): { ok: true; value: AnswerInput } | { ok: false; errors: string[] } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, errors: ['Invalid request body.'] }
  const data = input as Record<string, unknown>
  const errors: string[] = []
  const id = typeof data.id === 'string' && /^(v[0-9a-f]{10}|d\d{2})$/.test(data.id) ? data.id : ''
  const kind = data.kind === 'daily' || data.kind === 'visitor' ? data.kind : null
  const question = typeof data.question === 'string' ? data.question.trim() : ''
  const answer = typeof data.answer === 'string' ? data.answer.trim() : ''
  if (!id || !kind) errors.push('This link is not valid.')
  if (!question || question.length > 2000) errors.push('This link is not valid.')
  if (answer.length < 10 || answer.length > 1500) errors.push('Write 10 to 1,500 characters.')
  const isPublic = data.public === true
  // A public answer becomes a fact Dee quotes, so it must pass the same wording rules as every other claim
  if (isPublic) {
    const violations = findPolicyViolations(`${question} ${answer}`)
    if (violations.length) errors.push(`Dee can't say this publicly. Remove: ${violations.join(', ')}.`)
  }
  if (errors.length) return { ok: false, errors: [...new Set(errors)] }
  return { ok: true, value: { id, kind: kind!, question, sig: typeof data.sig === 'string' ? data.sig : '', answer, public: isPublic } }
}

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' })
}

export function answerToClaim(answer: StoredAnswer): Claim {
  const how = answer.kind === 'visitor' ? 'a visitor’s question' : 'a daily question'
  return {
    id: `Q-${answer.id}`,
    text: `Asked "${answer.question}", Deepak answered: ${answer.answer}`,
    confidence: 'confirmed',
    sourceLabel: `Deepak, answering ${how}, ${formatDay(answer.at)}`,
    sourceUrl: null,
    public: answer.public,
  }
}
