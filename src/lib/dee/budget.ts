export const DAILY_CAP_USD = 5

// claude-haiku-5-5, checked 31 Oct 2026: $0.10 in / $0.50 out / $0.01 cache read per MTok (prompts up to 100K tokens).
// Input is priced at the $0.125 cache-write rate so a cache write is never undercounted.
export const MODEL_PRICES = { inputPerMTok: 0.125, outputPerMTok: 0.5, cachedInputPerMTok: 0.01 }

export function costUsd(
  usage: { inputTokens: number; outputTokens: number; cachedInputTokens?: number },
  price: { inputPerMTok: number; outputPerMTok: number; cachedInputPerMTok?: number },
): number {
  const regularInput = Math.max(0, usage.inputTokens - (usage.cachedInputTokens ?? 0))
  const cachedInput = usage.cachedInputTokens ?? 0
  const cachedPrice = price.cachedInputPerMTok ?? price.inputPerMTok
  return regularInput * price.inputPerMTok / 1_000_000
    + cachedInput * cachedPrice / 1_000_000
    + usage.outputTokens * price.outputPerMTok / 1_000_000
}

export function pickModel(spentTodayUsd: number, cap = DAILY_CAP_USD): 'primary' | 'fallback' {
  return spentTodayUsd >= cap ? 'fallback' : 'primary'
}
