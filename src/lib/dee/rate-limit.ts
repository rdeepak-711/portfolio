export interface CounterStore {
  incr(key: string, ttlSec: number): Promise<number>
}

export class MemoryStore implements CounterStore {
  private readonly values = new Map<string, { count: number; expiresAt: number }>()

  constructor(private readonly now: () => number = Date.now) {}

  async incr(key: string, ttlSec: number): Promise<number> {
    const now = this.now()
    const current = this.values.get(key)
    if (!current || current.expiresAt <= now) {
      this.values.set(key, { count: 1, expiresAt: now + ttlSec * 1000 })
      return 1
    }
    current.count += 1
    return current.count
  }
}

export async function checkRateLimit(
  store: CounterStore,
  key: string,
  limit: number,
  windowSec: number,
): Promise<{ allowed: boolean; remaining: number }> {
  const count = await store.incr(key, windowSec)
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) }
}
