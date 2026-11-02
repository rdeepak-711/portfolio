import type { Metadata } from 'next'
import { verifyQuestion, type QaKind } from '@/lib/dee/answers'
import AnswerForm from '@/components/dee/AnswerForm'

export const metadata: Metadata = { title: 'Answer for Dee', robots: { index: false, follow: false } }

const one = (value: string | string[] | undefined) => (typeof value === 'string' ? value : '')

// Opened from the daily email. Only a link signed with DEE_ANSWER_SECRET shows the form.
export default async function AnswerPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams
  const id = one(params.id)
  const kind = one(params.kind) as QaKind
  const question = one(params.q)
  const sig = one(params.sig)
  const valid = Boolean(process.env.DEE_ANSWER_SECRET) && (kind === 'daily' || kind === 'visitor') && verifyQuestion(id, kind, question, sig, process.env.DEE_ANSWER_SECRET ?? '')

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10 sm:py-24">
      {valid ? (
        <>
          <p className="text-muted">{kind === 'visitor' ? 'A visitor asked Dee this, and it had no answer.' : "Today's question for Dee."}</p>
          <h1 className="mt-4 font-display text-[clamp(1.6rem,5vw,2.4rem)] font-semibold leading-[1.15] tracking-[-0.02em] [overflow-wrap:break-word]">{question}</h1>
          <AnswerForm id={id} kind={kind} question={question} sig={sig} />
        </>
      ) : (
        <>
          <h1 className="font-display text-[clamp(1.6rem,5vw,2.4rem)] font-semibold tracking-[-0.02em]">This link is not valid.</h1>
          <p className="mt-4 max-w-[62ch] leading-relaxed text-muted">Open the link from Dee&apos;s email again. If it still fails, the link was changed after it was sent.</p>
        </>
      )}
    </main>
  )
}
