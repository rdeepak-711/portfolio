export const DAILY_CAP_USD = 5

// VERIFY against anthropic.com/pricing before launch
export const MODEL_PRICES = { inputPerMTok: 1, outputPerMTok: 5, cachedInputPerMTok: 0.1 } // conservative: overestimating trips the $5 cap early, never late

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
