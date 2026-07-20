import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { NOTES, noteBySlug } from '@/content/notes'
import { VIDEOS, watchUrl } from '@/content/videos'
import { NoteBody } from '../note-body'

export function generateStaticParams() {
  return NOTES.map((n) => ({ slug: n.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const note = noteBySlug(slug)
  if (!note) return {}
  return {
    title: `${note.title} · Deepak Ramesh`,
    description: note.dek,
    openGraph: { title: note.title, description: note.dek, type: 'article' },
  }
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const note = noteBySlug(slug)
  if (!note) notFound()

  const video = note.video ? VIDEOS.find((v) => v.slug === note.video) : undefined

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10 sm:py-24">
      <Link
        href="/building"
        className="group inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-[0.1em] text-muted transition-colors hover:text-accent"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">←</span>
        Building
      </Link>

      <p className="mt-10 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-accent sm:text-[0.78rem]">
        Note · {formatDate(note.date)}
      </p>
      <h1 className="mt-4 font-display text-[clamp(1.9rem,5.5vw,3rem)] font-semibold leading-[1.08] tracking-[-0.025em] [overflow-wrap:break-word]">
        {note.title}
      </h1>
      <p className="mt-5 max-w-[62ch] text-lg leading-relaxed text-muted">{note.dek}</p>

      <NoteBody note={note} />

      {video ? (
        <p className="mt-12 border-t border-line pt-4 font-mono text-xs text-muted">
          Also on video —{' '}
          <a
            href={watchUrl(video.youtubeId)}
            target="_blank"
            rel="noreferrer"
            className="text-accent transition-opacity hover:opacity-70"
          >
            watch the short ↗
          </a>
        </p>
      ) : null}
    </main>
  )
}
