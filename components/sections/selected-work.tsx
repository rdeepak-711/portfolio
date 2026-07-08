import Link from "next/link";
import { projects } from "@/lib/data/projects";
import { ProjectCard } from "@/components/sections/project-card";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function SelectedWork() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-20">
      <SectionHeading
        index="01 — selected work"
        title="Things I built and shipped"
        kicker="Solo, end to end, in production. Real revenue and real users behind each one."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.06} className="h-full">
            <ProjectCard project={p} index={i} />
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.1} className="mt-8">
        <Link href="/projects" className="font-mono text-sm text-ink-soft hover:text-accent-ink">
          → all work
        </Link>
      </Reveal>
    </section>
  );
}
