# Decisions

Why the site is the way it is. Newest first. Never delete an entry; mark it reversed and say what changed.

## 2026-10-27 · The site follows the CV, and a test enforces it

**Decided:** every claim on the site is rewritten from career-ops `cv.md` and `profile/work-history.md`, and `src/app/content-honesty.test.tsx` fails the build's test run if any retired claim reappears (BANNED list) or if the studio, its products, the CV stack words or the current résumé link go missing.

**Considered:** fixing the copy by hand and relying on review. Rejected because the copy had already drifted from the CV twice: the source in this repo still said Outbuiltit was "launched commercially, onboarding first paying tenants" after the live site had been corrected, and claims like dead-letter queues and structured-output validation stayed up weeks after the CV dropped them as unsupported.

**Why this won:** the site is linked from every application, so a wrong claim is read by recruiters; a string test is cheap and catches the exact phrases that went wrong before.

**Cost:** a phrase test is blunt. It only catches wording on the list, not a new wrong claim in fresh words, so new copy still has to be checked against the CV by a person.

## 2026-10-27 · Outbuiltit is shown as a studio, not as a failed product

**Decided:** project 01 is Outbuiltit the studio (outbuiltit.com, relaunched 23 Oct as the home of escalation-gate and LifeDots); escalation-gate and LifeDots are projects 02 and 03; the WhatsApp bots move inside the Outbuiltit entry as past work that never found buyers. CrowdTracker moves to 04 and is labelled a Firestorm product, which is what it is.

**Considered:** keeping "Outbuiltit · my product · paused" as the first project. Rejected because it led the page with a stalled product while two live products sat lower or were missing (LifeDots was not on the site at all). Also considered putting "Founder, Outbuiltit" under Experience; rejected because a founder role next to a full-time job reads as moonlighting to an employer and there is no revenue behind the title.

**Why this won:** it is accurate and shows the most current work first.

**Cost:** the bots' own detail (17-state machine, HMAC webhooks, 495 tests) is compressed into two sentences.

## 2026-10-27 · Claims removed

- Firestorm title "Software Engineer II" → "Software Engineer" (Deepak).
- Cloud Build and CI/CD removed everywhere (Deepak: no more work on that).
- Celery "retry policies, exponential backoff, dead-letter queues" and "structured-output validation, retries on malformed responses" removed: not in the CV; career-ops `data/profile.local.json` already says to remove them "until it exists". The Celery/Redis queue stays, as separate Firestorm work, never as part of the 5 → 32 pipeline (whose stack is Python, Bash, WP-CLI).
- "1,200–1,800 pages a month" and the pipeline step list (SSH checks, licence activation, etc.) removed from the case study: not in `cv.md`.
- UiPath "helped train and deploy" the classifier → "built the automations around" it; the model was an AI scientist's. "Confidence thresholds, human fallback" removed for the same reason.
- CrowdTracker "60 to 400+" → "60–70 to 600+ a day" (GA4, 28 days to 15 Oct 2026); "my product" → a Firestorm product.
- escalation-gate: issue #424 was described as "the same résumé gets different scores"; the real issue is "GitHub enrichment: project_type and contributor counts never reach the evaluator". Links moved from escalation-gate-rdeepak.vercel.app to gate.outbuiltit.com. "54 pytest tests" dropped (stale count).
- Hero "schema validation, retries" → "code checks what the model claims, and a human gate sits where the model is least reliable".

## 2026-10-27 · A /privacy page for the Codephilic publisher

**Decided:** add `src/app/privacy/page.tsx`, a short privacy statement for the Codephilic publisher (the script that uploads to my YouTube channel), and use rdeepak.vercel.app as the home page and authorised domain on the codephilic-analytics Google OAuth consent screen.

**Considered:** a GitHub Pages page on the codephilic-media repo. Rejected because that repo is a public image host for Instagram, and the portfolio is already the one site linked everywhere.

**Why this won:** Google keeps "Publish app" disabled until the consent screen's branding has a home page and privacy policy, and a Testing-mode app's tokens expire after 7 days, which would break unattended uploads.

**Cost:** an unlinked page on the portfolio that must stay true if the publisher ever gets other users or sends data anywhere.

## 2026-10-31 · Keep the build-log theme

**Decided:** portfolio v2 keeps the warm paper, rust accent, existing type system, section marks, hairline rules and restrained motion, while using the space for a Forward Deployed / Applied AI story.

**Considered:** replacing the page with a conventional dark AI portfolio. Rejected because it would discard the visual identity already associated with the site and blur the evidence-first tone.

**Why this won:** the existing build-log system already reads like an engineer's working record; the new hierarchy and diagrams make the evidence easier to scan without changing that identity.

**Cost:** some interaction patterns, including Dee and the pipeline, need careful responsive and reduced-motion behavior within the restrained palette.

## 2026-10-31 · Dee uses a TypeScript knowledge base rather than YAML

**Decided:** Dee's claims, FAQ, limits, profile, tour and golden cases stay as typed TypeScript modules.

**Considered:** YAML plus Markdown as drafted in the mascot design. Rejected because the Next.js app consumes these records directly, while TypeScript checks links between claim IDs and UI types without adding a parser or a second content-loading path.

**Why this won:** the compact knowledge base fits in the existing prompt builder and can be imported by both route handlers and deterministic graders.

**Cost:** copy edits require a TypeScript build and data modules are less approachable to nontechnical editors.

## 2026-10-31 · Ask Deepak is an asynchronous handoff

**Decided:** unanswered questions are collected in a form and delivered through the existing email and Telegram integrations.

**Considered:** a live takeover through a socket or presence-aware chat. Rejected because it requires Deepak to be online and adds a real-time relay to a small portfolio feature.

**Why this won:** visitors can leave a question at any time and Dee can keep the conversation bounded to the verified record.

**Cost:** the visitor does not receive an immediate human response; the interface sets an expected reply window.

## 2026-10-31 · Use Haiku with a daily cap, OpenRouter fallback and FAQ-only no-key mode

**Decided:** use Claude Haiku as the primary model, stop primary spend at $5 per day, use OpenRouter as a fallback, and answer from FAQ matching when no model key is available.

**Considered:** making the portfolio chat unavailable without keys or letting the primary model run without a daily spend limit. Rejected because either choice makes the preview less useful or leaves cost unbounded.

**Why this won:** the tour and FAQ path remain available in a no-key preview, while the cap and fallback keep generation optional after the spend threshold.

**Cost:** FAQ mode covers only known matches, and a fallback model still needs evaluation against the same grounding rules.

## 2026-10-31 · Keep pricing in a conservative code constant

**Decided:** model token pricing lives in the budget module as a conservative constant with an explicit pre-launch verification note.

**Considered:** configuring prices through environment variables or looking them up at request time. Rejected because either approach adds operational coupling to the spend guard.

**Why this won:** cost calculation stays deterministic and the cap behavior can be checked without network access.

**Cost:** a price change requires a code edit and the constant must be checked against provider pricing before launch.

## 2026-10-31 — Dee fails safe when Redis is down, and strips inline claim tags

**Decided:** if the Upstash store throws, rate limits are skipped (the request goes through), today's spend is treated as over the cap (so the paid model is skipped and Dee uses OpenRouter or the FAQ), and a failed spend write is ignored. Inline tags like `[F2]` are removed from answer text, and the prompt now tells the model to list claim IDs only in `claimIds`. Haiku 5.5 is priced at $0.125 in (the cache-write rate) / $0.50 out / $0.01 cache read, and thinking is off.
**Considered:** failing the whole request with a 500 (what happened with a mistyped Redis URL); failing open on spend too.
**Why:** a store outage should cost visitors an answer quality step, not the page, and should never be able to lift the $5/day cap. The page already shows sources as chips, so inline tags were noise.
**Cost:** while Redis is down there are no rate limits, and Dee answers only from the fallback model or the FAQ.

## 2026-10-31 — A proof chip links only to a page that shows the number

**Decided:** proof chips (GA4 numbers, install counts, forum count) are plain text unless the target page shows that number. Unlinked: CrowdTracker GA4 and user counts, f1weekend GA4, 3 live forums (pointed at a GitHub profile), LifeDots installs, the résumé-scorer audit (its page never existed and returned 404). The case studies were rewritten from the evidence register: "5 → 32 in 4 weeks", "36", "4–10 days" and "₹1L+" are gone (not in the register, or interview-only), "+70% throughput" is gone (register U3: source not given, interview only), and "85–90% accuracy" is no longer shown as Deepak's metric (it was the AI scientist's classifier). The UiPath page gained the invoice section the home page already linked to. Dee's LinkedIn link was wrong (/in/deepakramesh) and is now /in/rdeepak.
**Considered:** hosting GA4 screenshots as proof. Not done: the CrowdTracker GA4 property is Firestorm's, so publishing it needs their OK.
**Why:** a link styled as proof that lands on a page without the number reads as padding to a careful reviewer, and costs the real numbers their credibility.
**Cost:** the numbers lose a click-through. They stay checkable in an interview from the register's sources.

## 2026-10-31 — Portfolio checked against the 20 portfolio principles; accent darkened for contrast

**Decided:** implement only the gaps, not all 20 (14 were already met). Added captioned live screenshots for all four headline projects (taken with Playwright, analytics blocked; the escalation-gate shot is cropped above the issue #424 box, which is flagged wrong), a plain-language first line per project before the tech, a link to a site the pipeline built (operagarnier-guide.com) and to the Louvre forum, a menu cut to Work · Method · Experience · Writing · Contact · Résumé, and "Open live site" instead of "Open project". The accent moved from oklch(0.62 0.18 42) to oklch(0.56 0.17 42): 3.65:1 on paper failed WCAG AA for the small mono labels; 4.66:1 passes.
**Considered:** rebuilding to all 20 points; leaving the accent and only using it for large text.
**Why:** the portfolio exists to back the CV quickly; every hour here is an hour not applying. The accent is used on 12px labels, so it had to pass at small sizes.
**Cost:** screenshots go stale when the sites change and need retaking. Core Web Vitals are unmeasured until the site is deployed.

## 2026-10-31 · Writing grouped by lane; 9 LeetCode notes retired

**Decided:** /writing groups notes into lanes (Outbuiltit, Code review, Hackathons, Making the videos, Job hunt, Claude Code, LeetCode), and a lane with no notes is hidden. 9 of the 13 LeetCode notes are retired: best-time-buy-sell, two-sum-ii, valid-palindrome, valid-sudoku, group-anagrams, 3sum, top-k, product-except-self and contains-duplicate. Each retired URL now 308-redirects to /writing via `next.config.ts`. A test caps the LeetCode lane at 4.

**Considered:** keeping all 13 in a collapsed LeetCode lane, which preserves every page but leaves /writing at 13 of 15 LeetCode. The other option was deleting the retired notes without redirects, which breaks any shared link.

**Why this won:** 13 of 15 notes were LeetCode, so an FDE hiring manager opening /writing saw a DSA practice log. The 4 notes kept each record a mistake I made or found (stale DP values, a no-op `.lower()`, check-before-store order, a maxFreq that never drops). The 9 retired ones were textbook tricks that any LeetCode explainer already covers. Hiding empty lanes avoids the sparse sections that weakened rahulm.me.

**Cost:** the 9 notes are gone from the site; they're still in git history. Outbuiltit and Claude Code hold 1 note each until the new posts land. The Meta hackathon is not listed (rejected 31 Oct). Kiroween (entered solo, due 4 Dec) gets a post only from real build progress.

## 2026-10-31 · First Travel Measured post; notes can link out

**Decided:** add a Travel Measured lane and the post "My site said every 30 minutes. It recorded about every 5 hours." Notes gain a `link` block that opens in a new tab with `rel="noopener noreferrer"`. The honesty test now checks every note against BANNED, not only the escalation-gate one.

**Considered:** filing Travel Measured under Outbuiltit. It isn't one of the studio's products, so that would blur the studio line. Also considered pasting the URL as plain text in a paragraph, but it wouldn't be clickable.

**Why this won:** the post is a mistake story (a claim the system didn't back), like the LeetCode notes kept. Every fact traces to a source:
- `career-ops/audit/travel-measured.md`: 15 runs in ~69 h, a 4.9 h mean gap, audited 15 Oct.
- travel-measured-site `docs/decisions.md`: the 12 Oct risk line and "99 runs in 18 days, 11 titles" (30 Oct).
- commit 85275df: the claim dropped.
- live /method: "Recorded 5 times in the last 24 hours" on 31 Oct.

**Cost:** the post states the cron-job.org trigger isn't on yet. When Deepak turns it on (D0), add a dated line to the post rather than rewriting history. No traffic numbers are published, and the repo isn't linked because it's private.

## 2026-10-31 · LifeDots post: the 60-second idle rule

**Decided:** add "Why LifeDots stops counting after 60 seconds" under Outbuiltit. Sources:
- `everdot/extension/src/lib/config.ts` (`IDLE_SECONDS = 60`);
- `lib/time.ts` (`MAX_GAP_MS` and the "it reset although I did the habit" reasoning);
- the 16 Oct exchange on X;
- register P4 for installs.

A test bars any note from calling LifeDots a "LeetCode tracker" or stating a user count.

**Considered:** naming the X commenter (it was public, but they never agreed to be quoted), and saying "51 installs in its first 30 days". The register covers 30 Sep – 29 Oct, and installs started 20 Sep, so "first" was false.

**Why this won:** it's a design-tradeoff post with a real outside voice, and it shows judgment about defaults over feature-building.

**Cost:** the focused and thinking-minutes split is described as a design, not a feature. If it ships, the post needs a dated update.

## 2026-10-31 · escalation-gate post: #477 merges clean and would crash

**Decided:** E1 tells the #476/#477 story rather than #479/#480. The first escalation-gate note already covers #479/#480 under "And where it was wrong", including the 25-of-99 owner bug, so writing it again would repeat it.

**Verified before writing:** the 15 Oct audit flagged the #477 TypeError reasoning as not re-checked against the diff, so I checked it on 31 Oct.
- `gh pr diff 477` removes `prefix` from `fetch_profile` and from 4 of 5 calls. The `dev_profile` call keeps `"dev"`, matching `transform.py` at e0ece80.
- The packet at gate.outbuiltit.com/hiring-agent/issues/476.html says: $0.04, 8/8 citations, 192 → 11, #477 "Partly · Merges clean".
- #477 is open and unmerged per the GitHub API.

**Considered:** naming the PR author (no: the post is about the tool, not about them); asserting the crash without checking it (no: that is the unverified-claim habit the Travel Measured post is about).

**Cost:** the crash is shown by reading the diff and Python's call rules, not by running the PR. The post says so, and says V2 will run it.
