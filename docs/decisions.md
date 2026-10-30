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
