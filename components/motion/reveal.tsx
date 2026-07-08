"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Staggered scroll/load reveal. The single high-impact motion primitive —
 * everything that animates in uses this so the whole site shares one rhythm.
 * In reader mode the CSS strips transforms, so this degrades to plain text.
 */
export function Reveal({
  children,
  delay = 0,
  as = "div",
  className,
}: {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section" | "li" | "span";
  className?: string;
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}
