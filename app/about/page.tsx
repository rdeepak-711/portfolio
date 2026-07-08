import type { Metadata } from "next";
import { profile } from "@/lib/data/profile";
import { Reveal } from "@/components/motion/reveal";
import { ContactCta } from "@/components/sections/contact-cta";

export const metadata: Metadata = {
  title: `About — ${profile.name}`,
  description: "How I think about building software.",
};

const paragraphs = [
  "I'm not a traditional 10x engineer, and I don't pretend to be. What I am is a fast product owner: I take an idea and carry it all the way to production — data model, backend, frontend, deploy — usually solo, usually faster than anyone expects.",
  "My edge is treating AI as a real part of the toolchain, not a gimmick. I build multi-agent pipelines, wire LLMs into production systems with structured output and proper retries, and use Claude Code as a genuine co-pilot. That's how one person ships what used to take a team — 32 automated sites in four weeks, a multi-tenant SaaS, a travel platform with 550+ daily users.",
  "I care about the parts users never see: durable queues, idempotent webhooks, state machines you can actually test. Shipping fast only counts if the thing stays up. I'd rather build a small system that's correct than a big one that's clever.",
  "What I want next is scope — to own systems at a startup where shipping speed and ownership matter more than process. Deadline-driven, not clock-driven. Remote, building things that reach real people.",
];

export default function AboutPage() {
  return (
    <main className="relative z-10">
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-20 sm:pt-28">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-ink">about</p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            I ship real things — and I sweat the parts no one sees.
          </h1>
        </Reveal>

        <div className="mt-12 space-y-6">
          {paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <p className="text-lg leading-relaxed text-ink-soft">{p}</p>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-12">
          <div className="rounded-2xl border border-line bg-canvas-2/40 p-6 font-mono text-sm text-ink-soft">
            <p>
              <span className="text-accent-ink">$</span> based in {profile.location} ({profile.timezone})
            </p>
            <p className="mt-1">
              <span className="text-accent-ink">$</span> {profile.availability}
            </p>
            <p className="mt-1">
              <span className="text-accent-ink">$</span> currently @ Firestorm Internet — building automation that prints revenue
            </p>
          </div>
        </Reveal>
      </section>

      <ContactCta />
    </main>
  );
}
