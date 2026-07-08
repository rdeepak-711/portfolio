import type { Metadata } from "next";
import { profile } from "@/lib/data/profile";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: `Contact — ${profile.name}`,
  description: "Get in touch.",
};

const channels = [
  { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
  { label: "LinkedIn", value: "in/rdeepak", href: profile.links.linkedin },
  { label: "GitHub", value: "rdeepak-711", href: profile.links.github },
];

export default function ContactPage() {
  return (
    <main className="relative z-10">
      <section className="mx-auto max-w-3xl px-5 pb-32 pt-20 sm:pt-28">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-ink">contact</p>
          <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            Let&apos;s talk.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
            Building something where ownership and shipping speed matter? I&apos;m open to remote-first
            roles ({profile.timezone}-compatible) and interesting collaborations. The fastest way to
            reach me is email.
          </p>
        </Reveal>

        <div className="mt-12 divide-y divide-line border-y border-line">
          {channels.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.05}>
              <a
                href={c.href}
                target={c.href.startsWith("mailto") ? undefined : "_blank"}
                rel="noreferrer"
                className="group flex items-center justify-between py-5 transition-colors hover:text-accent-ink"
              >
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-ink-faint">{c.label}</span>
                <span className="flex items-center gap-3 text-lg text-ink group-hover:text-accent-ink">
                  {c.value}
                  <span className="text-accent transition-transform group-hover:translate-x-1">↗</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}
