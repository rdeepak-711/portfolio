import type { Metadata } from "next";
import Link from "next/link";
import { getProject } from "@/lib/data/projects";
import { outbuiltitDetail } from "@/lib/data/outbuiltit";
import { TerminalWindow, CommandLine } from "@/components/terminal/terminal";

const project = getProject("outbuiltit")!;

export const metadata: Metadata = {
  title: `${project.name} — case study`,
  description: project.summary,
};

export default function OutbuiltitPage() {
  return (
    <main className="surface-terminal relative z-10 min-h-screen">
      <div className="mx-auto max-w-3xl px-5 pb-28 pt-16">
        {/* breadcrumb */}
        <Link href="/projects" className="font-mono text-xs text-term-dim hover:text-accent no-reader">
          ← cd ../projects
        </Link>

        <header className="mt-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">case study · {project.year}</p>
          <h1 className="mt-4 font-mono text-4xl font-bold tracking-tight text-term-text sm:text-5xl">
            {project.name}
            <span className="cursor" />
          </h1>
          <p className="mt-3 font-mono text-sm text-term-dim">{project.tagline}</p>
          <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-term-text/85">
            {outbuiltitDetail.blurb}
          </p>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs text-accent transition-colors hover:bg-accent/20 no-reader"
            >
              open {project.liveLabel} ↗
            </a>
          )}
        </header>

        <div className="mt-12">
          <TerminalWindow title="outbuiltit — ~/case-study">
            {outbuiltitDetail.blocks.map((block, i) => (
              <CommandLine key={i} block={block} index={i} />
            ))}
          </TerminalWindow>
        </div>

        <div className="mt-8 flex flex-wrap gap-1.5">
          {project.stack.map((t) => (
            <span key={t} className="rounded border border-term-line px-2.5 py-1 font-mono text-[11px] text-term-dim">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-12 border-t border-term-line pt-8">
          <Link href="/contact" className="font-mono text-sm text-accent hover:underline">
            $ ./hire-deepak.sh →
          </Link>
        </div>
      </div>
    </main>
  );
}
