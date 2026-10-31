# Portfolio UI v4 — tighten the page (Codex part)

**Goal.** Cut the home page from 8 numbered sections to 6, and fix the voice, link-arrow, chip, phone-nav and diagram problems found in the 31 Oct critique. This makes room for the travelling Dee, which Claude builds separately in `src/components/dee/DeeFlight.tsx`.

**Out of scope:**
- anything under `src/components/dee/`, `src/lib/` or `src/content/` (Claude owns Dee and the content);
- the travelling Dee itself;
- new copy beyond what is given below;
- a new theme or new fonts (keep the "build log" system in `CLAUDE.md`);
- deploying.

Test command: `npx vitest run`
Setup command: `npm install --no-audit --no-fund`
Preview command: `npm run dev -- -p $PORT`
Preview pages: `/`

## Files the builder may create or change

- `src/app/page.tsx`
- `src/app/section-nav.tsx`
- `src/app/globals.css`
- `docs/decisions.md`, `docs/flow.md`
- **Do not edit any test file.** If a test looks wrong, stop and say so.

## Build order (do not start a step until the one before is green)

Tests are in `src/app/ui-v4.test.tsx` (one `describe` per step) and `src/app/page.test.tsx`. Every existing test must stay green.

### Step 1 · Six sections

New order of `section[id]` inside `main`: `top`, `work`, `outside`, `how-i-work`, `experience`, `writing`, `contact`. Labels:

| id | label |
|---|---|
| work | `§ 01 — Selected work` |
| outside | `§ 02 — Found in other people’s code` |
| how-i-work | `§ 03 — How I work` |
| experience | `§ 04 — Experience` |
| writing | `§ 05 — Writing & videos` |
| contact | `§ 06 — Contact` |

- **Stack folds into Experience.** Delete `section#stack`. After the two jobs in `section#experience`, render the same `STACK` data as a compact `<dl data-stack>` under a small mono heading `Stack`. One row per group, group in mono `text-xs` uppercase, items in mono `text-sm` muted. No new section, no `§` label.
- **Videos fold into Writing.** Delete `section#building`. Inside `section#writing`, after the lane `<details>` list, add `<div data-videos>` with an `h3` reading `Videos`, a `<ul>` of the same 3 `RECENT_VIDEOS` (same markup as today: lane label, title, blurb, link to `/building`), and a link `All videos →` to `/building`.
- `How I work` loses its empty feel: put the `ol` of 5 steps and the paragraph side by side at `lg` (`lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]`), stacked below `lg`.

### Step 2 · "Found in other people’s code" becomes a feature band

It is the most checkable proof on the page and currently sits in small type.

- `section#outside` gets `data-band="feature"` and a full-bleed tinted background using `--color-accent-soft` mixed toward paper (e.g. `color-mix(in oklch, var(--color-accent-soft) 45%, var(--color-paper))`). Full-bleed without sideways scroll: use a wrapper with `mx-[calc(50%-50vw)]` + `px-[calc(50vw-50%)]`, or a pseudo-element; check 390px for no horizontal overflow.
- Entry titles go up to `font-display text-2xl sm:text-3xl`. Repo stays mono. Status chip and links stay.
- Add one intro line under the label, exactly: `Bugs I traced in public repos, each with a link you can check.`

### Step 3 · First person, honest arrows, two kinds of chip

- **Voice.** In `PROJECTS`, change `Deepak built the AI site-building pipeline…` to `I built the AI site-building pipeline…`, and `On HackerRank’s hiring-agent, Deepak traced the bug by hand…` to `On HackerRank’s hiring-agent, I traced the bug by hand…`. No other text in `#work`, `#outside`, `#how-i-work` or `#experience` may contain the word `Deepak`. (Dee, the guide, still speaks about Deepak in the third person; that's in `src/components/dee/`, not your files.)
- **Arrows.** `↗` means "leaves this page". `ArrowLink` shows `↗` only when the href starts with `http` or `mailto:`, or ends in `.pdf` (the résumé opens a file); for hrefs starting with `/` or `#` it shows `→`. Same for `All writing ↗` (becomes `All writing →`) and the phone header's `Contact ↗` (removed; see step 4). `ProofChip` follows the same rule.
- **Chips.** A chip that links renders `<a data-chip="link">` with a solid border and the arrow. A chip that is only a fact renders `<span data-chip="fact">` with a **dashed** border (`border-dashed`) and no arrow, so the two never look the same. The status chip in `#outside` is a fact chip.

### Step 4 · Phone nav and phone diagram

- **Section nav on phones.** Below `sm`, the header shows the name on the left and the `SectionNav` links as a single horizontally scrollable row underneath (`overflow-x-auto`, `whitespace-nowrap`, hidden scrollbar, the scroll stays inside the row, never the page). At `sm` and up it stays as now. The menu items and their order must not change (a test pins them). Remove the separate phone-only `Contact ↗` link.
- **Diagram on phones.** In `PipelineDiagram`, the SVG labels render about 6px tall at 390px. Below `sm`, hide the SVG (`hidden sm:block`) and show `<ol data-pipeline-list>` with the same 5 stages, each as `01 Brief` style rows in mono `text-sm`, numbers in accent. At `sm` and up show the SVG as now.

### Step 5 · Make room for the travelling Dee

- **Remove the inline Dee figures** from `main`: the `DeeFigure` beside "70+ sites" in the factory project (keep the "70+ sites · checked before publishing" line) and the one beside the UiPath proof chip (keep the chip). Remove the `DeeFigure` import if unused. `<Dee/>` (the launcher, outside `main`) stays.
- **Hero dock.** At `lg`, `section#top` becomes a two-column grid: the existing content on the left, and on the right an empty `<div data-dee-dock="hero" aria-hidden="true">` about `18rem` wide and `20rem` tall, vertically centred. Below `lg` the dock is `hidden`. Keep the `h1` `max-w-[18ch]`; reduce its clamp max so it fits the left column without overflowing (e.g. `clamp(2.5rem,7vw,4.75rem)`).
- **Contact dock.** In `section#contact`, put an empty `<span data-dee-dock="contact" aria-hidden="true">` (inline-block, about `4rem` × `4rem`) directly after the `CopyEmail` button, inside the same flex row.
- Docks are empty boxes. They render nothing visible; `DeeFlight` measures them.

## Done means

- `npx vitest run` is all green with no test file edited; `npx tsc --noEmit` and `npx eslint src` are clean.
- At 390px and 1440px: no sideways scroll; the phone nav row scrolls on its own; the outside band reaches both edges.
- `docs/decisions.md` has one entry for this round (what changed, what was considered, cost). `docs/flow.md` notes the six-section order and the two `data-dee-dock` boxes.
