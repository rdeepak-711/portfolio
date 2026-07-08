import Link from "next/link";
import { profile } from "@/lib/data/profile";
import { Reveal } from "@/components/motion/reveal";
import { HeroSlot } from "@/components/motion/hero-slot";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <HeroSlot />
      <div className="relative z-10 mx-auto max-w-5xl px-5 pb-20 pt-20 sm:pt-28">
        <Reveal as="div">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-ink">
            {profile.location} · available for remote
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight sm:text-7xl">
            I build and ship real products fast — using{" "}
            <span className="italic text-accent-ink">AI as a force multiplier.</span>
          </h1>
        </Reveal>

        <Reveal delay={0.12}>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft">{profile.intro}</p>
        </Reveal>

        <Reveal delay={0.18}>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas transition-transform hover:-translate-y-0.5"
            >
              Work with me
              <span className="text-accent transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-ink-soft hover:text-ink"
            >
              See the work
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
