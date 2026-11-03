---
name: sync-dee
description: Sync Dee's facts with what Deepak has told Claude since the last sync. Compares career-ops profile files and the evidence register against Dee's claims and live answers, and adds only public-safe facts. Use when Deepak says "sync Dee", "update Dee", or "does Dee know about X".
---

# sync Dee

Dee (the portfolio chatbot) knows only `src/content/dee/claims.ts` plus Deepak's public daily answers in Redis. Nothing reaches it from Claude Code memory automatically, on purpose: memory holds private and unsettled facts that Dee must never say. This command is the manual, checked bridge.

## Sources, in order of authority

1. `/Volumes/asus/engineering-dossier/dossier/07_EVIDENCE_REGISTER.md`: the public register. **A fact Dee says must have a row here.** Its "Retired or forbidden wording" list overrides everything.
2. `/Volumes/asus/career-ops/profile/work-history.md`, `projects.md`, `skills.md`: what Deepak has told Claude, dated.
3. Live answers: `npm run -s dee:answers` (Q-ids; already live, don't duplicate them into claims).

## Steps

1. **Collect.** Read the three sources and `src/content/dee/claims.ts`.
2. **Diff.** List every fact in 1 or 2 that Dee cannot answer from claims.ts or a live Q- answer. Also list claims.ts lines that contradict the register (wrong number, retired wording).
3. **Sort each candidate into one bucket:**
   - **Add.** Public-safe, dated, from Deepak or verified in code. Register row exists, or Claude adds one in the same pass (confidence D for "Deepak, <date>", V only with a file:line or screenshot).
   - **Hold for Deepak.** Anything the register marks "interview only", "not as a headline" or ✗; numbers with more than one version; anything naming a client, employer decision or another person in a way they might not want public.
   - **Never.** Pay, expected CTC, contract terms (dates included), family or health detail beyond "family reasons", which companies he is applying to, take-homes for a live hiring process, anything from auto-memory that isn't in the profile files.
4. **Write.** Add register rows first, then claims in `claims.ts` (next free id in the right letter: F Firestorm, U UiPath, P personal, R role, E education, S skills). Write in plain third person, the register's wording, no claim stronger than its evidence. `confidence` matches the register: V → `verified`, D → `confirmed`, S → `self-reported`.
5. **Check.** `npx vitest run` and `npx tsc --noEmit`. `src/app/content-honesty.test.tsx` must still pass; if a sync retires a claim, add its wording to the BANNED list there.
6. **Commit** on a branch `dee-sync-<date>` as Deepak (no co-author trailer), merge to main, log a dated entry in `docs/decisions.md`. Deepak deploys: `vercel --prod` (Claude's deploys are blocked by auto mode).
7. **Report** to Deepak as three short lists: added (id + one line each), held (why, and the one question that would clear it), contradictions fixed.

If the user said "sync Dee" with no further approval, apply only the **Add** bucket and report the rest. Never move an item out of **Hold** without his answer.
