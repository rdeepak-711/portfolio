import type { Metadata } from "next";
import { projects } from "@/lib/data/projects";
import { profile } from "@/lib/data/profile";
import { ProjectCard } from "@/components/sections/project-card";
import { Reveal } from "@/components/motion/reveal";
import { ContactCta } from "@/components/sections/contact-cta";

export const metadata: Metadata = {
  title: `Work — ${profile.name}`,
  description: "Products I've built and shipped, end to end.",
};

export default function ProjectsPage() {
  return (
    <main className="relative z-10">
      <section className="mx-auto max-w-5xl px-5 pb-10 pt-20 sm:pt-28">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-ink">work</p>
          <h1 className="mt-6 max-w-2xl font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Built solo. Shipped to production. Used by real people.
          </h1>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.06} className="h-full">
              <ProjectCard project={p} index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      <ContactCta />
    </main>
  );
}
