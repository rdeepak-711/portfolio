'use client'
import { useState } from 'react'
import type { QaKind } from '@/lib/dee/answers'

type Props = { id: string; kind: QaKind; question: string; sig: string }

export default function AnswerForm({ id, kind, question, sig }: Props) {
  const [answer, setAnswer] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [state, setState] = useState<{ status: 'idle' | 'saving' | 'saved' | 'error'; message?: string }>({ status: 'idle' })

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setState({ status: 'saving' })
    const response = await fetch('/api/dee/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, kind, question, sig, answer, public: isPublic }),
    }).catch(() => null)
    const data = response ? await response.json().catch(() => ({})) : {}
    if (response?.ok) setState({ status: 'saved', message: data.live ? 'Saved. Dee can use this answer within a minute.' : 'Saved privately. Dee will not use it.' })
    else setState({ status: 'error', message: Array.isArray(data.error) ? data.error.join(' ') : 'Could not save. Try again.' })
  }

  if (state.status === 'saved') return <p role="status" className="mt-8 leading-relaxed">{state.message}</p>

  return (
    <form onSubmit={submit} className="mt-8 flex max-w-[62ch] flex-col gap-4">
      <label htmlFor="dee-answer" className="font-display text-lg font-semibold">Your answer</label>
      <textarea id="dee-answer" value={answer} onChange={(e) => setAnswer(e.target.value)} rows={6} maxLength={1500} required minLength={10}
        className="border border-line bg-paper p-3 leading-relaxed focus:outline-2 focus:outline-accent" />
      <label className="flex items-start gap-2 leading-relaxed">
        <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="mt-1.5 accent-accent" />
        <span>Dee can say this publicly. Dee quotes it and shows it came from you, on today&apos;s date.</span>
      </label>
      {state.status === 'error' && <p role="alert" className="text-accent">{state.message}</p>}
      <button type="submit" disabled={state.status === 'saving'} className="self-start border border-ink bg-ink px-5 py-2.5 text-paper disabled:opacity-60">
        {state.status === 'saving' ? 'Saving…' : 'Save answer'}
      </button>
    </form>
  )
}
