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

export type Note = {
  slug: string
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
    slug: 'escalation-gate',
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
    slug: 'best-time-buy-sell-no-minimum',
    title: 'Best Time to Buy and Sell Stock: I never track the minimum price',
    dek: 'Most solutions keep a minPrice variable. This one keeps two pointers — and the buy pointer teleports.',
    date: '2026-07-31',
    body: [
      {
        kind: 'p',
        text: 'The standard solution to this problem keeps a running minimum. Walk the array, remember the cheapest price seen so far, and at each step check today’s price against it. That is correct and it is O(n). My version doesn’t have that variable at all — there is no minPrice, and no call to min().',
      },
      {
        kind: 'p',
        text: 'It keeps two pointers instead. b is the buy day, s is the sell day. Sell walks right and subtracts, and there are exactly two outcomes.',
      },
      { kind: 'h', text: 'The only line that matters' },
      {
        kind: 'code',
        lang: 'python',
        code: `if(a<0):
    b = s
else:
    ans = max(ans, prices[s]-prices[b])`,
      },
      {
        kind: 'p',
        text: 'If the profit is negative, b = s. Buy doesn’t step forward one day — it teleports all the way to wherever sell currently is. That single line is doing the job the minPrice variable does in every other version.',
      },
      { kind: 'h', text: 'Why the jump is safe' },
      {
        kind: 'p',
        text: 'The claim is that b always holds the cheapest price in everything seen so far. It holds by induction. At the start b is index 0, trivially the cheapest of the first one. Then sell visits every index in order, one at a time — so if a price ever comes in below the current buy price, buy moves onto it immediately, on that same iteration. There is no way to pass a new minimum without landing on it.',
      },
      {
        kind: 'p',
        text: 'That is also why skipping days costs nothing. Every day strictly between the old b and the new one was priced higher than the old b — otherwise buy would already have jumped there when sell passed it. A day dearer than a day you can still buy is worthless as a purchase, forever. So the jump discards them permanently, not provisionally.',
      },
      { kind: 'h', text: 'LeetCode’s own example hides this' },
      {
        kind: 'p',
        text: 'On the given [7, 1, 5, 3, 6, 4], buy jumps from index 0 to index 1 — a single step. The set of skipped days is empty, so you can watch the whole thing run and never see the behaviour that makes it work. Use [7, 8, 9, 1, 5, 3, 6, 4] instead: buy jumps 0 to 3, straight past 8 and 9, both dearer than the 7 it was sitting on. Same answer, 5.',
      },
      {
        kind: 'list',
        items: [
          '8 − 7 = 1 — profit, ans = 1',
          '9 − 7 = 2 — profit, ans = 2',
          '1 − 7 = −6 — negative, so buy jumps from index 0 to index 3, skipping 8 and 9',
          '5 − 1 = 4 — profit, ans = 4',
          '3 − 1 = 2 — no improvement, ans stays 4',
          '6 − 1 = 5 — profit, ans = 5',
          '4 − 1 = 3 — no improvement, ans stays 5',
        ],
      },
      {
        kind: 'p',
        text: 'Buy lands on index 3 and never moves again — it found the cheapest day in the array and there was nothing left to beat it. Sell walks the remaining four days on its own.',
      },
      { kind: 'h', text: 'The solution' },
      {
        kind: 'code',
        lang: 'python',
        code: `class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        b = 0
        s = 1
        ans = 0
        while(s<len(prices)):
            a = prices[s]-prices[b]
            if(a<0):
                b = s
            else:
                ans = max(ans, prices[s]-prices[b])
            s += 1
        return ans`,
      },
      { kind: 'h', text: 'Two honest notes on this code' },
      {
        kind: 'p',
        text: 'The subtraction happens twice — once into a, then again inside the max(). It costs nothing measurable and I have left it as submitted rather than tidying it after the fact.',
      },
      {
        kind: 'p',
        text: 'And s starts at 1, not 0. On a single-price array the loop never runs and it returns 0, which is the right answer — you cannot sell after buying if there is no day after. Worth checking rather than assuming, because an off-by-one here fails silently on exactly one input.',
      },
      { kind: 'h', text: 'Cost' },
      {
        kind: 'list',
        items: [
          'Time: O(n) — sell visits each day once and never goes back',
          'Space: O(1) — two integers, and no minimum stored anywhere',
          'Brute force, by comparison: O(n²) for every buy/sell pair',
        ],
      },
      {
        kind: 'p',
        text: 'The wider point is that a pointer can be a variable. Once you notice that b is the running minimum, you stop needing something to hold it.',
      },
    ],
  },
  {
    slug: 'longest-repeating-maxfreq-never-drops',
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
    slug: 'two-sum-ii-sorted-deletes-the-hashmap',
    title: 'Two Sum II: one word in the title deletes the hash map',
    dek: 'Two Sum needs a dictionary. Two Sum II gives you "sorted" — and that one word replaces it with two integers.',
    date: '2026-07-29',
    body: [
      {
        kind: 'p',
        text: 'Two Sum and Two Sum II ask for the same thing: find the pair that adds to the target. The first one needs a hash map — you walk the array once, and for each number you ask whether you have already seen its complement. That is O(n) time, but it is also O(n) space, because you are storing everything you have seen.',
      },
      {
        kind: 'p',
        text: 'Two Sum II changes exactly one thing in the title: the array is sorted. That word deletes the map.',
      },
      { kind: 'h', text: 'Start wide, not narrow' },
      {
        kind: 'p',
        text: 'Put one pointer at each end and add them. Because the array is sorted, that first sum is the largest one you can make from the smallest element and the largest one you can make from the largest element — which means every comparison you make tells you something structural, not incidental.',
      },
      {
        kind: 'list',
        items: [
          'Sum is too small — the left number is the problem, because the right one is already the biggest available. Move left inward.',
          'Sum is too big — the right number is the problem, for the mirror reason. Move right inward.',
          'Sum equals the target — done.',
        ],
      },
      { kind: 'h', text: 'Why the move is a proof, not a guess' },
      {
        kind: 'p',
        text: 'This is the part worth internalising, and it is the part a brute-force mental model misses. When the sum is too big and you move the right pointer in, you are not just trying the next thing. You are discarding that element permanently — and you are allowed to, because it is the largest remaining value. If it was too big paired with the smallest remaining value, it is too big paired with every other remaining value too.',
      },
      {
        kind: 'p',
        text: 'So one pointer move does not eliminate one candidate pair. It eliminates every pair that element belonged to, in a single step. That is why the whole thing runs in one pass instead of n².',
      },
      { kind: 'h', text: 'The trace' },
      {
        kind: 'p',
        text: 'On [1, 3, 4, 5, 7, 11] with target 9, the pointers move five times and land on 4 + 5. Note that both rules fire — this is worth checking on your own examples, because on LeetCode’s own [2, 7, 11, 15] the left pointer never moves at all, and you can convince yourself you understand the algorithm while only ever having watched half of it run.',
      },
      {
        kind: 'list',
        items: [
          '1 + 11 = 12, too big — move right in',
          '1 + 7 = 8, too small — move left in',
          '3 + 7 = 10, too big — move right in',
          '3 + 5 = 8, too small — move left in',
          '4 + 5 = 9 — found',
        ],
      },
      { kind: 'h', text: 'The solution' },
      {
        kind: 'code',
        lang: 'python',
        code: `class Solution:
    def twoSum(self, numbers: List[int], target: int) -> List[int]:
        l = 0
        r = len(numbers)-1
        while(l<r):
            x = numbers[l]+numbers[r]
            if x == target:
                return [l+1, r+1]
            elif x < target:
                l+=1
            else:
                r-=1`,
      },
      { kind: 'h', text: 'The trap: this one is 1-indexed' },
      {
        kind: 'p',
        text: 'Two Sum II returns positions, not indices — the problem statement says the array is 1-indexed. So the answer is [l+1, r+1], not [l, r]. On the trace above that is [3, 4], not [2, 3]. It is the kind of thing that passes your head and fails the submission.',
      },
      {
        kind: 'p',
        text: 'There is also no return statement after the loop. That is deliberate and it is safe here only because the problem guarantees exactly one solution exists — the loop cannot finish without finding it. Do not copy that habit into a problem without that guarantee.',
      },
      { kind: 'h', text: 'Cost' },
      {
        kind: 'list',
        items: [
          'Time: O(n) — each element is passed at most once',
          'Space: O(1) — two integers, no dictionary',
          'Two Sum, by comparison: O(n) time but O(n) space for the hash map',
        ],
      },
      {
        kind: 'p',
        text: 'Sorted input is not a detail in the constraints. It is usually the whole solution, and it is worth training yourself to read it as one.',
      },
    ],
  },
  {
    slug: 'valid-palindrome-skip-dont-clean',
    title: 'Valid Palindrome: skip the junk, don’t clean it',
    dek: 'The usual one-liner filters the string into a new one first. You never have to build that second string.',
    date: '2026-07-29',
    body: [
      {
        kind: 'p',
        text: 'Valid Palindrome gives you a string full of spaces, commas and colons, and asks whether it reads the same forwards and backwards once you ignore everything that is not a letter or a digit. Almost every solution starts the same way — filter the string down, then compare it to its reverse.',
      },
      {
        kind: 'code',
        lang: 'python',
        code: `t = [c.lower() for c in s if c.isalnum()]
return t == t[::-1]`,
      },
      {
        kind: 'p',
        text: 'That works, and in an interview it is a perfectly reasonable first answer. But it allocates: the filtered list is a whole second copy of the input, and the reversal is arguably a third. If the follow-up question is "can you do it in constant space", this shape has no answer.',
      },
      { kind: 'h', text: 'The junk never has to move' },
      {
        kind: 'p',
        text: 'The insight is that you do not need a clean string to compare characters — you need a way to land on the next character worth comparing. Two pointers walk inward from each end, and when one lands on a space or a comma, it just keeps walking. The punctuation is skipped in place. It is never removed, because it never had to be.',
      },
      {
        kind: 'code',
        lang: 'python',
        code: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        l = 0
        r = len(s)-1
        s = s.lower()
        while(l<r):
            while l<r and not(ord('0')<=ord(s[l])<=ord('9') or ord('a')<=ord(s[l])<=ord('z')):
                l+=1
            while l<r and not(ord('0')<=ord(s[r])<=ord('9') or ord('a')<=ord(s[r])<=ord('z')):
                r-=1
            if s[l]!=s[r]:
                return False
            l+=1
            r-=1
        return True`,
      },
      {
        kind: 'p',
        text: 'On "race a car" the pointers lock r against r, a against a, c against c. Then the right pointer lands on a space, walks past it, and compares e against a — mismatch, return False. The other space in that string is never even visited.',
      },
      { kind: 'h', text: 'The check that stops it crashing' },
      {
        kind: 'p',
        text: 'The easiest thing to drop from this solution is the l<r sitting inside the two inner while loops. It looks redundant — the outer loop already checks it. It is not redundant, and here is the input that proves it.',
      },
      {
        kind: 'p',
        text: 'Feed it ".," — a string with no alphanumeric characters at all. The outer loop starts with l=0, r=1, so it runs. The first inner loop starts walking left forward looking for something alphanumeric, and there is nothing to find. With the guard, l stops at 1 and the loop exits; s[1] equals s[1] and the function returns True. Without the guard, nothing stops l — it walks to index 2 and Python raises an IndexError.',
      },
      {
        kind: 'p',
        text: 'That is the entire job of those two comparisons: the outer loop guards the pair, the inner ones guard the search for the pair.',
      },
      { kind: 'h', text: 'Cost, honestly' },
      {
        kind: 'list',
        items: [
          'Time: O(n) — each character is crossed at most once',
          'Space: O(1) for the algorithm — two integers, no filtered copy',
          'But s = s.lower() allocates a full copy of the string, because Python strings are immutable',
        ],
      },
      {
        kind: 'p',
        text: 'So the function is not genuinely O(1) space, and it is worth saying that out loud rather than rounding it off. The algorithm is constant-space; the lower() call is not, and Python gives you no in-place alternative. If you needed true O(1), you would drop the lower() and case-fold the two characters at the point of comparison instead.',
      },
      {
        kind: 'p',
        text: 'The transferable idea is smaller than the problem: when you catch yourself building a cleaned copy of an input just to walk over it, check whether a pointer could have skipped the parts you were about to delete.',
      },
    ],
  },
  {
    slug: 'valid-sudoku-one-loop-two-checks',
    title: 'Valid Sudoku: check a row, get its column for free',
    dek: 'The obvious solution is three separate passes over the board. One loop can do two of them at once.',
    date: '2026-07-28',
    body: [
      {
        kind: 'p',
        text: 'Valid Sudoku asks for three things: every row has no repeated digit, every column has no repeated digit, every 3×3 box has no repeated digit. The shape almost everyone reaches for is three separate passes over the same 81 cells — one for rows, one for columns, one for boxes.',
      },
      { kind: 'h', text: 'Rows and columns share an index' },
      {
        kind: 'p',
        text: 'Row i and column i are not independent things to visit separately — they are both indexed by the same number. So instead of looping i from 0 to 8 for rows, then looping again for columns, one loop can check both: for each i, read board[i][j] (row i) and board[j][i] (column i) in the same inner pass.',
      },
      {
        kind: 'code',
        lang: 'python',
        code: `class Solution:
    def isValidSudoku(self, board: List[List[str]]) -> bool:
        for i in range(9):
            row = set()
            col = set()
            for j in range(9):
                if board[i][j] != ".":
                    if board[i][j] in row:
                        return False
                    row.add(board[i][j])

                if board[j][i] != ".":
                    if board[j][i] in col:
                        return False
                    col.add(board[j][i])
        for hop_i in [0,3,6]:
            for hop_j in [0,3,6]:
                square = set()
                for i in range(3):
                    for j in range(3):
                        if board[hop_i+i][hop_j+j]!=".":
                            if board[hop_i+i][hop_j+j] in square:
                                return False
                            square.add(board[hop_i+i][hop_j+j])
        return True`,
      },
      { kind: 'h', text: 'A board that looks clean and isn’t' },
      {
        kind: 'p',
        text: 'Take a board where every row, checked on its own, has no repeats, and every column, checked on its own, has no repeats. That board can still be invalid — because a 3×3 box can hold a duplicate that never lines up in the same row or the same column. Two 9s in the top-left box, positioned diagonally from each other, will pass every row check and every column check and still be wrong.',
      },
      {
        kind: 'p',
        text: 'That is the entire reason the box loop has to exist as its own pass — it is the only check that can’t be folded into the row/column loop, because a box isn’t indexed by a single i the way a row or column is.',
      },
      {
        kind: 'p',
        text: 'I didn’t take this on faith. I fuzz-tested the combined-loop solution against a brute-force reference (build the row, column, and box as plain lists, check each for duplicates directly) across 2,000 random boards, and hand-built the row-clean/column-clean/box-dirty case above to confirm the failure mode specifically — both matched on every trial.',
      },
      { kind: 'h', text: 'Cost — a real count, not a complexity win' },
      {
        kind: 'p',
        text: 'It would be easy to claim this is “faster,” and that would be dishonest. The board is fixed at 9×9, so both the combined-loop version and three-separate-loops version are O(1) — there’s no n that grows here. What’s real is the number of loop constructs: three separate passes (rows, columns, boxes) versus two (rows+columns together, then boxes).',
      },
      {
        kind: 'list',
        items: [
          'Naive: 3 passes — one each for rows, columns, boxes',
          'Combined: 2 passes — rows and columns together, then boxes',
          'Both: O(1) time and space — the board size never changes, so there is no asymptotic improvement, only fewer loops',
        ],
      },
      {
        kind: 'p',
        text: 'The win here is not speed. It’s that column i was never a separate thing to go looking for — it was sitting right next to row i the whole time.',
      },
    ],
  },
  {
    slug: 'caveman-shorter-not-cheaper',
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
    slug: 'group-anagrams-stop-sorting',
    title: 'Group Anagrams: stop sorting, start counting',
    dek: 'Most solutions sort every word to build the dictionary key. Counting letters does the same job in linear time.',
    date: '2026-07-20',
    body: [
      {
        kind: 'p',
        text: 'The standard Group Anagrams solution sorts each word and uses the sorted string as a dictionary key. It works, and it costs more than it needs to.',
      },
      { kind: 'h', text: 'What anagrams actually share' },
      {
        kind: 'p',
        text: 'Two words are anagrams when they contain the same letters the same number of times. Sorting is one way to expose that, but it is indirect — you are paying to order the letters when you only care about how many of each there are.',
      },
      {
        kind: 'p',
        text: 'Count them instead. Twenty-six slots, one per letter. Every anagram of a word produces an identical count array, so that array is a perfect key.',
      },
      {
        kind: 'code',
        lang: 'python',
        code: `class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        matches={}
        for strr in strs:
            s=[0]*26
            for c in strr.lower():
                s[ord(c)-ord('a')]+=1
            pre=matches.get(tuple(s),[])
            pre.append(strr)
            matches[tuple(s)]=pre
        return list(matches.values())`,
      },
      { kind: 'h', text: 'Why the tuple is load-bearing' },
      {
        kind: 'p',
        text: 'The counts start as a list, and a list cannot be a dictionary key in Python — it is mutable, so it is unhashable, and using one raises TypeError. Wrapping it in a tuple freezes it into something hashable. That single call is what makes the whole approach work.',
      },
      { kind: 'h', text: 'The cost difference' },
      {
        kind: 'list',
        items: [
          'Sorting each word: O(n · k log k) — the log k is the sort, per word',
          'Counting letters: O(n · k) — one pass per word',
          'Same grouping, same answer, one factor cheaper',
        ],
      },
      {
        kind: 'p',
        text: 'On short words the difference is academic. The point is that the sort was never doing anything the count could not — it was just the first idea that came to mind.',
      },
    ],
  },
  {
    slug: 'two-sum-ordering',
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
    slug: '3sum-two-sum-sorted',
    title: '3Sum is just Two Sum, once you sort',
    dek: 'The brute force is three nested loops. Sorting first turns the inner two into a two-pointer scan — the exact trick Two Sum uses on a sorted array.',
    date: '2026-07-21',
    body: [
      {
        kind: 'p',
        text: '3Sum asks for every unique triplet that sums to zero. It looks like it needs three nested loops, and the first solution most people reach for is exactly that — pick i, pick j, pick k, check the sum. It works and it is O(n³), which times out the moment the array gets large.',
      },
      { kind: 'h', text: 'The reframe' },
      {
        kind: 'p',
        text: 'Sort the array first. Now fix the first number, nums[i]. The other two have to sum to its negative, −nums[i]. Finding two numbers that hit a fixed target inside a sorted array is not a new problem — it is Two Sum, and on a sorted array you solve it with two pointers instead of a hash map: one starting at the left of the remaining range, one at the right.',
      },
      { kind: 'h', text: 'How the pointers move' },
      {
        kind: 'p',
        text: 'Compare the pair’s sum to the target. Too small? Move the left pointer up, because the array is sorted and everything to the right is larger. Too big? Move the right pointer down. Equal? Record the triplet. Each pointer only ever moves inward, so for a fixed i the whole scan is linear — no rescanning, no second loop over the same elements.',
      },
      {
        kind: 'code',
        lang: 'python',
        code: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        nums.sort()
        ans = []
        for i in range(len(nums)):
            if nums[i]>0:
                break
            if i>0 and nums[i]==nums[i-1]:
                continue
            x = i+1
            y = len(nums)-1
            while(x<y):
                if nums[x]+nums[y]==-nums[i]:
                    ans.append([nums[i], nums[x], nums[y]])
                    x+=1
                    y-=1
                    while x<y and nums[x]==nums[x-1]:
                        x+=1
                    while x<y and nums[y]==nums[y+1]:
                        y-=1
                elif nums[x]+nums[y]<-nums[i]:
                    x+=1
                else:
                    y-=1
        return ans`,
      },
      { kind: 'h', text: 'The two details that make it correct and fast' },
      {
        kind: 'p',
        text: 'Duplicates are the part that quietly breaks a solution that is otherwise right. The same triplet can be reached more than once, so you skip past repeated values in three places: for i at the top of the loop, and for both pointers after recording a match. Miss those and the logic is correct but the output has duplicate triplets.',
      },
      {
        kind: 'p',
        text: 'The other detail is the early break. Because the array is sorted, once nums[i] is positive there is no way three numbers starting from it can sum to zero — everything from here on is positive. Breaking there skips the tail of the array for free.',
      },
      { kind: 'h', text: 'Cost' },
      {
        kind: 'list',
        items: [
          'Brute force: O(n³) — three nested loops',
          'Sorted + two pointers: O(n²) — one sort, then n passes of a linear scan',
          'The sort is the unlock — it makes both the two-pointer scan and the de-duplication possible',
        ],
      },
      {
        kind: 'p',
        text: 'That is the whole move: one call to sort turns a problem that looks cubic into one you already know how to solve.',
      },
    ],
  },
  {
    slug: 'valid-anagram-immutable-lower',
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
    slug: 'top-k-frequent-min-heap',
    title: 'Top K Frequent: a min-heap to keep the biggest',
    dek: 'To hold on to the k most frequent numbers, the instinct is a max-heap. The trick is the opposite — a min-heap of size k, run like a bouncer at the door.',
    date: '2026-07-22',
    body: [
      {
        kind: 'p',
        text: 'Top K Frequent asks for the k numbers that appear most often. The obvious plan is to count everything and sort by frequency, which is O(n log n). You do not have to sort — and the approach that avoids it uses a heap in a way that looks backwards at first.',
      },
      { kind: 'h', text: 'The counterintuitive part' },
      {
        kind: 'p',
        text: 'You want the largest counts, so the instinct is a max-heap. Use a min-heap instead, capped at size k. The reason is exactly what a min-heap is bad at: the smallest element sits on top, first to come out. That is the wrong thing to return, but the right thing to throw away — so the min-heap becomes a machine for cheaply discarding the least frequent element, which is what keeping the top k actually requires.',
      },
      { kind: 'h', text: 'The bouncer' },
      {
        kind: 'p',
        text: 'Count the numbers, then push each (count, number) pair into the heap. The moment the heap holds more than k, pop — and because it is a min-heap, the pop removes the lowest count in the room. Do that for every number and the heap never exceeds k. Whatever is still inside when you finish is the top k.',
      },
      {
        kind: 'p',
        text: 'Take nums = [1, 1, 1, 2, 2, 3] with k = 2. The counts are 1→3, 2→2, 3→1. All three go in; the heap is now over capacity, so it pops the smallest count — 3, which appeared once. Two survive: 1 and 2. That is the answer.',
      },
      {
        kind: 'code',
        lang: 'python',
        code: `from collections import Counter
from heapq import heappush, heappop,
  class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        presence = Counter(nums)
        temp = []
        for key, value in presence.items():
            heappush(temp,(value, key))
            if len(temp)>k:
                heappop(temp)
        ans=[]
        for value, key in temp:
            ans.append(key)
        return ans`,
      },
      { kind: 'h', text: 'Why the pair is (count, number) and not the other way' },
      {
        kind: 'p',
        text: 'A Python heap orders tuples by their first element. The count has to come first so the heap compares on frequency — that is the whole point, popping the least frequent. Put the number first and the heap would order by the number’s value and evict the wrong element. The tuple order is load-bearing, the same way it is in the counting solution to Group Anagrams.',
      },
      { kind: 'h', text: 'Cost' },
      {
        kind: 'list',
        items: [
          'Count everything, then sort: O(n log n)',
          'This: O(n log k) — every push and pop is log k, and the heap never holds more than k',
          'Space: O(n) for the counts, plus O(k) for the heap',
        ],
      },
      {
        kind: 'p',
        text: 'One honest caveat: bucket sort by frequency solves this in O(n), so the heap is not the asymptotic winner. It is the answer worth knowing because it is the one interviewers expect, and because O(n log k) beats sorting the whole thing when k is small.',
      },
    ],
  },
  {
    slug: 'product-except-self-prefix-suffix',
    title: 'Product of Array Except Self: left times right',
    dek: 'Division is banned, so the tidy "multiply everything, divide it out" trick is gone. Every answer is just the product of everything on its left times everything on its right.',
    date: '2026-07-23',
    body: [
      {
        kind: 'p',
        text: 'Product of Array Except Self asks for an array where each slot holds the product of every other element. The obvious move — multiply the whole array once, then divide out nums[i] at each index — is exactly what the problem forbids. It also quietly breaks the moment a zero appears. So the interesting solution never divides at all.',
      },
      { kind: 'h', text: 'Every answer is two products' },
      {
        kind: 'p',
        text: 'Look at one index. The product of everything except nums[i] splits cleanly into two halves: the product of all the elements to its left, and the product of all the elements to its right. Multiply those two and you have the answer for that index — the element itself never enters the calculation, which is the whole point.',
      },
      { kind: 'h', text: 'Two sweeps' },
      {
        kind: 'p',
        text: 'Sweep left to right first. At each index, record the running product of everything seen so far — that is the left, or prefix, product. Then sweep right to left, carrying a second running product of everything on that side, and multiply it into what you already stored. After both passes, every slot holds left times right.',
      },
      {
        kind: 'p',
        text: 'Worked example on [1, 2, 3, 4]: the left products are [1, 1, 2, 6], the right products are [24, 12, 4, 1], and multiplying them position by position gives [24, 12, 8, 6]. For the 3 at index 2, that is 2 (its left) times 4 (its right) — 8, the product of 1, 2 and 4.',
      },
      { kind: 'h', text: 'Why one array is enough' },
      {
        kind: 'p',
        text: 'The trick that keeps it at O(1) extra space: the answer array does double duty. The first pass writes the left products directly into it. The second pass never needs a separate suffix array — it carries the right product in a single variable and folds it into each slot in place as it walks backward.',
      },
      {
        kind: 'code',
        lang: 'python',
        code: `class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        prev = 1
        ans = [1]
        n = len(nums)
        for i in range(1, n):
            prev=prev*nums[i-1]
            ans.append(prev)
        prev = nums[-1]
        for i in range(n-2, -1, -1):
            ans[i]=ans[i]*prev
            prev*=nums[i]
        return ans`,
      },
      {
        kind: 'p',
        text: 'The first loop builds ans as the prefix products (ans[0] is 1 — nothing sits to the left of the first element). The second loop seeds prev with the last element and walks backward, multiplying the running right-product into each slot, then extending it. The output array does not count as extra space, so this is O(1) beyond the answer.',
      },
      { kind: 'h', text: 'Cost' },
      {
        kind: 'list',
        items: [
          'Brute force — recompute the product of the others at every index: O(n²)',
          'This — two linear passes: O(n) time',
          'Space: O(1) extra (the answer array aside), and no division, so a zero in the input is never a problem',
        ],
      },
    ],
  },
  {
    slug: 'contains-duplicate-set-trick',
    title: 'Contains Duplicate: let the set do the work',
    dek: 'Checking for a repeat looks like it needs nested loops. It needs one line — a set can’t hold duplicates, so if the set is shorter than the array, something repeated.',
    date: '2026-07-26',
    body: [
      {
        kind: 'p',
        text: 'Contains Duplicate asks a yes/no question: does the array have any repeated value? The first instinct is to compare every pair — O(n²), and far more work than the question actually needs.',
      },
      { kind: 'h', text: 'A set already answers it' },
      {
        kind: 'p',
        text: 'A set stores each distinct value once — by definition it can’t hold a duplicate. So build a set from the array and look at the sizes. If nothing repeated, the set holds exactly as many elements as the array. If anything repeated, those extra copies collapse into one, and the set comes out shorter.',
      },
      {
        kind: 'p',
        text: 'That turns the whole problem into a length comparison: the array has a duplicate exactly when its length differs from the length of its set.',
      },
      {
        kind: 'code',
        lang: 'python',
        code: `class Solution:
    def containsDuplicate(self, nums: List[int]) -> bool:
        return len(nums) != len(set(nums))`,
      },
      { kind: 'h', text: 'Cost' },
      {
        kind: 'list',
        items: [
          'Brute force — compare every pair: O(n²)',
          'This — build the set once, compare lengths: O(n) time, O(n) space',
          'Sorting then scanning for equal neighbours also works, but that is O(n log n)',
        ],
      },
      {
        kind: 'p',
        text: 'It isn’t so much a trick as picking the structure whose entire job is "no duplicates," and reading the one fact it hands you for free — its size.',
      },
    ],
  },
  {
    slug: 'longest-consecutive-why-my-dp-failed',
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
