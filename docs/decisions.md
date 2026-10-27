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
