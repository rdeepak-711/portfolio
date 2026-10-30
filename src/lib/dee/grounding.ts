import type { Claim } from '../../content/dee/types.ts'

const NUMBER_PATTERN = /(?:[$₹]\s?\d+(?:,\d{3})*(?:\.\d+)?(?:L\+)?|\d{1,3}(?:,\d{3})+(?:\.\d+)?(?:%|\+)?|\d+(?:\.\d+)?\s*[–—-]\s*\d+(?:\.\d+)?%?|\d+(?:\.\d+)?(?:%|\+)?)/g

export function extractNumbers(text: string): string[] {
  const found = text.match(NUMBER_PATTERN) ?? []
  return [...new Set(found.map((value) => value.replace(/\s+/g, '')))]
}

export function ungroundedNumbers(answer: string, claims: Claim[]): string[] {
  const knownNumbers = new Set(claims.flatMap((claim) => extractNumbers(claim.text)))
  return extractNumbers(answer).filter((number) => {
    if (/^\d$/.test(number)) return false
    const year = Number(number)
    if (/^\d{4}$/.test(number) && year >= 2019 && year <= 2027) return false
    return !knownNumbers.has(number)
  })
}
