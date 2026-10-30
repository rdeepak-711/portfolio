import type { FaqEntry } from '@/content/dee/types'

const STOP_WORDS = new Set(['what', 'which', 'does', 'did', 'has', 'have', 'how', 'who', 'where', 'when', 'why', 'is', 'are', 'the', 'a', 'an', 'to', 'for', 'of', 'and', 'he', 'his', 'him', 'deepak', 'please', 'tell', 'me', 'about'])

function keywords(text: string): Set<string> {
  return new Set(text.toLowerCase().match(/[\p{L}\p{N}]+/gu)?.filter((word) => word.length > 1 && !STOP_WORDS.has(word)) ?? [])
}

export function faqAnswer(question: string, faq: FaqEntry[]): { text: string; claimIds: string[]; escalate: boolean } {
  const questionWords = keywords(question)
  let best: FaqEntry | undefined
  let bestScore = 0
  for (const entry of faq) {
    const entryWords = keywords(`${entry.q} ${entry.a}`)
    let score = 0
    for (const word of questionWords) if (entryWords.has(word)) score += 1
    if (score > bestScore) {
      best = entry
      bestScore = score
    }
  }
  if (best && bestScore >= 2) return { text: best.a, claimIds: best.claimIds, escalate: false }
  return { text: "Dee doesn't have a checked answer for that. Want to use Ask Deepak?", claimIds: [], escalate: true }
}
