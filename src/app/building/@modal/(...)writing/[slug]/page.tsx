import Link from 'next/link'
import { notFound } from 'next/navigation'
import { noteBySlug } from '@/content/notes'
import { VIDEOS, watchUrl } from '@/content/videos'
import { NoteBody } from '@/app/writing/note-body'
import { NoteModal } from '../../note-modal'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m - 1]} ${y}`
}

/**
 * Intercepted note — shown as an overlay when navigating from /building.
 * The same slug rendered directly hits src/app/writing/[slug]/page.tsx.
 */
export default async function InterceptedNote({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const note = noteBySlug(slug)
  if (!note) notFound()

  const video = note.video ? VIDEOS.find((v) => v.slug === note.video) : undefined

  return (
    <NoteModal>
      <article className="px-6 py-12 sm:px-10 sm:py-14">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-accent">
          Note · {formatDate(note.date)}
        </p>
        <h1 className="mt-4 font-display text-[clamp(1.6rem,4.5vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.025em] [overflow-wrap:break-word]">
          {note.title}
        </h1>
        <p className="mt-4 max-w-[62ch] leading-relaxed text-muted">{note.dek}</p>

        <NoteBody note={note} />

        <p className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4 font-mono text-xs text-muted">
          <Link href={`/writing/${note.slug}`} className="text-accent transition-opacity hover:opacity-70">
            Open full page →
          </Link>
          {video ? (
            <a
              href={watchUrl(video.youtubeId)}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-accent"
            >
              Watch the short ↗
            </a>
          ) : null}
        </p>
      </article>
    </NoteModal>
  )
}
