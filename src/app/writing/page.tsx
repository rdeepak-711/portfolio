import type { Metadata } from 'next'
import Link from 'next/link'
import { NOTES } from '@/content/notes'

export const metadata: Metadata = {
  title: 'Notes · Deepak Ramesh',
  description:
    'Short written notes on things I build with and problems I work through — the readable version of the videos.',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export default function WritingIndex() {
  const notes = [...NOTES].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10 sm:py-24">
      <Link
        href="/"
        className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-muted transition-colors hover:text-accent"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        Back
      </Link>

      <p className="mt-10 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-accent sm:text-[0.78rem]">
        Notes
      </p>
      <h1 className="mt-4 font-display text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.025em]">
        The readable version.
      </h1>
      <p className="mt-6 max-w-[62ch] leading-relaxed text-muted">
        Short write-ups of the things I make videos about — the reasoning, the code, and the parts
        that only show up when you measure them.
      </p>

      <ul className="mt-14 flex flex-col gap-10">
        {notes.map((n, i) => (
          <li key={n.slug}>
            <Link href={`/writing/${n.slug}`} className="group block max-w-[68ch]">
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-sm text-accent">
                  {String(notes.length - i).padStart(2, '0')}
                </span>
                <h2 className="font-display text-xl font-semibold tracking-[-0.02em] transition-colors group-hover:text-accent">
                  {n.title}
                </h2>
              </div>
              <p className="mt-2 pl-[1.7rem] leading-relaxed text-muted">{n.dek}</p>
              <p className="mt-2 pl-[1.7rem] font-mono text-xs text-muted">{formatDate(n.date)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
