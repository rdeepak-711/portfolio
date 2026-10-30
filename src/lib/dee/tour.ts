import type { TourStop } from '@/content/dee/types'

export const TOUR_STOPS: TourStop[] = [
  { id: 'intro', sectionId: 'top', pose: 'explain', lines: ['Deepak turns slow manual work into checked AI pipelines.'], claimIds: ['F2'] },
  { id: 'factory', sectionId: 'project-factory', pose: 'check', lines: ['Deepak’s site-building pipeline produced 70+ sites.'], claimIds: ['F2'] },
  { id: 'crowdtracker', sectionId: 'project-crowdtracker', pose: 'check', lines: ['CrowdTracker moved from 60–70 visits/day to 108,043 users and 163,804 views.'], claimIds: ['F7'] },
  { id: 'gate', sectionId: 'project-gate', pose: 'check', lines: ['Deepak’s checker shortlisted 192 open PRs to 25 and verified citations.'], claimIds: ['P1'] },
  { id: 'working', sectionId: 'how-i-work', pose: 'explain', lines: ['Deepak writes specs and tests; AI writes most code, then he checks it.', 'He is revising Python by hand.'], claimIds: ['F2', 'P1'] },
  { id: 'contact', sectionId: 'contact', pose: 'explain', lines: ['Want to ask Deepak something directly?'], claimIds: [] },
]
