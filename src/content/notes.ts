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
