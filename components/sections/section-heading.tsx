import { Reveal } from "@/components/motion/reveal";

export function SectionHeading({ index, title, kicker }: { index: string; title: string; kicker?: string }) {
  return (
    <Reveal className="mb-10">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-xs text-accent-ink">{index}</span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <h2 className="mt-4 font-serif text-4xl tracking-tight text-ink sm:text-5xl">{title}</h2>
      {kicker && <p className="mt-3 max-w-xl text-ink-soft">{kicker}</p>}
    </Reveal>
  );
}
