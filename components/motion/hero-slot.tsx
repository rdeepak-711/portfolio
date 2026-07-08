"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * RESERVED 3D / motion slot.
 *
 * v1 renders a lightweight animated SVG "field" — a placeholder with real
 * presence but zero heavy deps. To upgrade to 3D later, swap the inner JSX
 * for a <Canvas> from @react-three/fiber. Nothing else on the page changes:
 * the slot owns its own size, positioning, and reduced-motion handling.
 */
export function HeroSlot() {
  const reduced = useReducedMotion();
  const dots = Array.from({ length: 6 });

  return (
    <div className="no-reader pointer-events-none absolute inset-0 -z-0 overflow-hidden" aria-hidden>
      {/* soft accent halo */}
      <div
        className="absolute -right-24 top-10 h-72 w-72 rounded-full blur-3xl"
        style={{ background: "var(--accent-glow)" }}
      />
      <svg className="absolute right-0 top-0 h-full w-1/2 opacity-70" viewBox="0 0 400 400" fill="none">
        {dots.map((_, i) => (
          <motion.circle
            key={i}
            cx={120 + (i % 3) * 90}
            cy={120 + Math.floor(i / 3) * 110}
            r={3}
            fill="var(--accent)"
            initial={{ opacity: 0.2 }}
            animate={reduced ? undefined : { opacity: [0.2, 0.9, 0.2], scale: [1, 1.6, 1] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <motion.path
          d="M120 120 L210 120 L210 230 L300 230"
          stroke="var(--accent)"
          strokeWidth={1}
          strokeOpacity={0.4}
          fill="none"
          initial={{ pathLength: 0 }}
          animate={reduced ? { pathLength: 1 } : { pathLength: [0, 1, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
