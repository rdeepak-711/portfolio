// Prints how visitors use Dee: chats per day and the latest questions.
// Needs UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (the local .env has them).
// Usage: node --env-file=.env scripts/dee-stats.mjs [latest=20]
const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN
if (!url || !token) { console.error('Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.'); process.exit(1) }
const latest = Number(process.argv[2] ?? 20)

async function redis(command) {
  const res = await fetch(url.replace(/\/$/, ''), { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(command) })
  const body = await res.json()
  if (body.error) throw new Error(body.error)
  return body.result
}

const days = [...Array(14)].map((_, i) => new Date(Date.now() - i * 86400000).toISOString().slice(0, 10))
const counts = await Promise.all(days.map((d) => redis(['GET', `dee:chats:${d}`])))
console.log('Chats per day (last 14):')
days.forEach((d, i) => console.log(`  ${d}  ${counts[i] ?? 0}`))

const entries = (await redis(['LRANGE', 'dee:chats', '0', String(latest - 1)])).map((e) => JSON.parse(e))
const all = (await redis(['LRANGE', 'dee:chats', '0', '4999'])).map((e) => JSON.parse(e))
const sessions = new Set(all.map((e) => e.sessionId)).size
console.log(`\nStored chats: ${all.length} from ${sessions} sessions · escalated: ${all.filter((e) => e.escalate).length}`)
console.log(`\nLatest ${entries.length}:`)
for (const e of entries) {
  console.log(`  ${e.at.slice(0, 16)} [${e.mode}/${e.source}${e.escalate ? '/escalated' : ''}] ${e.question.slice(0, 120)}`)
  // Fields added 2 Nov: where the visitor came from, where they opened Dee, and Dee's answer
  const from = [e.ref && `?ref=${e.ref}`, e.referrer && `via ${e.referrer}`].filter(Boolean).join(' ')
  const place = [e.city, e.region, e.country].filter(Boolean).join(', ')
  if (from || place || e.device) console.log(`      from: ${from || 'direct'} · ${place || 'unknown location'} · ${e.device || 'unknown device'}${e.landing ? ` · first page ${e.landing}` : ''}`)
  if (e.answer) console.log(`      Dee: ${e.answer.slice(0, 160)}`)
}
