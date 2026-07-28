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
]

export function noteBySlug(slug: string): Note | undefined {
  return NOTES.find((n) => n.slug === slug)
}

export function noteForVideo(videoSlug: string): Note | undefined {
  return NOTES.find((n) => n.video === videoSlug)
}
