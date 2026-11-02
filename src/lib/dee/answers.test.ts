import { describe, expect, it } from 'vitest'
import { answerLink, answerToClaim, pickNextQuestion, signQuestion, validateAnswer, verifyQuestion, visitorQuestionId } from './answers'

const secret = 'test-secret'
const bank = [{ id: 'd01', q: 'Bank one?' }, { id: 'd02', q: 'Bank two?' }]

describe('daily questions', () => {
  it('asks the oldest waiting visitor question first, then the bank in order', () => {
    // dee:asks is newest first
    const asks = ['Newer visitor question?', 'Older visitor question?']
    expect(pickNextQuestion(asks, bank, new Set())).toMatchObject({ kind: 'visitor', question: 'Older visitor question?' })
    const asked = new Set([visitorQuestionId('Older visitor question?'), visitorQuestionId('Newer visitor question?')])
    expect(pickNextQuestion(asks, bank, asked)).toEqual({ id: 'd01', kind: 'daily', question: 'Bank one?' })
    expect(pickNextQuestion([], bank, new Set(['d01', 'd02']))).toBeNull()
  })

  it('signs links so a changed question or id is rejected', () => {
    const sig = signQuestion('d01', 'daily', 'Bank one?', secret)
    expect(verifyQuestion('d01', 'daily', 'Bank one?', sig, secret)).toBe(true)
    expect(verifyQuestion('d01', 'daily', 'Bank one, edited?', sig, secret)).toBe(false)
    expect(verifyQuestion('d02', 'daily', 'Bank one?', sig, secret)).toBe(false)
    expect(verifyQuestion('d01', 'daily', 'Bank one?', 'short', secret)).toBe(false)
    expect(verifyQuestion('d01', 'daily', 'Bank one?', sig, '')).toBe(false)
    const link = new URL(answerLink('https://rdeepak.vercel.app/', { id: 'd01', kind: 'daily', question: 'Bank one?' }, secret))
    expect(link.pathname).toBe('/dee/answer')
    expect(link.searchParams.get('sig')).toBe(sig)
  })
})

describe('answers', () => {
  const base = { id: 'd01', kind: 'daily', question: 'Bank one?', sig: 'x', answer: 'A clear answer with enough words.', public: true }

  it('accepts a normal answer and rejects short ones or bad ids', () => {
    expect(validateAnswer(base).ok).toBe(true)
    expect(validateAnswer({ ...base, answer: 'short' }).ok).toBe(false)
    expect(validateAnswer({ ...base, id: 'dee:spend' }).ok).toBe(false)
  })

  it('refuses to make banned wording public, but keeps it private', () => {
    const banned = { ...base, answer: 'I was the Senior engineer on that team.' }
    const result = validateAnswer(banned)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.errors.join(' ')).toContain('Senior')
    expect(validateAnswer({ ...banned, public: false }).ok).toBe(true)
  })

  it('turns an answer into a confirmed claim labelled with where it came from', () => {
    const claim = answerToClaim({ id: 'v0123456789', kind: 'visitor', question: 'Does he mentor?', answer: 'Yes, a junior developer since August.', at: '2026-11-04T04:00:00Z', public: true })
    expect(claim).toMatchObject({ id: 'Q-v0123456789', confidence: 'confirmed', public: true })
    expect(claim.sourceLabel).toBe('Deepak, answering a visitor’s question, 4 Nov 2026')
    expect(claim.text).toContain('Yes, a junior developer since August.')
  })
})
