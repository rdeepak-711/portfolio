import { profile } from "@/lib/data/profile";
import { Reveal } from "@/components/motion/reveal";

export function ContactCta() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-ink px-6 py-16 text-canvas sm:px-12">
          <div
            className="no-reader absolute -right-20 -top-20 h-64 w-64 rounded-full blur-3xl"
            style={{ background: "var(--accent-glow)" }}
          />
          <p className="relative font-mono text-xs uppercase tracking-[0.2em] text-accent">
            {profile.availability}
          </p>
          <h2 className="relative mt-5 max-w-2xl font-serif text-4xl leading-tight tracking-tight sm:text-6xl">
            Got something worth building? Let&apos;s ship it.
          </h2>
          <div className="relative mt-9 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-[#04130d] transition-transform hover:-translate-y-0.5"
            >
              {profile.email}
            </a>
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-canvas/25 px-5 py-2.5 text-sm font-medium text-canvas transition-colors hover:border-canvas/60"
            >
              LinkedIn ↗
            </a>
            <a
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-canvas/25 px-5 py-2.5 text-sm font-medium text-canvas transition-colors hover:border-canvas/60"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
