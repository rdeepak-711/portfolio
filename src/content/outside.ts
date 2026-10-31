export type OutsideWork = {
  repo: string
  title: string
  plain: string
  status: 'open' | 'merged' | 'comment'
  date: string
  links: { label: string; href: string }[]
}

export const OUTSIDE_WORK: ReadonlyArray<OutsideWork> = [
  {
    repo: 'interviewstreet/hiring-agent',
    title: 'hiring-agent: contributor counts looked up under the wrong owner',
    plain: 'HackerRank’s résumé-scoring agent counted team and open-source repos as solo projects with 0 commits. I traced it to one line, filed issue #479 with a reproduction, and opened a 2-line fix in PR #480. It isn’t merged yet.',
    status: 'open',
    date: '2026-10-11',
    links: [
      { label: 'Issue #479', href: 'https://github.com/interviewstreet/hiring-agent/issues/479' },
      { label: 'PR #480', href: 'https://github.com/interviewstreet/hiring-agent/pull/480' },
    ],
  },
  {
    repo: 'crewAIInc/crewAI',
    title: 'crewAI #6072: ran all 8 open PRs against a bug test',
    plain: 'Eight open pull requests claimed this issue. I merged each one onto main in its own Docker container with no network, ran it against a bug test that fails on main, and posted which ones actually pass.',
    status: 'comment',
    date: '2026-10-26',
    links: [
      { label: 'My comment', href: 'https://github.com/crewAIInc/crewAI/issues/6072#issuecomment-6423394143' },
    ],
  },
]
