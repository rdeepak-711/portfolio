import type { Metadata } from 'next'
import Link from 'next/link'
import { NOTES, NOTE_LANES } from '@/content/notes'

export const metadata: Metadata = {
  title: 'Notes · Deepak Ramesh',
  description:
    'Notes on what I build at Outbuiltit, how I work with Claude Code, and the LeetCode problems where I got something wrong first.',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export default function WritingIndex() {
  const newestFirst = [...NOTES].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  const lanes = NOTE_LANES.map((lane) => ({ ...lane, notes: newestFirst.filter((n) => n.lane === lane.id) })).filter(
    (lane) => lane.notes.length > 0,
  )

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
        Short write-ups of what I build and what I got wrong on the way — the reasoning, the code,
        and the parts that only show up when you measure them.
      </p>

      {lanes.map((lane) => (
        <section key={lane.id} aria-labelledby={`lane-${lane.id}`} className="mt-14 border-t border-line pt-8">
          <h2 id={`lane-${lane.id}`} className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-muted sm:text-[0.78rem]">
            {lane.label} <span className="text-accent">· {lane.notes.length}</span>
          </h2>
          <ul className="mt-8 flex flex-col gap-10">
            {lane.notes.map((n) => (
              <li key={n.slug}>
                <Link href={`/writing/${n.slug}`} className="group block max-w-[68ch]">
                  <h3 className="font-display text-xl font-semibold tracking-[-0.02em] transition-colors group-hover:text-accent">
                    {n.title}
                  </h3>
                  <p className="mt-2 leading-relaxed text-muted">{n.dek}</p>
                  <p className="mt-2 font-mono text-xs text-muted">{formatDate(n.date)}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  )
}
