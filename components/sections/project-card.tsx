import Link from "next/link";
import type { Project } from "@/lib/data/projects";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const num = String(index + 1).padStart(2, "0");
  const inner = (
    <article className="group relative flex h-full flex-col gap-4 rounded-2xl border border-line bg-canvas p-6 transition-all hover:-translate-y-1 hover:border-accent-ink/40 hover:shadow-[0_18px_40px_-24px_rgba(4,199,154,0.4)]">
      <div className="flex items-start justify-between">
        <span className="font-mono text-xs text-ink-faint">{num}</span>
        <span className="font-mono text-xs text-ink-faint">{project.year}</span>
      </div>

      <div>
        <h3 className="font-serif text-3xl tracking-tight text-ink">{project.name}</h3>
        <p className="mt-1 text-sm text-ink-soft">{project.tagline}</p>
      </div>

      <p className="font-mono text-xs leading-relaxed text-accent-ink">{project.heroMetric}</p>
      <p className="text-sm leading-relaxed text-ink-soft">{project.summary}</p>

      <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
        {project.stack.slice(0, 5).map((t) => (
          <span key={t} className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-ink-faint">
            {t}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 pt-2 font-mono text-xs">
        {project.hasDetail && (
          <span className="text-ink transition-colors group-hover:text-accent-ink">
            cat case-study →
          </span>
        )}
        {project.url && (
          <span className="text-ink-faint">{project.liveLabel} ↗</span>
        )}
      </div>
    </article>
  );

  // Detail page if it exists, else link to the live product.
  if (project.hasDetail) {
    return (
      <Link href={`/projects/${project.slug}`} className="block h-full">
        {inner}
      </Link>
    );
  }
  if (project.url) {
    return (
      <a href={project.url} target="_blank" rel="noreferrer" className="block h-full">
        {inner}
      </a>
    );
  }
  return inner;
}
