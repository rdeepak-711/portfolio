import type { FaqEntry } from './types'

export const FAQ: FaqEntry[] = [
  { q: 'Who is Deepak?', a: 'Deepak Ramesh is a Forward Deployed / Applied AI Engineer in Chennai, open to remote work.', claimIds: ['F2', 'U1'] },
  { q: 'What does Deepak do now?', a: 'Deepak is a Software Engineer at Firestorm Internet, a travel company, where he joined as the only developer in Jul 2025. He builds and runs its AI site-building pipeline (70+ sites), CrowdTracker, the multi-tenant forum platform and the enquiry inbox, and mentors a junior developer.', claimIds: ['F1', 'F2', 'F7', 'F8', 'F10'] },
  { q: 'What has Deepak actually built?', a: 'Deepak built a site-building pipeline, CrowdTracker, a multi-tenant forum app, f1weekend.co and an enquiry inbox.', claimIds: ['F2', 'F7', 'F8', 'F9', 'F10'] },
  { q: 'Which agents and automations has Deepak built?', a: 'Deepak built a staged site-generation pipeline and escalation-gate, which checks citations and merge safety when finding a pull request for an issue.', claimIds: ['F2', 'F5', 'P1'] },
  { q: 'Has Deepak deployed real products?', a: 'Deepak built CrowdTracker, f1weekend.co, a forum platform with 3 live forums, LifeDots and the site-building pipeline.', claimIds: ['F2', 'F7', 'F8', 'F9', 'P4'] },
  { q: 'How does Deepak use Claude Code and Codex?', a: 'Deepak writes specs and tests, then uses AI to produce most code inside a harness he runs; outputs are checked before shipping.', claimIds: ['P1', 'F2'] },
  { q: 'Can Deepak own a project end to end?', a: 'Deepak was CrowdTracker’s sole developer and built its migration, quota-error guard and sampler.', claimIds: ['F7'] },
  { q: 'What is Deepak’s strongest technical project?', a: 'The site-building pipeline joins staged generation, checks between stages and publishing; it produced 70+ sites.', claimIds: ['F2', 'F5'] },
  { q: 'How does Deepak debug?', a: 'Deepak traces a failure to its cause and checks the evidence. On the hiring-agent, he traced a merge-crashing pull request by hand and filed an open fix PR.', claimIds: ['P2'] },
  { q: 'What would Deepak build for a startup?', a: 'Deepak could automate a content pipeline, triage customer operations, normalise partner feeds, add checked issue triage, or redesign a manual workflow.', claimIds: ['F2', 'F10', 'P1', 'U4'] },
  { q: 'What are Deepak’s weaknesses?', a: 'Deepak is building hand-coding fluency and needs more experience with evals at scale, retrieval-augmented generation and observability.', claimIds: [] },
  { q: 'Why interview Deepak?', a: 'Deepak has built AI pipelines and deployed products, and he checks model output before it ships.', claimIds: ['F2', 'F7', 'P1'] },
  { q: 'What failed experiment taught Deepak something?', a: 'Deepak learned that a green test suite can still miss a faulty result; his résumé-scorer audit found its score varied between 74 and 77 on one résumé.', claimIds: ['P5'] },
  { q: 'What should I ask him?', a: 'Ask Deepak how he chose the checks between stages in the site-building pipeline, or how he traced the hiring-agent issue.', claimIds: ['F2', 'F5', 'P2'] },
  { q: 'Did AI write all of this?', a: 'AI wrote most of the code under Deepak’s harness. Deepak writes the specs and tests and checks the result before it ships.', claimIds: ['F2', 'P1'] },
  { q: 'How did CrowdTracker grow?', a: 'CrowdTracker moved from 60–70 visits/day to 108,043 users and 163,804 views between 1 Jun and 27 Oct 2026. The migration removed a ceiling, while content also grew.', claimIds: ['F7'] },
  { q: 'Is pull request #480 merged?', a: 'No. Deepak’s fix PR #480 is open and not merged.', claimIds: ['P2'] },
  { q: 'How many users does LifeDots have?', a: 'LifeDots had 51 installs in 30 days; the number of active users is unknown.', claimIds: ['P4'] },
  { q: 'Where did Deepak study?', a: 'Deepak earned a B.E. in Computer Science from Coimbatore Institute of Technology.', claimIds: ['E1'] },
]
