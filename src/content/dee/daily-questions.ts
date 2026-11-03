// The bank Dee's daily email draws from when no visitor question is waiting. Asked in this order, skipping ids already asked.
// Each one targets something recruiters and founders ask that the record doesn't cover yet.
// Reordered 3 Nov 2026: the r/f/e questions are the gaps a 49-question test of live Dee hit most, so they go first.
export const DAILY_QUESTIONS: { id: string; q: string }[] = [
  { id: 'd01', q: 'What is a problem you solved by changing the process instead of the code?' },
  { id: 'd02', q: 'What does your first week look like when you join a new team or client?' },
  { id: 'd03', q: 'Tell me about a time a client or stakeholder disagreed with your approach. What happened?' },
  { id: 'r01', q: 'Are you open to working on-site or hybrid, for example in Bangalore, or only remote?' },
  { id: 'r02', q: 'What are you looking for in your next role that you don’t get in your current one?' },
  { id: 'f01', q: 'Would you join an early-stage startup as one of the first engineers? What would matter most to you (leave out pay)?' },
  { id: 'e01', q: 'In escalation-gate, why does the model only do two jobs (finding the root cause and judging candidates), while everything else is checked by code?' },
  { id: 'd05', q: 'How do you decide when an AI output is good enough to ship?' },
  { id: 'f02', q: 'How do you get up to speed in a domain you don’t know yet, like insurance claims or logistics?' },
  { id: 'r03', q: 'For a remote role with a US or European team, which hours can you overlap with?' },
  { id: 'd11', q: 'How do you test something that calls an LLM?' },
  { id: 'd10', q: 'What is something you learned the hard way in production?' },
  { id: 'd06', q: 'What is a technical decision you would reverse today, and why?' },
  { id: 'd08', q: 'What do you do when a requirement is unclear?' },
  { id: 'd09', q: 'What kind of team do you do your best work in?' },
  { id: 'd07', q: 'How do you explain a technical trade-off to someone non-technical?' },
  { id: 'd04', q: 'Which piece of feedback changed how you work?' },
  { id: 'd12', q: 'What would you want to learn in your next role?' },
  { id: 'd13', q: 'What is a project you started and stopped, and why did you stop?' },
  { id: 'd14', q: 'How do you keep a solo project from rotting while you work on others?' },
  { id: 'd15', q: 'What does a good day of work look like for you?' },
]
