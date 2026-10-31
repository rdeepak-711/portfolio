# Portfolio UI v3 — build spec

**Goal.** Make the home page show the new writing, outside proof and contact clearly, so a recruiter scanning rdeepak.vercel.app sees current work, verifiable outside work and a big email address. There are six small steps, from the plan in `docs/ui-plan-2026-10-31.md`.

**Out of scope:**
- a new visual theme (keep the "build log" design system in `CLAUDE.md`: tokens, Bricolage/Hanken/JetBrains Mono, `§ NN —` labels, hairlines);
- any change to Dee, `/writing`, the notes, the case studies or the nav menu;
- a travelling or scroll-linked Dee;
- serif type;
- a photo;
- analytics changes;
- deploying (Deepak deploys).

Source of truth for every word and number: `/Volumes/asus/engineering-dossier/dossier/07_EVIDENCE_REGISTER.md`. The exact copy for new text is given below. Do not invent copy beyond it.

Test command: `npx vitest run`
Setup command: `npm install --no-audit --no-fund`
Preview command: `npm run dev -- -p $PORT`
Preview pages: `/, /writing`

## Files the builder may create or change

- `src/app/page.tsx`
- `src/app/globals.css`
- `src/components/CopyEmail.tsx` (new)
- `src/content/outside.ts` (new)
- `docs/decisions.md`, `docs/flow.md`, `docs/mental-model.md`
- **Do not edit any test file, `src/content/notes.ts`, `src/app/section-nav.tsx` or anything under `src/components/dee/` or `src/lib/`.** If a test looks wrong, stop and say so.

## Shared types and exports (tests import exactly these)

`src/content/outside.ts`:

```ts
export type OutsideWork = {
  repo: string                       // "owner/name"
  title: string
  plain: string                      // one plain-language sentence or two
  status: 'open' | 'merged' | 'comment'
  date: string                       // ISO yyyy-mm-dd
  links: { label: string; href: string }[]  // every href is https://github.com/...
}
export const OUTSIDE_WORK: ReadonlyArray<OutsideWork>
```

`src/components/CopyEmail.tsx`: `'use client'`, `export default function CopyEmail({ email }: { email: string })`.

## Build order (bottom up; do not start a step until the one before is green)

Tests are in `src/content/outside.test.ts` and `src/app/ui-v3.test.tsx`, one `describe` per step. Every existing test must stay green after each step.

### Step 1 · Home Writing becomes a collection (`ui-v3` "step 1")

In `section#writing` of `src/app/page.tsx`, replace the three hard-coded links:
- **Latest list.** A `<ul data-latest>` of the 3 newest notes from `NOTES`, sorted by `date` descending. Each item is a link to `/writing/<slug>` showing the title, the `dek` and the formatted date (the same `d Mon yyyy` format `/writing` uses).
- **One `<details>` per lane.** Below the latest list, one `<details>` per lane in `NOTE_LANES` order, only for lanes that have notes. Each `<summary>` reads exactly `Label · N`; no other text goes inside it, and any disclosure marker is CSS. Closed by default. Inside: a list of links to each note in that lane, newest first.
- **"All writing ↗"** links to `/writing`.

Edge cases:
- An empty lane renders nothing.
- `<details>`/`<summary>` work without JS and from the keyboard, with a visible focus style.
- The case-study links move out of Writing. They're already reachable from Experience and the proof chips; check that they still are.

### Step 2 · "Found in other people's code" (`outside.test.ts`, `ui-v3` "step 2")

Create `src/content/outside.ts` with exactly these two entries. Both were verified with `gh` on 31 Oct 2026; don't change the facts.

1. Entry 1:
   - `repo` `interviewstreet/hiring-agent`
   - `title` `hiring-agent: contributor counts looked up under the wrong owner`
   - `plain` `HackerRank’s résumé-scoring agent counted team and open-source repos as solo projects with 0 commits. I traced it to one line, filed issue #479 with a reproduction, and opened a 2-line fix in PR #480. It isn’t merged yet.`
   - `status` `open`, `date` `2026-10-11`
   - links `Issue #479` → `https://github.com/interviewstreet/hiring-agent/issues/479`, `PR #480` → `https://github.com/interviewstreet/hiring-agent/pull/480`
2. Entry 2:
   - `repo` `crewAIInc/crewAI`
   - `title` `crewAI #6072: ran all 8 open PRs against a bug test`
   - `plain` `Eight open pull requests claimed this issue. I merged each one onto main in its own Docker container with no network, ran it against a bug test that fails on main, and posted which ones actually pass.`
   - `status` `comment`, `date` `2026-10-26`
   - link `My comment` → `https://github.com/crewAIInc/crewAI/issues/6072#issuecomment-6423394143`

Render it as a new `section#outside`, placed **directly after `section#work`**:
- the label `§ 02 — Found in other people’s code` (with a typographic apostrophe);
- each entry shows the repo in mono, the title, the plain line, a status chip and its links;
- the status chip reads `open · not merged yet` for `open`, `comment` for `comment`, and `merged` for `merged`;
- renumber the later section labels so they stay in order.

Do not add it to the nav menu; the nav test pins the menu.

### Step 3 · Big email in Contact (`ui-v3` "step 3")

- In `section#contact`, add a link whose text is exactly `deepakrameshh@gmail.com` and whose href is `mailto:deepakrameshh@gmail.com`.
  - Display size: `font-display`, about `clamp(1.6rem, 5vw, 3rem)`, with `[overflow-wrap:anywhere]`.
  - It must not cause sideways scroll at 390px.
- Next to it goes `<CopyEmail email="deepakrameshh@gmail.com" />`, a `<button>` labelled `Copy email`.
  - On click it calls `navigator.clipboard.writeText(email)`.
  - On success it shows `Copied` in an element with `role="status"` and `aria-live="polite"` for about 2 seconds.
  - If the clipboard is missing or the call rejects, it shows `Copy failed — select the address above` instead. It must never throw.
- The existing Email / LinkedIn / GitHub / Résumé links stay.
- The footer gains an `Email` link (`mailto:deepakrameshh@gmail.com`) and a `Résumé` link (`/Deepak-R-Resume.pdf`).

### Step 4 · Employer line in the hero (`ui-v3` "step 4")

In `section#top`, directly under the `h1`, add one line with exactly this text: `Software Engineer at Firestorm Internet since Jul 2025 · before that, UiPath`. Style it in mono, small and muted, like the role line above the `h1`. Keep the existing reveal animation pattern.

### Step 5 · Wide-screen project bands (`ui-v3` "step 5")

- Each main project `article` in `PROJECTS` gets `data-band="left"` or `data-band="right"`, alternating from `left`.
- At `lg` (≥1024px) each band is a two-column grid: the text column and the screenshot `figure`. On `right` bands the figure is visually first (`lg:order-first`). DOM order stays text first, so screen readers read the same order.
- Below `lg` the layout is exactly as now: stacked, text then figure.
- The `DeeFigure` pose and the project number stay.
- The figure stays inside its `article`.

### Step 6 · Travel Measured card (`ui-v3` "step 6")

Add to `SECONDARY` a card with the `h3` `Travel Measured`:
- description: `Theme-park crowd calendars where every day says whether it was measured from recorded ride waits or estimated.`
- link `Open live site` → `https://travelmeasured.vercel.app`
- two post links: `Why it says “through the day”` → `/writing/site-said-every-30-minutes`, and `Measured or estimated` → `/writing/measured-or-estimated`

Give `SECONDARY` an optional `posts?: { label: string; href: string }[]`. No proof chip and no traffic numbers (no visitors, clicks, impressions or users). With 4 cards the grid is `sm:grid-cols-2 lg:grid-cols-4`.

## Done means

- `npx vitest run` is all green, with no test file edited. `npx tsc --noEmit` and `npx eslint src` are clean.
- Preview screenshots of `/` at phone and desktop show:
  - the collection;
  - the outside section after Work;
  - the big email with no sideways scroll;
  - the employer line;
  - alternating bands on desktop.
- `docs/decisions.md` has one entry for this round, and `docs/flow.md` notes that the home Writing section is generated from `NOTES`.
