// Where a Dee visitor came from and where they opened it, for the chat log and the daily digest.
// Never an IP address: location is the city-level guess Vercel puts in request headers.
import type { ChatLogEntry } from './handlers'
import type { StoredAsk } from './ask'

export type Origin = { ref: string; referrer: string; landing: string }
export type Visitor = { country: string; region: string; city: string; device: 'mobile' | 'tablet' | 'desktop' | '' }

const clean = (value: unknown, max: number) => (typeof value === 'string' ? value.replace(/[\u0000-\u001f]/g, '').trim().slice(0, max) : '')

// The browser sends this, so it is checked and cut down, never trusted
export function parseOrigin(input: unknown): Origin {
  const data = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {}
  const ref = clean(data.ref, 40).toLowerCase()
  const referrer = clean(data.referrer, 100).toLowerCase()
  const landing = clean(data.landing, 100)
  return {
    ref: /^[a-z0-9._-]+$/.test(ref) ? ref : '',
    referrer: /^[a-z0-9.-]+\.[a-z]{2,}$/.test(referrer) ? referrer : '',
    landing: landing.startsWith('/') ? landing : '',
  }
}

export function visitorFromHeaders(headers: Headers): Visitor {
  const decode = (value: string | null) => { try { return value ? decodeURIComponent(value).slice(0, 60) : '' } catch { return '' } }
  const ua = headers.get('user-agent') ?? ''
  const device = !ua ? '' : /iPad|Tablet/i.test(ua) ? 'tablet' : /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop'
  return { country: decode(headers.get('x-vercel-ip-country')), region: decode(headers.get('x-vercel-ip-country-region')), city: decode(headers.get('x-vercel-ip-city')), device }
}

export function describeOrigin(entry: Partial<ChatLogEntry>): string {
  const from = [entry.ref && `?ref=${entry.ref}`, entry.referrer && `via ${entry.referrer}`].filter(Boolean).join(' ') || 'direct (no referrer)'
  const place = [entry.city, entry.region, entry.country].filter(Boolean).join(', ') || 'unknown location'
  return `${from} · ${place} · ${entry.device || 'unknown device'}${entry.landing ? ` · first page ${entry.landing}` : ''}`
}

const ist = (iso: string) => new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })

// Sessions Deepak or Claude open to check the live site; never counted as visitors
const isTestSession = (id: string) => /^(smoke|claude)-/.test(id)

// Yesterday's chats as plain text, one block per visitor. Test sessions are left out.
export function formatDigest(chats: ChatLogEntry[], now: Date): { count: number; visitors: number; text: string } {
  const since = now.getTime() - 24 * 3600_000
  const recent = chats.filter((c) => new Date(c.at).getTime() >= since && !isTestSession(c.sessionId))
  if (!recent.length) return { count: 0, visitors: 0, text: 'No one asked Dee anything in the last 24 hours.' }
  const sessions = new Map<string, ChatLogEntry[]>()
  for (const chat of [...recent].sort((a, b) => a.at.localeCompare(b.at))) sessions.set(chat.sessionId, [...(sessions.get(chat.sessionId) ?? []), chat])
  const blocks = [...sessions.values()].map((turns, i) => {
    const head = `Visitor ${i + 1} (${turns[0].mode}): ${describeOrigin(turns[0])}`
    const lines = turns.map((t) => `  ${ist(t.at)}  Q: ${t.question}\n         Dee: ${t.answer ?? '(answer not logged)'}${t.escalate ? '\n         → Dee offered to send it to you (whoever actually did is under ASKED YOU DIRECTLY)' : ''}`)
    return [head, ...lines].join('\n')
  })
  return { count: recent.length, visitors: sessions.size, text: `${sessions.size} ${sessions.size === 1 ? 'visitor' : 'visitors'} asked ${recent.length} ${recent.length === 1 ? 'question' : 'questions'} in the last 24 hours.\n\n${blocks.join('\n\n')}` }
}

// Questions visitors sent through the Ask Deepak form in the last 24 hours, with their contact details
export function formatAsks(asks: StoredAsk[], now: Date): string {
  const since = now.getTime() - 24 * 3600_000
  const recent = asks.filter((a) => a.at && new Date(a.at).getTime() >= since).sort((a, b) => a.at!.localeCompare(b.at!))
  if (!recent.length) return 'No one used Ask Deepak in the last 24 hours.'
  const status = (ok: boolean | undefined) => (ok === undefined ? 'unknown' : ok ? 'sent' : 'failed')
  const blocks = recent.map((a) => {
    const who = `${a.name || '(no name)'}${a.company ? ` (${a.company})` : ''} <${a.email}>`
    return `  ${ist(a.at!)}  ${who}\n         Q: ${a.question}\n         Email to you: ${status(a.delivered?.email)}`
  })
  return `${recent.length} ${recent.length === 1 ? 'person' : 'people'} used Ask Deepak in the last 24 hours. Reply to them at the address shown.\n\n${blocks.join('\n\n')}`
}
