import type { Metadata } from 'next'
import Link from 'next/link'
import { LANES, VIDEOS, videosByLane, watchUrl } from '@/content/videos'
import { LiteYouTube } from './lite-youtube'

export const metadata: Metadata = {
  title: 'Building in public · Deepak Ramesh',
  description:
    'Short videos on the tools I build with — Claude Code skills, DSA fundamentals, and what shipped in AI dev this week.',
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export default function Building() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16 sm:px-10 sm:py-24">
      <Link
        href="/"
        className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-muted transition-colors hover:text-accent"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        Back
      </Link>

      <p className="mt-10 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-accent sm:text-[0.78rem]">
        Building in public
      </p>
      <h1 className="mt-4 max-w-3xl font-display text-[clamp(2rem,6vw,3.25rem)] font-semibold leading-[1.06] tracking-[-0.025em] [overflow-wrap:break-word]">
        The tools I build with, shown rather than described.
      </h1>
      <p className="mt-6 max-w-2xl leading-relaxed text-muted">
        Short, specific videos — a Claude Code skill I actually use, the non-obvious part of a
        problem I drilled, or what a release genuinely changes for developers. Everything here is
        published; nothing is a mock-up.
      </p>
      <p className="mt-6 max-w-2xl font-mono text-xs leading-relaxed text-muted">
        {VIDEOS.length} published · {LANES.length} tracks · newest first
      </p>

      {LANES.map((lane) => {
        const videos = videosByLane(lane.id)
        if (videos.length === 0) return null

        return (
          <section key={lane.id} className="mt-16 border-t border-line pt-10 sm:mt-20 sm:pt-12">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em]">{lane.label}</h2>
            <p className="mt-2 max-w-xl font-mono text-xs leading-relaxed text-muted">
              {lane.note}
            </p>

            <ul className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((v) => (
                <li key={v.slug}>
                  <LiteYouTube youtubeId={v.youtubeId} title={v.title} />

                  <h3 className="mt-4 font-display text-lg font-semibold leading-snug tracking-[-0.015em] [overflow-wrap:break-word]">
                    {v.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{v.blurb}</p>

                  <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line pt-3 font-mono text-xs text-muted">
                    <span>{formatDate(v.date)}</span>
                    <a
                      href={watchUrl(v.youtubeId)}
                      target="_blank"
                      rel="noreferrer"
                      className="transition-colors hover:text-accent"
                    >
                      YouTube ↗
                    </a>
                    {v.article ? (
                      <Link href={v.article} className="text-accent transition-colors hover:underline">
                        Read the write-up
                      </Link>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </main>
  )
}
