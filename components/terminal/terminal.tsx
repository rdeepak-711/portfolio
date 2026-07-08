"use client";

import { motion } from "motion/react";
import type { CommandBlock } from "@/lib/data/outbuiltit";

export function TerminalWindow({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-term-line bg-term-panel shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]">
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-term-line bg-black/30 px-4 py-3 no-reader">
        <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        <span className="ml-3 font-mono text-xs text-term-dim">{title}</span>
      </div>
      <div className="space-y-7 p-5 font-mono text-sm leading-relaxed sm:p-7">{children}</div>
    </div>
  );
}

export function CommandLine({ block, index }: { block: CommandBlock; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.2) }}
    >
      <div className="flex gap-2">
        <span className="shrink-0 text-accent">deepak@outbuiltit</span>
        <span className="shrink-0 text-term-dim">~$</span>
        <span className="text-term-text">{block.command}</span>
      </div>
      <div className="mt-2 space-y-1 pl-0 text-term-text/85">
        {block.output.map((line, i) =>
          line === "" ? (
            <div key={i} className="h-2" />
          ) : (
            <p key={i} className={line.startsWith("✓") ? "text-accent" : undefined}>
              {line}
            </p>
          ),
        )}
      </div>
    </motion.div>
  );
}
