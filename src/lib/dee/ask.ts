export type AskInput = { question: string; email: string; name?: string; company?: string; transcript?: string }

export function validateAsk(input: unknown):
  | { ok: true; value: AskInput; spam: boolean }
  | { ok: false; errors: string[] } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, errors: ['Request must be an object.'] }

  const data = input as Record<string, unknown>
  const errors: string[] = []
  const question = typeof data.question === 'string' ? data.question.trim() : ''
  const email = typeof data.email === 'string' ? data.email.trim() : ''
  const name = typeof data.name === 'string' ? data.name.trim() : undefined
  const company = typeof data.company === 'string' ? data.company.trim() : undefined
  const transcript = typeof data.transcript === 'string' ? data.transcript : undefined

  if (question.length < 5 || question.length > 2_000) errors.push('Question must be 5–2,000 characters.')
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email is required.')
  if ((name?.length ?? 0) > 100) errors.push('Name must be 100 characters or fewer.')
  if ((company?.length ?? 0) > 100) errors.push('Company must be 100 characters or fewer.')
  if (errors.length) return { ok: false, errors }

  const value: AskInput = { question, email }
  if (name) value.name = name
  if (company) value.company = company
  if (transcript !== undefined) value.transcript = transcript.slice(0, 20_000)
  return { ok: true, value, spam: typeof data.website === 'string' && data.website.trim().length > 0 }
}
