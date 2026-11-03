import type { StoredAsk } from './ask'
import type { ChatLogEntry, ModelReply } from './handlers'
import { MemoryStore, type CounterStore } from './rate-limit'
import { answerToClaim, type StoredAnswer } from './answers'
import type { Claim } from '@/content/dee/types'

type Env = Record<string, string | undefined>
type Messages = { role: 'user' | 'assistant'; content: string }[]
type ModelClient = (system: string, messages: Messages) => Promise<ModelReply>

const DAY_SECONDS = 24 * 60 * 60
let memorySpend = 0
let memorySpendDay = ''

export function createClients(env: Env = process.env, fetcher: typeof fetch = fetch) {
  const redis = env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new RedisRest(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN, fetcher)
    : null
  const store: CounterStore = redis ? redis : new MemoryStore()

  const spentToday = async () => {
    const day = new Date().toISOString().slice(0, 10)
    if (redis) return Number(await redis.command(['GET', `dee:spend:${day}`]) ?? 0)
    if (memorySpendDay !== day) { memorySpendDay = day; memorySpend = 0 }
    return memorySpend
  }
  const addSpend = async (usd: number) => {
    const day = new Date().toISOString().slice(0, 10)
    if (redis) {
      await redis.command(['INCRBYFLOAT', `dee:spend:${day}`, String(usd)])
      await redis.command(['EXPIRE', `dee:spend:${day}`, String(DAY_SECONDS * 2)])
    } else {
      if (memorySpendDay !== day) { memorySpendDay = day; memorySpend = 0 }
      memorySpend += usd
    }
  }
  const primary = env.ANTHROPIC_API_KEY
    ? anthropicClient(env.ANTHROPIC_API_KEY, fetcher)
    : null
  const fallback = env.OPENROUTER_API_KEY && env.OPENROUTER_MODEL
    ? openRouterClient(env.OPENROUTER_API_KEY, env.OPENROUTER_MODEL, fetcher)
    : null

  const save = async (ask: StoredAsk) => {
    if (redis) await redis.command(['LPUSH', 'dee:asks', JSON.stringify(ask)])
    else console.log('Dee ask received:', ask)
  }

  // Newest first, capped at 5,000 entries, plus a per-day counter for quick totals
  const logChat = async (entry: ChatLogEntry) => {
    if (!redis) { console.log('Dee chat:', entry); return }
    const day = entry.at.slice(0, 10)
    await redis.command(['LPUSH', 'dee:chats', JSON.stringify(entry)])
    await redis.command(['LTRIM', 'dee:chats', '0', '4999'])
    await redis.command(['INCR', `dee:chats:${day}`])
  }

  // Deepak's answers: dee:qa:<id> holds each one, dee:qa:live lists the public ones, dee:qa:asked the ids already emailed
  let answerCache: { at: number; claims: Claim[] } | null = null
  const loadAnswerClaims = async (): Promise<Claim[]> => {
    if (!redis) return []
    // Cached for a minute so a chat costs no extra Redis calls in a busy spell
    if (answerCache && Date.now() - answerCache.at < 60_000) return answerCache.claims
    const ids = (await redis.command(['SMEMBERS', 'dee:qa:live']) ?? []) as string[]
    const raw = ids.length ? (await redis.command(['MGET', ...ids.map((id) => `dee:qa:${id}`)]) ?? []) as (string | null)[] : []
    const claims = raw.flatMap((value) => { try { return value ? [answerToClaim(JSON.parse(value) as StoredAnswer)] : [] } catch { return [] } })
    answerCache = { at: Date.now(), claims }
    return claims
  }
  const saveAnswer = async (answer: StoredAnswer) => {
    if (!redis) { console.log('Dee answer:', answer); return }
    await redis.command(['SET', `dee:qa:${answer.id}`, JSON.stringify(answer)])
    await redis.command([answer.public ? 'SADD' : 'SREM', 'dee:qa:live', answer.id])
    answerCache = null
  }
  const recentAsks = async (): Promise<StoredAsk[]> => {
    if (!redis) return []
    const raw = (await redis.command(['LRANGE', 'dee:asks', '0', '49']) ?? []) as string[]
    return raw.flatMap((value) => { try { const a = JSON.parse(value) as StoredAsk; return a?.question ? [a] : [] } catch { return [] } })
  }
  const recentAskQuestions = async (): Promise<string[]> => (await recentAsks()).map((a) => a.question)
  const recentChats = async (): Promise<ChatLogEntry[]> => {
    if (!redis) return []
    const raw = (await redis.command(['LRANGE', 'dee:chats', '0', '999']) ?? []) as string[]
    return raw.flatMap((value) => { try { return [JSON.parse(value) as ChatLogEntry] } catch { return [] } })
  }
  const askedIds = async () => new Set(redis ? (await redis.command(['SMEMBERS', 'dee:qa:asked']) ?? []) as string[] : [])
  const markAsked = async (id: string) => { if (redis) await redis.command(['SADD', 'dee:qa:asked', id]) }
  const emailDeepak = async (subject: string, text: string): Promise<boolean> => {
    if (!env.RESEND_API_KEY) { console.log('Dee email:', subject, text); return false }
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.RESEND_FROM || 'Dee <onboarding@resend.dev>', to: ['deepakrameshh@gmail.com'], subject, text }),
    }).catch(() => null)
    return Boolean(response?.ok)
  }

  return { store, spentToday, addSpend, primary, fallback, save, logChat, loadAnswerClaims, saveAnswer, recentAskQuestions, recentAsks, recentChats, askedIds, markAsked, emailDeepak }
}

class RedisRest implements CounterStore {
  constructor(private readonly url: string, private readonly token: string, private readonly fetcher: typeof fetch) {}

  async incr(key: string, ttlSec: number): Promise<number> {
    const count = Number(await this.command(['INCR', key]))
    if (count === 1) await this.command(['EXPIRE', key, String(ttlSec)])
    return count
  }

  async command(command: string[]): Promise<unknown> {
    const response = await this.fetcher(this.url.replace(/\/$/, ''), {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
    })
    if (!response.ok) throw new Error(`Redis REST returned ${response.status}`)
    const result = await response.json() as { result?: unknown; error?: string }
    if (result.error) throw new Error('Redis REST command failed')
    return result.result
  }
}

function anthropicClient(apiKey: string, fetcher: typeof fetch): ModelClient {
  return async (system, messages) => {
    const response = await fetcher('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-5-5',
        max_tokens: 600,
        thinking: { type: 'disabled' },
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages,
      }),
    })
    if (!response.ok) throw new Error(`Anthropic returned ${response.status}`)
    const data = await response.json() as {
      content?: { type?: string; text?: string }[]
      usage?: { input_tokens?: number; output_tokens?: number; cache_creation_input_tokens?: number; cache_read_input_tokens?: number }
    }
    const raw = data.content?.find((block) => block.type === 'text')?.text ?? ''
    // Anthropic's input_tokens excludes cached tokens, so add them back for the spend cap
    const cachedInputTokens = data.usage?.cache_read_input_tokens ?? 0
    const inputTokens = (data.usage?.input_tokens ?? 0) + (data.usage?.cache_creation_input_tokens ?? 0) + cachedInputTokens
    const usage = { inputTokens, outputTokens: data.usage?.output_tokens ?? 0, cachedInputTokens }
    return { ...parseModelJson(raw), usage }
  }
}

function openRouterClient(apiKey: string, model: string, fetcher: typeof fetch): ModelClient {
  return async (system, messages) => {
    const response = await fetcher('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: 600, messages: [{ role: 'system', content: system }, ...messages] }),
    })
    if (!response.ok) throw new Error(`OpenRouter returned ${response.status}`)
    const data = await response.json() as {
      choices?: { message?: { content?: string | null } }[]
      usage?: { prompt_tokens?: number; completion_tokens?: number }
    }
    return {
      ...parseModelJson(data.choices?.[0]?.message?.content ?? ''),
      usage: { inputTokens: data.usage?.prompt_tokens ?? 0, outputTokens: data.usage?.completion_tokens ?? 0 },
    }
  }
}

function parseModelJson(raw: string): Omit<ModelReply, 'usage'> {
  const fallback = { text: "Dee couldn't verify a response. Want to use Ask Deepak?", claimIds: [] as string[], escalate: true }
  try {
    const candidate = raw.match(/\{[\s\S]*\}/)?.[0]
    if (!candidate) return { ...fallback, invalid: true, raw }
    const parsed = JSON.parse(candidate) as Record<string, unknown>
    if (typeof parsed.text !== 'string' || !Array.isArray(parsed.claimIds) || !parsed.claimIds.every((id) => typeof id === 'string') || typeof parsed.escalate !== 'boolean') return { ...fallback, invalid: true, raw }
    return { text: parsed.text, claimIds: parsed.claimIds as string[], escalate: parsed.escalate }
  } catch {
    return { ...fallback, invalid: true, raw }
  }
}
