export const BANNED_PHRASES = [
  'Reckitt', 'PakkaBot', 'Senior', '600+', '68 of 117', 'fixed upstream',
  'dead-letter', 'CI/CD', 'Cloud Build', 'Software Engineer II', 'salary', 'CTC', 'Quantitative',
  'I built', 'I worked at', 'my CV',
]

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export function findPolicyViolations(text: string): string[] {
  return BANNED_PHRASES.filter((phrase) => {
    const escaped = escapeRegex(phrase).replace(/\s+/g, '\\s+')
    const pattern = new RegExp(`(^|[^\\p{L}\\p{N}_])${escaped}(?=$|[^\\p{L}\\p{N}_])`, 'iu')
    return pattern.test(text)
  })
}
