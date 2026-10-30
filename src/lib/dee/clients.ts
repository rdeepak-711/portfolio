import type { AskInput } from './ask'
import type { ModelReply } from './handlers'
import { MemoryStore, type CounterStore } from './rate-limit'

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

  const save = async (ask: AskInput) => {
    if (redis) await redis.command(['LPUSH', 'dee:asks', JSON.stringify(ask)])
    else console.log('Dee ask received:', ask)
  }

  return { store, spentToday, addSpend, primary, fallback, save }
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
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
        messages,
      }),
    })
    if (!response.ok) throw new Error(`Anthropic returned ${response.status}`)
    const data = await response.json() as {
      content?: { type?: string; text?: string }[]
      usage?: { input_tokens?: number; output_tokens?: number }
    }
    const raw = data.content?.find((block) => block.type === 'text')?.text ?? ''
    const usage = { inputTokens: data.usage?.input_tokens ?? 0, outputTokens: data.usage?.output_tokens ?? 0 }
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
    if (!candidate) return fallback
    const parsed = JSON.parse(candidate) as Record<string, unknown>
    if (typeof parsed.text !== 'string' || !Array.isArray(parsed.claimIds) || !parsed.claimIds.every((id) => typeof id === 'string') || typeof parsed.escalate !== 'boolean') return fallback
    return { text: parsed.text, claimIds: parsed.claimIds as string[], escalate: parsed.escalate }
  } catch {
    return fallback
  }
}
