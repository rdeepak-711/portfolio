@AGENTS.md

# CLAUDE.md — Deepak Ramesh · Personal Portfolio

Context for any AI session working in this repo. Read before editing.

## What this is
Personal portfolio site for **Deepak Ramesh — Forward Deployed / Applied AI Engineer** (Chennai, remote). Audience: recruiters, hiring managers, and VC talent/platform teams at AI-native startups. Job: convey real depth and get a reply. The build plan lives in `plan.html` (open in a browser).

- **Live:** https://rdeepak.vercel.app
- **Repo:** github.com/rdeepak-711/portfolio (public)
- **Local:** `/Volumes/asus/projects/portfolio`

## Stack
- Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind v4 (CSS-first `@theme`) · `next/font/google`.
- Single page: `src/app/page.tsx`. Tokens + base styles: `src/app/globals.css`. Fonts + metadata: `src/app/layout.tsx`.

## Run / build / deploy
```bash
npm run dev          # local dev (localhost:3000)
npm run build        # verify it compiles before deploying
# deploy to production (CLI is authed; scope is required in non-interactive mode):
npx vercel@latest --prod --yes --scope onlyforthe20thcentury-5711s-projects
```
Notes: project is NOT git-connected on Vercel, so `git push` does NOT auto-deploy — run the deploy command above. Vercel "Deployment Protection" is OFF (the site must be publicly viewable — never re-enable it). Stable production alias: `rdeepak.vercel.app`.

## Design system — "build log"
Distinctive, document-like, anti-AI-slop. Do NOT drift toward generic templates.
- **Theme:** warm paper LIGHT (never dark+neon). Tokens in `globals.css` `@theme`: `--color-paper / ink / muted / line / accent / accent-soft` in OKLCH. Single rust accent (`--color-accent`), used rarely (60-30-10).
- **Type:** Bricolage Grotesque (display) · Hanken Grotesk (body) · JetBrains Mono (data/labels only — numbers, kickers, spec rows; never body).
- **Identity:** `§ NN —` section markers, hairline rules (`border-line`) between sections, mono spec rows (`stack · a · b · c`), footer build-stamp, left-aligned/asymmetric, generous whitespace.
- **Motion:** staggered page-load reveal (`.reveal` + inline `animationDelay`) + scroll reveals (`.reveal-scroll`). Both gated behind `prefers-reduced-motion: no-preference` and `@supports (animation-timeline: view())` so it degrades gracefully. Keep it.
- **Banned (AI tells):** dark-mode-with-glow, purple/blue gradients, gradient text (`background-clip:text`), `border-left` accent stripes >1px, glassmorphism everywhere, identical icon-cards, centered-everything, monospace-for-everything.
- Responsive: verified at 390px. Section grids use `sm:` breakpoints that collapse to single column. Keep headlines `[overflow-wrap:break-word]`.

## Content rules (IMPORTANT — honesty)
- Source of truth for public claims and numbers = `/Volumes/asus/engineering-dossier/dossier/07_EVIDENCE_REGISTER.md`; portfolio copy is in `05_PORTFOLIO_CONTENT.md`. Never use wording in the register’s “Retired or forbidden wording” list, and omit any claim that is absent from the register.
- Showcase (27 Oct 2026): Outbuiltit as his studio (outbuiltit.com) holding escalation-gate (gate.outbuiltit.com, MCP server) and LifeDots (lifedots.outbuiltit.com, Chrome Web Store), plus the WhatsApp bots as past work with no paying customers; CrowdTracker as a Firestorm product he is sole developer of; Firestorm experience; UiPath experience (automations around an AI scientist's classifier, not model training).
- Firestorm title is "Software Engineer" (never "II"). Never claim Cloud Build, CI/CD, dead-letter queues, backoff or structured-output validation. `src/app/content-honesty.test.tsx` fails if any retired claim comes back; add to its BANNED list when a claim is retired.
- Résumé: `public/Deepak-R-Resume.pdf` is a copy of career-ops `output/Deepak-R-Resume.pdf`; `public/deepak-ramesh-resume.pdf` is kept as the same file so old links still work.
- DELIBERATELY EXCLUDED: `presolv-agent` (private take-home tied to a live hiring process) and `career-ops` (a fork he extended, not his build). Do not add them.
- Positioning line: “Forward Deployed / Applied AI Engineer”. Lead with customer-facing automation and checked AI pipelines; do not overclaim deep-ML-research depth.

## Conventions
- All styling via Tailwind utilities (tokens are wired into `@theme`); avoid inline styles except the per-element `animationDelay`.
- Data-driven sections: arrays (`PROJECTS`, `EXPERIENCE`, `SKILLS`) mapped in `page.tsx` — add content there, not by duplicating markup.
- Commit as **Deepak Ramesh <deepakrameshh@gmail.com>** (not the Firestorm work git identity). Verify visual changes with a screenshot before deploying.
- `plan.html` is a local working doc — gitignored, not deployed.

Portfolio-grade project write-ups (site content source): ~/claude-work-me/projects/
