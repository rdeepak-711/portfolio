// Lists Deepak's answers to Dee's emailed questions: which are live (Dee can quote them) and which are private.
// These are D-level claims in the evidence register: stored in Redis dee:qa:<id>, live ones in the set dee:qa:live.
// Usage: node --env-file=.env scripts/dee-answers.mjs
const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN
if (!url || !token) { console.error('Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'); process.exit(1) }

async function redis(command) {
  const res = await fetch(url.replace(/\/$/, ''), { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(command) })
  const body = await res.json()
  if (body.error) throw new Error(body.error)
  return body.result
}

const asked = await redis(['SMEMBERS', 'dee:qa:asked'])
const keys = []
let cursor = '0'
do { const [next, batch] = await redis(['SCAN', cursor, 'MATCH', 'dee:qa:[vd]*', 'COUNT', '200']); cursor = next; keys.push(...batch) } while (cursor !== '0')
const answers = keys.length ? (await redis(['MGET', ...keys])).flatMap((v) => { try { return v ? [JSON.parse(v)] : [] } catch { return [] } }) : []
answers.sort((a, b) => a.at.localeCompare(b.at))

console.log(`Questions emailed: ${asked.length} · answered: ${answers.length} · live: ${answers.filter((a) => a.public).length}`)
for (const a of answers) console.log(`\n${a.at.slice(0, 10)} ${a.public ? 'LIVE   ' : 'private'} Q-${a.id} (${a.kind})\n  Q: ${a.question}\n  A: ${a.answer}`)
const unanswered = asked.filter((id) => !answers.some((a) => a.id === id))
if (unanswered.length) console.log(`\nEmailed, not answered yet: ${unanswered.join(', ')}`)
