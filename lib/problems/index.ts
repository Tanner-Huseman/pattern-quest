export type TestCase = {
  args: unknown[]
  expected: unknown
}

export type Problem = {
  id: string
  leetcodeNum: number
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  flavor: 'fixed' | 'variable' | 'variable-shrink' | 'fixed-frequency'
  prompt: string
  signature: string
  starterCode: string
  solutionCode: string
  visibleTests: TestCase[]
  hiddenTests: TestCase[]
  hints: string[]
}

const LC643: Problem = {
  id: 'lc643',
  leetcodeNum: 643,
  title: 'Maximum Average Subarray I',
  difficulty: 'Easy',
  flavor: 'fixed',
  prompt:
    'Given an integer array `nums` and integer `k`, find the contiguous subarray of length `k` with the maximum average value. Return the maximum average.',
  signature: 'def findMaxAverage(nums: list[int], k: int) -> float:',
  starterCode: `def findMaxAverage(nums: list[int], k: int) -> float:
    # viz.setup(nums)           # show the belt
    # viz.window(left, right)   # highlight current window
    # viz.note("sum", window_sum)
    # viz.frame()               # snapshot this step

    # --- your code here ---
    pass
`,
  solutionCode: `def findMaxAverage(nums: list[int], k: int) -> float:
    viz.setup(nums)
    window_sum = sum(nums[:k])
    max_sum = window_sum
    viz.window(0, k - 1)
    viz.note("sum", window_sum)
    viz.frame()

    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        left = i - k + 1
        viz.window(left, i)
        viz.note("sum", window_sum)
        viz.frame()
        if window_sum > max_sum:
            max_sum = window_sum
            viz.mark(i, "lime")

    return max_sum / k
`,
  visibleTests: [
    { args: [[1, 12, -5, -6, 50, 3], 4], expected: 12.75 },
    { args: [[5], 1], expected: 5.0 },
    { args: [[0, 1, 1, 3, 3], 4], expected: 2.0 },
  ],
  hiddenTests: [
    { args: [[4, 2, 1, 3, 3], 2], expected: 3.0 },
    { args: [[-1, -12, -5, -6, 0, 3], 3], expected: -1.0 },
    { args: [[9, 7, 3, 5, 6, 2, 0], 3], expected: 7.0 },
    { args: [[1, 1, 1, 1, 1], 1], expected: 1.0 },
  ],
  hints: [
    'Start by computing the sum of the first k elements.',
    'For each subsequent window, instead of summing all k elements again, subtract the leftmost element and add the new rightmost element.',
    'Track the maximum sum as you slide. At the end, divide by k to get the average.',
  ],
}

const LC3: Problem = {
  id: 'lc3',
  leetcodeNum: 3,
  title: 'Longest Substring Without Repeating Characters',
  difficulty: 'Medium',
  flavor: 'variable',
  prompt:
    'Given a string `s`, find the length of the longest substring without repeating characters.',
  signature: 'def lengthOfLongestSubstring(s: str) -> int:',
  starterCode: `def lengthOfLongestSubstring(s: str) -> int:
    # viz.setup(list(s))        # show characters on the belt
    # viz.window(left, right)   # highlight the current window
    # viz.note("seen", dict(seen))
    # viz.frame()               # snapshot this step

    # --- your code here ---
    pass
`,
  solutionCode: `def lengthOfLongestSubstring(s: str) -> int:
    viz.setup(list(s))
    seen = {}
    left = 0
    max_len = 0

    for right in range(len(s)):
        if s[right] in seen and seen[s[right]] >= left:
            left = seen[s[right]] + 1
        seen[s[right]] = right
        window_len = right - left + 1
        if window_len > max_len:
            max_len = window_len
            viz.mark(right, "lime")
        viz.window(left, right)
        viz.note("length", window_len)
        viz.note("seen", seen)
        viz.frame()

    return max_len
`,
  visibleTests: [
    { args: ['abcabcbb'], expected: 3 },
    { args: ['bbbbb'], expected: 1 },
    { args: ['pwwkew'], expected: 3 },
  ],
  hiddenTests: [
    { args: [''], expected: 0 },
    { args: ['au'], expected: 2 },
    { args: ['dvdf'], expected: 3 },
    { args: ['anviaj'], expected: 5 },
  ],
  hints: [
    'Use a hashmap (dictionary) to record the last seen index of each character.',
    'Move the left pointer forward when you encounter a character already in the window.',
    'The window length at any point is right - left + 1. Track the maximum.',
  ],
}

const LC209: Problem = {
  id: 'lc209',
  leetcodeNum: 209,
  title: 'Minimum Size Subarray Sum',
  difficulty: 'Medium',
  flavor: 'variable-shrink',
  prompt:
    'Given an array of positive integers `nums` and a positive integer `target`, return the minimal length of a subarray whose sum is ≥ `target`. If there is no such subarray, return 0.',
  signature: 'def minSubArrayLen(target: int, nums: list[int]) -> int:',
  starterCode: `def minSubArrayLen(target: int, nums: list[int]) -> int:
    # viz.setup(nums)
    # viz.window(left, right)
    # viz.note("sum", window_sum)
    # viz.frame()

    # --- your code here ---
    pass
`,
  solutionCode: `def minSubArrayLen(target: int, nums: list[int]) -> int:
    viz.setup(nums)
    left = 0
    window_sum = 0
    min_len = float('inf')

    for right in range(len(nums)):
        window_sum += nums[right]
        viz.window(left, right)
        viz.note("sum", window_sum)
        viz.frame()

        while window_sum >= target:
            current_len = right - left + 1
            if current_len < min_len:
                min_len = current_len
                viz.mark(left, "lime")
                viz.mark(right, "magenta")
            window_sum -= nums[left]
            left += 1
            viz.window(left, right)
            viz.note("sum", window_sum)
            viz.frame()

    return 0 if min_len == float('inf') else min_len
`,
  visibleTests: [
    { args: [7, [2, 3, 1, 2, 4, 3]], expected: 2 },
    { args: [4, [1, 4, 4]], expected: 1 },
    { args: [11, [1, 1, 1, 1, 1, 1, 1, 1]], expected: 0 },
  ],
  hiddenTests: [
    { args: [15, [1, 2, 3, 4, 5]], expected: 5 },
    { args: [6, [2, 3, 1, 2, 4, 3]], expected: 2 },
    { args: [3, [1, 1]], expected: 0 },
    { args: [7, [2, 3, 1, 2, 4, 3]], expected: 2 },
  ],
  hints: [
    'Use two pointers: expand right to grow the window, shrink left when sum >= target.',
    'Whenever the sum meets the target, record the window length and try to shrink further.',
    'Initialize min_len to infinity; if it remains infinity after the loop, return 0.',
  ],
}

const LC567: Problem = {
  id: 'lc567',
  leetcodeNum: 567,
  title: 'Permutation in String',
  difficulty: 'Medium',
  flavor: 'fixed-frequency',
  prompt:
    'Given two strings `s1` and `s2`, return `True` if `s2` contains a permutation of `s1`, or `False` otherwise. In other words, return `True` if one of `s1`\'s permutations is a substring of `s2`.',
  signature: 'def checkInclusion(s1: str, s2: str) -> bool:',
  starterCode: `def checkInclusion(s1: str, s2: str) -> bool:
    # viz.setup(list(s2))
    # viz.window(left, right)
    # viz.note("need", dict(need))
    # viz.note("have", dict(have))
    # viz.frame()

    # --- your code here ---
    pass
`,
  solutionCode: `def checkInclusion(s1: str, s2: str) -> bool:
    from collections import Counter

    viz.setup(list(s2))

    if len(s1) > len(s2):
        return False

    need = Counter(s1)
    have = Counter(s2[:len(s1)])

    viz.window(0, len(s1) - 1)
    viz.note("need", dict(need))
    viz.note("have", dict(have))
    viz.frame()

    if have == need:
        viz.mark(0, "lime")
        return True

    for right in range(len(s1), len(s2)):
        left = right - len(s1) + 1
        have[s2[right]] += 1
        old_char = s2[right - len(s1)]
        have[old_char] -= 1
        if have[old_char] == 0:
            del have[old_char]

        viz.window(left, right)
        viz.note("need", dict(need))
        viz.note("have", dict(have))
        viz.frame()

        if have == need:
            viz.mark(left, "lime")
            return True

    return False
`,
  visibleTests: [
    { args: ['ab', 'eidbaooo'], expected: true },
    { args: ['ab', 'eidboaoo'], expected: false },
    { args: ['adc', 'dcda'], expected: true },
  ],
  hiddenTests: [
    { args: ['a', 'ab'], expected: true },
    { args: ['abc', 'bbbca'], expected: true },
    { args: ['hello', 'ooolleoooleh'], expected: false },
    { args: ['ab', 'ab'], expected: true },
  ],
  hints: [
    'Use two frequency maps: one for s1 (the target), one for the current window in s2.',
    'The window in s2 has a fixed size equal to len(s1). Slide it from left to right.',
    'When the two frequency maps are equal, you found a permutation. Use Counter from collections.',
  ],
}

export const PROBLEMS: Problem[] = [LC643, LC3, LC209, LC567]

export function getProblemById(id: string): Problem | undefined {
  return PROBLEMS.find(p => p.id === id)
}
