import type { AskInput } from './ask'

type NotifyDeps = { fetch: typeof fetch; env: Record<string, string | undefined> }

// Removed Telegram on 3 Nov (Deepak): the instant email already reaches his phone
export async function notifyDeepak(ask: AskInput, deps: NotifyDeps): Promise<{ email: boolean }> {
  const { fetch: fetcher, env } = deps
  return { email: env.RESEND_API_KEY ? await sendEmail(fetcher, env, ask) : false }
}

async function sendEmail(fetcher: typeof fetch, env: NotifyDeps['env'], ask: AskInput): Promise<boolean> {
  try {
    const response = await fetcher('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.RESEND_FROM || 'Dee <onboarding@resend.dev>',
        to: ['deepakrameshh@gmail.com'],
        reply_to: ask.email,
        subject: `Ask Deepak: ${ask.question.slice(0, 60)}`,
        text: [
          `Question: ${ask.question}`,
          `Name: ${ask.name || '(not provided)'}`,
          `Company: ${ask.company || '(not provided)'}`,
          `Reply-to email: ${ask.email}`,
          `Transcript: ${ask.transcript || '(not provided)'}`,
        ].join('\n\n'),
      }),
    })
    return response.ok
  } catch {
    return false
  }
}
