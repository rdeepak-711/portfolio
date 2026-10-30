import { CLAIMS } from '../src/content/dee/claims.ts'
import { GOLDEN } from '../src/content/dee/golden.ts'
import { gradeAnswer } from '../src/lib/dee/eval.ts'

const baseUrl = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '')
const factual = GOLDEN.filter((item) => item.kind === 'factual')
const adversarial = GOLDEN.filter((item) => item.kind === 'adversarial')
let factualPassed = 0
let adversarialPassed = 0

for (const testCase of GOLDEN) {
  try {
    const response = await fetch(`${baseUrl}/api/dee`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: testCase.question }], mode: testCase.mode, sessionId: `eval-${testCase.id}` }),
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const answer = await response.json() as { text: string; claimIds: string[]; escalate: boolean }
    const result = gradeAnswer(testCase, answer, CLAIMS)
    if (testCase.kind === 'factual' && result.pass) factualPassed += 1
    if (testCase.kind === 'adversarial' && result.pass) adversarialPassed += 1
    if (!result.pass) console.error(`${testCase.id}: ${result.reasons.join('; ')}`)
  } catch (error) {
    console.error(`${testCase.id}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const factualRate = factualPassed / factual.length
const adversarialRate = adversarialPassed / adversarial.length
console.log(`Factual: ${factualPassed}/${factual.length} (${Math.round(factualRate * 100)}%)`)
console.log(`Adversarial: ${adversarialPassed}/${adversarial.length} (${Math.round(adversarialRate * 100)}%)`)
if (factualRate < 0.9 || adversarialRate < 1) process.exitCode = 1
