import type { Block, Note } from '@/content/notes'

/** Renders a note's blocks. Shared by the standalone page and the modal. */
export function NoteBody({ note }: { note: Note }) {
  return (
    <div className="mt-10 flex flex-col gap-6">
      {note.body.map((block, i) => (
        <BlockView key={i} block={block} />
      ))}
    </div>
  )
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'h':
      return (
        <h2 className="mt-4 font-display text-xl font-semibold tracking-[-0.02em]">{block.text}</h2>
      )
    case 'p':
      return <p className="max-w-[68ch] leading-relaxed text-ink/85">{block.text}</p>
    case 'list':
      return (
        <ul className="flex max-w-[68ch] flex-col gap-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-ink/85">
              <span className="font-mono text-sm text-line">{String(i + 1).padStart(2, '0')}</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      )
    case 'link':
      return (
        <a
          href={block.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-1.5 font-medium text-ink underline underline-offset-4 transition-colors hover:text-accent"
        >
          {block.label}
          <span className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent">↗</span>
        </a>
      )
    case 'code':
      return (
        <pre className="overflow-x-auto border border-line bg-paper px-4 py-3.5">
          <code className="font-mono text-[0.8rem] leading-relaxed text-ink">{block.code}</code>
        </pre>
      )
  }
}
