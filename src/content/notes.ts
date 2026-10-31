/**
 * Short written notes — the readable version of a video.
 *
 * These exist for two reasons the videos can't serve: search engines index
 * these pages (they index YouTube's page, not ours), and a pinned comment
 * needs somewhere to point. Keep them short and specific; a note that just
 * restates the video adds nothing.
 */

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'h'; text: string }
  | { kind: 'code'; lang: string; code: string }
  | { kind: 'list'; items: string[] }
  | { kind: 'link'; label: string; href: string }

export type NoteLane = 'outbuiltit' | 'travel-measured' | 'code-review' | 'hackathons' | 'videos' | 'job-hunt' | 'claude-code' | 'leetcode'

/** the spaces I write about, in the order /writing shows them; a lane with no notes is hidden */
export const NOTE_LANES: ReadonlyArray<{ id: NoteLane; label: string }> = [
  { id: 'outbuiltit', label: 'Outbuiltit' },
  { id: 'travel-measured', label: 'Travel Measured' },
  { id: 'code-review', label: 'Code review' },
  { id: 'hackathons', label: 'Hackathons' },
  { id: 'videos', label: 'Making the videos' },
  { id: 'job-hunt', label: 'Job hunt' },
  { id: 'claude-code', label: 'Claude Code' },
  { id: 'leetcode', label: 'LeetCode' },
]

/**
 * Notes taken down on 31 Oct 2026: textbook LeetCode tricks with no mistake of
 * my own in them. next.config.ts redirects each one to /writing so old links
 * don't 404.
 */
export const RETIRED_NOTE_SLUGS: ReadonlyArray<string> = [
  'best-time-buy-sell-no-minimum',
  'two-sum-ii-sorted-deletes-the-hashmap',
  'valid-palindrome-skip-dont-clean',
  'valid-sudoku-one-loop-two-checks',
  'group-anagrams-stop-sorting',
  '3sum-two-sum-sorted',
  'top-k-frequent-min-heap',
  'product-except-self-prefix-suffix',
  'contains-duplicate-set-trick',
]

export type Note = {
  slug: string
  lane: NoteLane
  title: string
  /** one-line standfirst — also the meta description */
  dek: string
  date: string
  /** slug of the video this explains, if any */
  video?: string
  body: Block[]
}

export const NOTES: ReadonlyArray<Note> = [
  {
    slug: 'lifedots-stops-after-60-seconds',
    lane: 'outbuiltit',
    title: 'Why LifeDots stops counting after 60 seconds',
    dek: 'Working a hard problem out on paper counts as zero. That’s on purpose — and someone on X showed me a better answer than the one I had.',
    date: '2026-10-31',
    body: [
      {
        kind: 'p',
        text: 'LifeDots is a Chrome extension that counts real minutes on the sites you pick for one habit — LeetCode, say — and fills today’s dot when you reach your target. “Real minutes” is the whole promise, so the hard question is when to stop counting.',
      },
      { kind: 'h', text: 'Three ways the clock stops' },
      {
        kind: 'list',
        items: [
          'The Chrome window loses focus.',
          'The tab in front isn’t one of your sites.',
          'Nobody touches the keyboard or mouse for 60 seconds. Chrome reports the machine as idle or locked, and both mean nobody’s there.',
        ],
      },
      {
        kind: 'code',
        lang: 'ts',
        code: '// no keyboard or mouse this long: stop\nexport const IDLE_SECONDS = 60\n\nchrome.idle.setDetectionInterval(\n  IDLE_SECONDS,\n)',
      },
      {
        kind: 'p',
        text: 'The 60 seconds before Chrome flags you idle still count. The rule is strict, not punitive.',
      },
      { kind: 'h', text: 'The two errors aren’t equal' },
      {
        kind: 'p',
        text: 'There’s a second guard. The extension wakes every minute to bank the time in progress, but Chrome throttles background alarms, so a gap can stretch. Any gap longer than 5 minutes is capped, and the excess is thrown away.',
      },
      {
        kind: 'p',
        text: 'That cap is generous on purpose. Before building, I read about 4,000 reviews of habit and time-tracking apps, and the failure that made people angriest was “it reset although I did the habit”. Crediting five minutes of a sleeping laptop, once, is invisible. Throwing away a minute someone really worked is how you lose them. So the cap leans toward the user, and idle detection does the real work.',
      },
      { kind: 'h', text: 'Then someone on X found the hole' },
      {
        kind: 'p',
        text: 'On 16 Oct someone pointed out that when you work a hard problem out on paper, or just sit and think, LifeDots counts zero. They’re right. For DSA practice that thinking is often the most valuable part.',
      },
      {
        kind: 'p',
        text: 'My first fix was a setting: an idle window of 1, 3 or 5 minutes, capped at 5 to match the gap cap. The cost is that a longer window also counts the time you walk away to make tea, and the dot stops meaning real minutes.',
      },
      {
        kind: 'p',
        text: 'Their answer was better: keep the strict 1-minute default and show thinking time as its own number. Focused minutes fill the dot. Thinking minutes sit next to them but don’t count toward the target. Nobody has to wonder which number they’re looking at.',
      },
      { kind: 'h', text: 'Why it isn’t built yet' },
      {
        kind: 'p',
        text: 'One comment isn’t enough reason to build a feature, and the default is what almost everyone gets. LifeDots had 51 installs between 30 Sep and 29 Oct. I’ll build the split when people who use it every day ask for it. The design is written down and ready.',
      },
      { kind: 'link', label: 'Try LifeDots', href: 'https://lifedots.outbuiltit.com' },
    ],
  },
  {
    slug: 'site-said-every-30-minutes',
    lane: 'travel-measured',
    title: 'My site said every 30 minutes. It recorded about every 5 hours.',
    dek: 'Travel Measured’s whole pitch is “measured, not guessed”. The one number I never measured was my own recorder’s schedule.',
    date: '2026-10-31',
    body: [
      {
        kind: 'p',
        text: 'Travel Measured is a crowd calendar for theme parks. It records the posted wait time of the rides, turns those readings into a crowd level for each day, and labels every day as measured or estimated. The labels are the point: if a day says measured, it was.',
      },
      {
        kind: 'p',
        text: 'Every park page also said the waits were recorded every 30 minutes. It was in 11 page titles, the about page, the method page and the share image. It wasn’t true.',
      },
      { kind: 'h', text: 'What the schedule said, and what ran' },
      {
        kind: 'p',
        text: 'The recorder is a GitHub Actions workflow. Each run fetches posted waits from Queue-Times’ public JSON API, six parks at a time, and writes them to Postgres. The schedule asks for a run every 30 minutes:',
      },
      { kind: 'code', lang: 'yaml', code: 'on:\n  schedule:\n    - cron: "*/30 * * * *"' },
      {
        kind: 'p',
        text: 'GitHub treats that line as a request, not a promise. Scheduled runs can start late, or not at all, when GitHub is busy. Between 12 and 15 Oct the workflow ran 15 times in about 69 hours — one run every 4.9 hours on average, against the 138 the schedule asked for. Over 18 days it ran 99 times: 3 to 7 runs a day instead of 48.',
      },
      { kind: 'h', text: 'I wrote the risk down and never checked it' },
      {
        kind: 'p',
        text: 'The worst part is that I knew. My decisions log for 12 Oct, the day I chose GitHub Actions, says: “GitHub’s schedule is not exact and can run late or skip under load.” I wrote the cost down, then put “every 30 minutes” on every page anyway, and never compared the two.',
      },
      {
        kind: 'p',
        text: 'It surfaced on 15 Oct, in a sceptical review of my own projects that I ran with Claude Code before interviews. The review read the workflow’s run history next to the page titles, and the two didn’t match.',
      },
      { kind: 'h', text: 'Why it mattered more on this site' },
      {
        kind: 'p',
        text: 'A measured day built from 3 to 5 readings stands on much less than one built from 48. The label was right about where the number came from; the copy overstated how much data stood behind it. On a site that sells itself on being honest about its data, that was the worst claim to get wrong.',
      },
      { kind: 'h', text: 'The fix, in three parts' },
      {
        kind: 'list',
        items: [
          'Stop claiming a cadence. On 30 Oct I took “every 30 minutes” off every page that said it. No page states a fixed schedule now.',
          'Show the real one. The method page reads the last 24 hours of runs from the database and says how many there were. Today it says: “Recorded 5 times in the last 24 hours.”',
          'Trigger it from outside GitHub. A cron-job.org job will call the workflow’s dispatch API every 30 minutes. That part isn’t switched on yet. When it is, the method page will show it, because the number comes from the runs, not from me.',
        ],
      },
      { kind: 'h', text: 'What I do differently now' },
      {
        kind: 'p',
        text: 'Any number a page states about the system itself — how often it runs, how many things it covers, how fresh the data is — comes from the system’s own records, not from the copy. If I can’t compute it, I don’t state it.',
      },
      { kind: 'link', label: 'See the count on the live method page', href: 'https://travelmeasured.vercel.app/method' },
    ],
  },
  {
    slug: 'escalation-gate',
    lane: 'outbuiltit',
    title: 'escalation-gate: from a GitHub issue to a checked root cause and the PR that fixes it',
    dek: 'A model cites the code, a checker verifies every citation, and SQL cuts 192 open PRs to 25. It also caught a mistake in my own review.',
    date: '2026-10-11',
    body: [
      {
        kind: 'p',
        text: 'HackerRank’s hiring-agent scores résumés with an LLM. Issue #424 says the GitHub enrichment step works out each repo’s project type and contributor counts, and none of it reaches the evaluator. The repo had 192 open pull requests, and several of them touch this path. Which one actually fixes this bug?',
      },
      {
        kind: 'p',
        text: 'Answering that by hand took me about 1.5 hours: trace the cause through four files, then check every open PR against it. escalation-gate does it in one command for $0.41, and it hands an engineer one page they can act on in five minutes.',
      },
      { kind: 'h', text: 'Six stages, one command' },
      {
        kind: 'code',
        lang: 'bash',
        code: 'uv run python -m gate.cli --repo interviewstreet/hiring-agent --issue 424',
      },
      {
        kind: 'list',
        items: [
          'Collect — open issues, open PRs and every PR’s diff, from the GitHub CLI into Postgres.',
          'Investigate — Claude Code, headless and read-only (Read, Grep, Glob), finds the cause and cites each claim as file:line:quote, plus the chain from cause to symptom.',
          'Check — every citation is matched against the source. A miss gets one retry in the same session with the exact failures; a second miss goes to a human.',
          'Shortlist — SQL over diff hunks keeps only the PRs that change a cited line or mention the issue. No model, no cost.',
          'Judge — one model call with no tools reads the shortlisted diffs and labels each fixes, partly or no, with one reason.',
          'Packet — citations re-checked, git merge-tree per candidate PR, one HTML page.',
        ],
      },
      { kind: 'h', text: 'Check the citations, label the reasoning' },
      {
        kind: 'p',
        text: 'I treat model output as untrusted by default. A citation is cheap to verify: open the file, go to the line, look for the quote within five lines either side, whitespace ignored. So every citation is verified, mechanically. The explanation that links the citations is not. The packet says which is which, line by line.',
      },
      {
        kind: 'p',
        text: 'Merges are the same. "This PR merges clean" is a dry-run git merge-tree against the pinned commit, not an opinion. "This PR fixes the bug" is judged from the diff and labelled that way, because nothing was run.',
      },
      { kind: 'h', text: 'The shortlist needs no AI' },
      {
        kind: 'p',
        text: 'A diff hunk header like @@ -240,10 says "this change replaces lines 240–249". If a cited line falls inside that range, the PR touches the bug. The cited lines are already verified, so the filter adds no new guess. On #424 it cut 192 open PRs to 25, and the three that matter were all still in.',
      },
      { kind: 'h', text: 'It caught a mistake in my own review' },
      {
        kind: 'p',
        text: 'I wrote the #424 packet by hand first, as the target the tool had to match. My review said #415 only partly fixes the bug. The tool said it fixes it fully. I opened the diff: #415 adds resolve_selected_projects, which rebuilds every selected project from the fetched data. The tool was right. It also found #242, a partial fix I had missed.',
      },
      { kind: 'h', text: 'And where it was wrong' },
      {
        kind: 'p',
        text: 'On a second bug, the investigation said GitHub’s /users/{user}/repos?type=all never returns repos owned by an org or another user. That is a claim about GitHub, not about the code, so the checker can’t verify it, and the packet flags it as model reasoning. I tested it against the live API: false. Those repos do come back. The real bug was one line: github.py looks up contributors with the candidate’s username as the repo owner. On a well-known public profile that mislabels 25 of 99 repos as solo projects with zero commits. Fixing it is a two-line change — I filed it upstream as issue #479 with the fix in PR #480.',
      },
      {
        kind: 'p',
        text: 'That is the point of labelling. A tool that hides the difference between checked and guessed is worse than no tool.',
      },
      { kind: 'h', text: 'Numbers' },
      {
        kind: 'list',
        items: [
          '#424: 6/6 citations verified · 192 → 25 PRs shortlisted · #425 recommended, merges clean · $0.11 to investigate + $0.30 to judge, on Sonnet.',
          'Python, Postgres, the GitHub CLI and Claude Code headless (--json-schema, --session-id, stream-json logs). The pytest suite never calls the model. Since this write-up it also runs as an MCP server, so an agent like Claude Code can sweep a repo’s top issues in the background.',
          'Limits: tested end to end on two unrelated repos so far (hiring-agent and spark-stratifier), and runs vary. Next is V2 — apply the recommended PR to a throwaway copy, rerun the reproduction, and put the measured result in the packet.',
        ],
      },
      {
        kind: 'p',
        text: 'Code: github.com/rdeepak-711/escalation-gate. Live boards, packets and two short videos: gate.outbuiltit.com. Upstream fix: github.com/interviewstreet/hiring-agent/pull/480.',
      },
    ],
  },
  {
    slug: 'longest-repeating-maxfreq-never-drops',
    lane: 'leetcode',
    title: 'Longest Repeating Character Replacement: maxFreq never goes down',
    dek: 'The window shrinks and maxFreq stays high — so it is genuinely wrong about the current window. The answer is still correct, and one bound is why.',
    date: '2026-07-31',
    body: [
      {
        kind: 'p',
        text: 'This is the question people actually ask about this problem, and most write-ups wave at it. When the window shrinks, why don’t you decrease maxFreq?',
      },
      {
        kind: 'p',
        text: 'In my solution I don’t. maxFreq = max(maxFreq, freq[s[r]]) only ever raises it, and there is no line anywhere that lowers it. So maxFreq can be larger than the real maximum frequency inside the current window. That is not a hypothetical — it happens on LeetCode’s own second example.',
      },
      { kind: 'h', text: 'It really does go stale' },
      {
        kind: 'p',
        text: 'Take "AABABBA" with k = 1. Watch the fourth step onwards, and track what maxFreq claims against what the window actually holds.',
      },
      {
        kind: 'list',
        items: [
          'r = 0, window "A" — maxFreq 1, true max 1, ans 1',
          'r = 1, window "AA" — maxFreq 2, true max 2, ans 2',
          'r = 2, window "AAB" — maxFreq 2, true max 2, ans 3',
          'r = 3, window "AABA" — maxFreq 3, true max 3, ans 4',
          'r = 4, shrink to "ABAB" — maxFreq still 3, true max is 2. Stale.',
          'r = 5, shrink to "BABB" — maxFreq 3, true max 3 again by coincidence',
          'r = 6, shrink to "ABBA" — maxFreq 3, true max 2. Stale again.',
        ],
      },
      {
        kind: 'p',
        text: 'At r = 4 the window is four characters wide and contains two A’s and two B’s. maxFreq says 3. It is describing a window that no longer exists — the one that had three A’s in it, before the left pointer moved.',
      },
      { kind: 'h', text: 'Why the answer survives it' },
      {
        kind: 'p',
        text: 'The whole argument is one bound. ans is only ever assigned windowSize, and the window is only permitted to stay that size while windowSize − maxFreq ≤ k. Rearranged, that says ans ≤ maxFreq + k, at every moment, unconditionally.',
      },
      {
        kind: 'p',
        text: 'Now ask what maxFreq is. It is a count that was genuinely observed somewhere in the string — some window really did contain that many of one character. And a window containing m copies of a character, plus k replacements, is a real achievable answer of m + k. So the value ans is bounded by is always something reachable. A stale-high maxFreq can let the window sit wider than it strictly should for a step or two, but it can never push ans above a number the string can actually produce.',
      },
      {
        kind: 'p',
        text: 'On this input maxFreq peaks at 3, k is 1, and the answer is 4. That is not a coincidence — it is the bound being tight.',
      },
      { kind: 'h', text: 'What if you did decrement it?' },
      {
        kind: 'p',
        text: 'It would still be correct. You would recompute the maximum over the frequency map every time the window shrank, which is O(26) work per shrink and more code to get wrong. You would get the same answer, more slowly. The stale value is not a shortcut that happens to work — it is a consequence of only ever needing an upper bound.',
      },
      { kind: 'h', text: 'The solution' },
      {
        kind: 'code',
        lang: 'python',
        code: `class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        l = 0
        r = 0
        freq = {}
        maxFreq = 0
        ans = 0
        while(r<len(s)):
            freq[s[r]] = freq.get(s[r],0)+1
            maxFreq = max(maxFreq, freq[s[r]])
            windowSize = r - l + 1
            while(windowSize - maxFreq > k):
                freq[s[l]] -= 1
                l += 1
                windowSize = r - l + 1
            ans = max(ans, windowSize)
            r += 1
        return ans`,
      },
      { kind: 'h', text: 'Cost' },
      {
        kind: 'list',
        items: [
          'Time: O(n) — every character enters the window once and leaves at most once',
          'Space: O(26) — the frequency map is bounded by the alphabet, not the input',
          'Brute force, by comparison: O(n²) to check every substring',
        ],
      },
      {
        kind: 'p',
        text: 'If a value in your loop only ever needs to be an upper bound, it does not have to be accurate. Knowing which of your variables are bounds and which are facts is most of what makes sliding-window code short.',
      },
    ],
  },
  {
    slug: 'caveman-shorter-not-cheaper',
    lane: 'claude-code',
    title: 'A skill that shortens Claude’s answers — and the claim I could not prove',
    dek: 'The obvious pitch is that shorter replies save you tokens. I measured it, and that part did not hold.',
    date: '2026-07-17',
    video: 'caveman',
    body: [
      {
        kind: 'p',
        text: 'Claude’s default answers are prose-heavy. Ask a narrow question and you often get several paragraphs where two sentences would do. /caveman is a small Claude Code skill that compresses that prose — same technical content, far fewer words, and funnier than it has any right to be.',
      },
      { kind: 'h', text: 'What it actually touches' },
      {
        kind: 'p',
        text: 'It rewrites the model’s prose. It does not touch code blocks — those come back intact, which is the whole reason it is usable while you work. There are intensity levels; the middle setting is the one worth using, because the most aggressive setting starts costing clarity for laughs.',
      },
      { kind: 'h', text: 'The claim I expected to make' },
      {
        kind: 'p',
        text: 'The natural pitch writes itself: shorter answers mean fewer output tokens, fewer tokens mean a smaller bill. I set out to measure that so the number would be real rather than asserted.',
      },
      { kind: 'h', text: 'Why it did not survive measurement' },
      {
        kind: 'p',
        text: 'It failed, and the reason is structural. In a real session the dominant cost is not the model’s replies — it is everything you send in. Files, prior turns, tool output, the accumulated context. Compressing the answers trims the smaller side of the ledger while the larger side is unchanged. The saving existed but was lost in the noise of base overhead.',
      },
      {
        kind: 'list',
        items: [
          'True: the answers get materially shorter',
          'True: code blocks are left alone',
          'Not demonstrated: a meaningful reduction in total session tokens',
        ],
      },
      { kind: 'h', text: 'What I published instead' },
      {
        kind: 'p',
        text: 'The honest version: this makes answers shorter. It is not a cost-saving tool. That is a weaker headline and a claim that survives someone checking it — which matters more, because the moment a developer measures your number and finds it wrong, nothing else you say gets the benefit of the doubt.',
      },
    ],
  },
  {
    slug: 'two-sum-ordering',
    lane: 'leetcode',
    title: 'Two Sum: the two lines everyone gets backwards',
    dek: 'The hash map is the easy part. The order of the check and the store is what decides whether it is correct.',
    date: '2026-07-20',
    video: 'two-sum-ordering',
    body: [
      {
        kind: 'p',
        text: 'Two Sum is the first problem almost everyone solves, and the hash-map solution is repeated everywhere. What gets repeated far less often is why two specific lines have to be in a specific order — and what breaks when they are not.',
      },
      { kind: 'h', text: 'The brute force, and why it is abandoned' },
      {
        kind: 'p',
        text: 'Check every pair, return the two indices that sum to the target. Correct, and quadratic — for every element you rescan the rest of the array. On a large input that is the whole cost of the solution.',
      },
      { kind: 'h', text: 'One pass instead of two loops' },
      {
        kind: 'p',
        text: 'Walk the array once. At each number, work out what you still need to reach the target, and ask whether you have already seen it. If you have, you are done. If not, record the current number against its index and move on.',
      },
      {
        kind: 'code',
        lang: 'python',
        code: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        mapping = {}
        for i in range(len(nums)):
            need = target-nums[i]
            if need in mapping:
                return [i, mapping[need]]
            mapping[nums[i]]=i`,
      },
      { kind: 'h', text: 'The trap' },
      {
        kind: 'p',
        text: 'Swap the last two lines — store first, then check — and the solution still passes plenty of tests. It breaks when the target is exactly twice a number in the array.',
      },
      {
        kind: 'p',
        text: 'Take nums = [3, 4] with target = 6. Store the 3 at index 0. Now compute what you need: 6 − 3 = 3. Look it up, and the map already contains the 3 you just wrote. A single element matches itself, and you return [0, 0].',
      },
      {
        kind: 'p',
        text: 'Checking before storing means the map only ever contains elements strictly to the left of the current one, so a match is always a genuinely different index. The correctness argument is the ordering, not the data structure.',
      },
      { kind: 'h', text: 'Cost' },
      {
        kind: 'list',
        items: [
          'Time: O(n) — one pass, constant-time lookups',
          'Space: O(n) — the map holds at most every element',
        ],
      },
    ],
  },
  {
    slug: 'valid-anagram-immutable-lower',
    lane: 'leetcode',
    title: 'Valid Anagram: the two lines that did nothing',
    dek: 'I wrote s.lower() and t.lower(), and they changed nothing — Python strings are immutable, so the result is thrown away unless you assign it. The solution passed anyway, for the wrong reason.',
    date: '2026-07-22',
    body: [
      {
        kind: 'p',
        text: 'Valid Anagram asks whether two strings are rearrangements of the same letters. My solution was right about the hard part and wrong about two lines I barely thought about — and it passed regardless, which is the part worth talking about.',
      },
      { kind: 'h', text: 'The two lines that do nothing' },
      {
        kind: 'p',
        text: 'I called s.lower() and t.lower() on their own lines to normalise the case. In Python that does nothing. Strings are immutable, so .lower() cannot change the string in place — it returns a new, lowercased string and leaves the original untouched. Call it without assigning the result and the new string is created and immediately discarded. The variable s is exactly what it was.',
      },
      { kind: 'h', text: 'Why it passed anyway' },
      {
        kind: 'p',
        text: 'The counting below assumes lowercase — it maps each letter to a slot from 0 to 25 by subtracting the code point of a lowercase a. That only works if every character is already a lowercase letter. LeetCode’s inputs happen to be lowercase, so the no-op never mattered and the tests went green. Passing and being correct are not the same claim — feed it an uppercase letter and the index goes negative.',
      },
      { kind: 'h', text: 'The part that actually works' },
      {
        kind: 'p',
        text: 'No sorting, no second dictionary — one array of 26 counts. Walk both strings together: for each position add one for the letter in s and subtract one for the letter in t. If the two are anagrams, every +1 is met by a matching −1 and the whole array cancels back to zero. So the answer is simply whether all 26 counts are still zero.',
      },
      {
        kind: 'code',
        lang: 'python',
        code: `class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        if len(s)!=len(t):
            return False
        s=s.lower()
        t=t.lower()
        temp = [0]*26
        for i in range(len(s)):
            temp[ord(s[i])-ord('a')]+=1
            temp[ord(t[i])-ord('a')]-=1
        return temp.count(0)==26`,
      },
      { kind: 'h', text: 'The fix is one character' },
      {
        kind: 'p',
        text: 'Assign the lowercased string back: s = s.lower(). Now the normalisation is real instead of decorative, and the solution is correct for the reason it looked correct — not by accident of the input.',
      },
      { kind: 'h', text: 'Cost' },
      {
        kind: 'list',
        items: [
          'Sorting both strings and comparing: O(n log n)',
          'This: O(n) — one pass, adding and subtracting as it goes',
          'Space: O(1) — the count array is 26 slots no matter how long the strings are',
        ],
      },
    ],
  },
  {
    slug: 'longest-consecutive-why-my-dp-failed',
    lane: 'leetcode',
    title: 'Longest Consecutive: why my clever solution gave 6 instead of 7',
    dek: 'I tried to score every number from its neighbours. It broke — and the reason is a good one: stale values, and information that only flows the way you iterate.',
    date: '2026-07-26',
    body: [
      {
        kind: 'p',
        text: 'Longest Consecutive Sequence asks for the length of the longest run of consecutive integers, in any order — for [100, 4, 200, 1, 3, 2] the run is 1, 2, 3, 4, so the answer is 4. I tried a solution that felt like dynamic programming, and it returned 6 where the answer was 7. The bug is worth more than the fix.',
      },
      { kind: 'h', text: 'The idea that breaks' },
      {
        kind: 'p',
        text: 'For each number, look at its left neighbour’s length and its right neighbour’s length, and combine them into a length for this number. Store every number’s length in a dictionary. It feels reasonable, and it is wrong in two independent ways.',
      },
      { kind: 'h', text: 'Bug one: stale values' },
      {
        kind: 'p',
        text: 'The numbers get processed in some order. When 0 is computed, -1 hasn’t been computed yet, so 0 reads a default and freezes at 3. Later, -1 is computed and grows to 5 — but nothing goes back to update 0. Information only flows in the direction you iterate; once a value is written, later discoveries never reach it. So the chain -4, -3, -2, -1, 0, 1, 2 — which should all be part of one run of 7 — ends up holding a patchwork of stale numbers, and the max comes out as 6.',
      },
      { kind: 'h', text: 'Bug two: double counting' },
      {
        kind: 'p',
        text: 'Even with fresh values, adding the left length and the right length counts the current number’s own run from both sides — the two halves overlap, so the sum overshoots. The recurrence itself is unsound; no traversal order fixes it.',
      },
      { kind: 'h', text: 'The fix: don’t score every number' },
      {
        kind: 'p',
        text: 'Stop storing a length per number. Only start counting from a sequence’s beginning — a number whose predecessor is absent (i - 1 not in the set) — and walk forward while the next number exists. A number in the middle of a run is never a starting point, so it’s only ever walked through once.',
      },
      {
        kind: 'code',
        lang: 'python',
        code: `class Solution:
    def longestConsecutive(self, nums: List[int]) -> int:
        temp = set(nums)
        ans = 0
        for i in temp:
            if i - 1 not in temp:
                length = 1
                while i + length in temp:
                    length += 1
                ans = max(ans, length)
        return ans`,
      },
      { kind: 'h', text: 'Why the nested loop is still O(n)' },
      {
        kind: 'p',
        text: 'It looks quadratic — a while loop inside a for loop — but the inner walk only runs for sequence starts, and each element is walked through by exactly one start. Across the whole run, the total number of inner steps is at most n. So it is O(n) time and O(n) space, versus O(n log n) if you sort first.',
      },
      {
        kind: 'p',
        text: 'The lesson that stuck: a per-element recurrence is only safe if the values it reads are final. When they aren’t — and can’t be, because the data has no order — the fix isn’t a better traversal, it’s a formulation that never needs to revise a value at all.',
      },
    ],
  },
]

export function noteBySlug(slug: string): Note | undefined {
  return NOTES.find((n) => n.slug === slug)
}

export function noteForVideo(videoSlug: string): Note | undefined {
  return NOTES.find((n) => n.video === videoSlug)
}
