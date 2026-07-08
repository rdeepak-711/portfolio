import { profile } from "@/lib/data/profile";
import { Reveal } from "@/components/motion/reveal";

export function Stats() {
  return (
    <section className="border-b border-line bg-canvas-2/40">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px px-5 py-px sm:grid-cols-4">
        {profile.stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.05} className="px-1 py-8 sm:px-4">
            <div className="font-serif text-4xl tracking-tight text-ink sm:text-5xl">{s.value}</div>
            <div className="mt-2 text-sm font-medium text-ink">{s.label}</div>
            <div className="mt-1 font-mono text-xs text-ink-faint">{s.sub}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
