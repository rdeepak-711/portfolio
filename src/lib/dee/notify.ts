import type { AskInput } from './ask'

type NotifyDeps = { fetch: typeof fetch; env: Record<string, string | undefined> }

export async function notifyDeepak(
  ask: AskInput,
  deps: NotifyDeps,
): Promise<{ email: boolean; telegram: boolean }> {
  const { fetch: fetcher, env } = deps
  const email = env.RESEND_API_KEY
    ? sendEmail(fetcher, env, ask)
    : Promise.resolve(false)
  const telegram = env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID
    ? sendTelegram(fetcher, env, ask)
    : Promise.resolve(false)

  const [emailSent, telegramSent] = await Promise.all([email, telegram])
  return { email: emailSent, telegram: telegramSent }
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

async function sendTelegram(fetcher: typeof fetch, env: NotifyDeps['env'], ask: AskInput): Promise<boolean> {
  try {
    const response = await fetcher(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text: `Ask Deepak: ${ask.question}\nName: ${ask.name || '(not provided)'}\nCompany: ${ask.company || '(not provided)'}`,
      }),
    })
    return response.ok
  } catch {
    return false
  }
}
