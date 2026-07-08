import { experience, skills } from "@/lib/data/experience";
import { SectionHeading } from "@/components/sections/section-heading";
import { Reveal } from "@/components/motion/reveal";

export function Experience() {
  return (
    <section className="border-t border-line bg-canvas-2/30">
      <div className="mx-auto max-w-5xl px-5 py-20">
        <SectionHeading index="02 — experience" title="Where I've shipped" />

        <div className="space-y-12">
          {experience.map((role, i) => (
            <Reveal key={role.company} delay={i * 0.05}>
              <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
                <div>
                  <h3 className="font-serif text-2xl tracking-tight text-ink">{role.company}</h3>
                  <p className="mt-1 text-sm font-medium text-ink-soft">{role.title}</p>
                  <p className="mt-1 font-mono text-xs text-ink-faint">{role.period}</p>
                  <p className="font-mono text-xs text-ink-faint">{role.location}</p>
                </div>
                <ul className="space-y-3">
                  {role.points.map((pt) => (
                    <li key={pt} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-14">
          <div className="flex flex-wrap gap-x-8 gap-y-4">
            {Object.entries(skills).map(([group, items]) => (
              <div key={group}>
                <div className="font-mono text-xs uppercase tracking-[0.15em] text-accent-ink">{group}</div>
                <div className="mt-2 max-w-xs text-sm text-ink-soft">{items.join(" · ")}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
