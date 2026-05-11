export type HudConfig = {
  showSum: boolean
  showLeft: boolean
  showRight: boolean
  showAdditions: boolean
  showLength: boolean
  showHashmap: boolean
}

export type PuzzleGoal =
  | { kind: 'max_sum_fixed'; size: number; optimalSum: number; optimalLeft: number }
  | { kind: 'max_sum_under_budget'; size: number; budget: number; optimalSum: number; optimalLeft: number }
  | { kind: 'max_sum_slide'; size: number; budget: number; optimalSum: number }
  | { kind: 'longest_sum_at_most'; cap: number; optimalLength: number; optimalLeft: number }
  | { kind: 'longest_distinct'; optimalLength: number; optimalLeft: number }

export type Puzzle = {
  id: 'P1' | 'P2' | 'P3' | 'P4' | 'P5'
  title: string
  belt: (number | string)[]
  windowKind: 'fixed' | 'variable'
  initialWindow: { left: number; right: number }
  goal: PuzzleGoal
  hud: HudConfig
  hints: string[]
  aha: string
}

// P1: Catch the Treasure — fixed window size 3
// Belt: [3,1,4,8,2,9,5,6]
// Windows: 3+1+4=8, 1+4+8=13, 4+8+2=14, 8+2+9=19, 2+9+5=16, 9+5+6=20 → max=20 at [5,6,7]
const P1: Puzzle = {
  id: 'P1',
  title: 'Catch the Treasure',
  belt: [3, 1, 4, 8, 2, 9, 5, 6],
  windowKind: 'fixed',
  initialWindow: { left: 0, right: 2 },
  goal: { kind: 'max_sum_fixed', size: 3, optimalSum: 20, optimalLeft: 5 },
  hud: {
    showSum: true,
    showLeft: false,
    showRight: false,
    showAdditions: false,
    showLength: false,
    showHashmap: false,
  },
  hints: [
    'Try sliding the window from left to right.',
    'Notice how each slide only changes one box — add the new one, remove the old one.',
    'The highest sum window starts at position 5.',
  ],
  aha: 'You slid a fixed-size window! Each step, one element enters and one leaves.',
}

// P2: The Long Belt — fixed window size 4, 50 boxes, budget 200
// Belt is deterministic 1-9 numbers
// Window sums for size 4: find max
const P2_BELT = [3,7,2,9,1,5,8,4,6,2,7,3,9,1,4,8,5,2,6,3,7,1,9,4,5,8,2,6,3,7,9,1,4,5,8,2,6,3,7,4,9,1,5,8,2,6,3,7,4,9]

// Compute optimal for P2
function computeMaxSumFixed(belt: number[], size: number): { sum: number; left: number } {
  let windowSum = belt.slice(0, size).reduce((a, b) => a + b, 0)
  let maxSum = windowSum
  let maxLeft = 0
  for (let i = size; i < belt.length; i++) {
    windowSum += belt[i] - belt[i - size]
    if (windowSum > maxSum) {
      maxSum = windowSum
      maxLeft = i - size + 1
    }
  }
  return { sum: maxSum, left: maxLeft }
}

const p2Optimal = computeMaxSumFixed(P2_BELT, 4)

const P2: Puzzle = {
  id: 'P2',
  title: 'The Long Belt',
  belt: P2_BELT,
  windowKind: 'fixed',
  initialWindow: { left: 0, right: 3 },
  goal: {
    kind: 'max_sum_under_budget',
    size: 4,
    budget: 200,
    optimalSum: p2Optimal.sum,
    optimalLeft: p2Optimal.left,
  },
  hud: {
    showSum: true,
    showLeft: true,
    showRight: true,
    showAdditions: true,
    showLength: false,
    showHashmap: false,
  },
  hints: [
    'Jumping the window to a random position costs 4 additions. Sliding costs 1.',
    'If you slide from the start all the way, you only need 47 additions total.',
    `The maximum sum window of size 4 starts at index ${p2Optimal.left}.`,
  ],
  aha: 'Repositioning is expensive! Sliding one step at a time is efficient.',
}

// P3: The Trick — same belt, slide button, budget 100
const P3: Puzzle = {
  id: 'P3',
  title: 'The Trick',
  belt: P2_BELT,
  windowKind: 'fixed',
  initialWindow: { left: 0, right: 3 },
  goal: {
    kind: 'max_sum_slide',
    size: 4,
    budget: 100,
    optimalSum: p2Optimal.sum,
  },
  hud: {
    showSum: true,
    showLeft: true,
    showRight: true,
    showAdditions: true,
    showLength: false,
    showHashmap: false,
  },
  hints: [
    'Each slide only costs 1 addition: subtract the left box, add the new right box.',
    'Track the maximum sum as you slide — you only need to check each window once.',
    'Slide all the way to the end. The total is just n-k additions!',
  ],
  aha: 'O(n) time! You only ever add and subtract once per element.',
}

// P4: Stretchy Window — variable, sum at most 15
// Belt: [1,2,3,4,1,2,3,1,2,1,4,3,2,1,5,4,3,2,1,2]
// Longest window with sum ≤ 15:
// Indices [4,10]: 1,2,3,1,2,1,4 = 14 ≤ 15, length=7 ✓
// Check [3,10]: 4,1,2,3,1,2,1,4 = 18 > 15 ✗
// So [4,10] length=7 is optimal
const P4_BELT = [1,2,3,4,1,2,3,1,2,1,4,3,2,1,5,4,3,2,1,2]

const P4: Puzzle = {
  id: 'P4',
  title: 'Stretchy Window',
  belt: P4_BELT,
  windowKind: 'variable',
  initialWindow: { left: 0, right: 0 },
  goal: {
    kind: 'longest_sum_at_most',
    cap: 15,
    optimalLength: 7,
    optimalLeft: 4,
  },
  hud: {
    showSum: true,
    showLeft: true,
    showRight: true,
    showAdditions: false,
    showLength: true,
    showHashmap: false,
  },
  hints: [
    'Expand right when sum ≤ 15. Shrink from left when sum > 15.',
    'The window can stretch and shrink! This is a variable-size window.',
    'Longest valid window has 7 elements and starts at index 4.',
  ],
  aha: 'Variable windows expand and shrink based on a constraint — a key sliding window technique!',
}

// P5: No Repeats — variable window, longest distinct substring
// Belt: ['d','v','d','f','i','n','d','k','e','y','h','e','r','e','i','n','s','t','r','i']
// Longest non-repeating window:
// From index 3: f,i,n,d,k,e,y,h = 8 (indices 3-10), next is 'e' which is not in set?
// Actually check: {f,i,n,d,k,e,y,h} then index 11='e' → 'e' is already in set!
// So window [3,10] = length 8: f(3),i(4),n(5),d(6),k(7),e(8),y(9),h(10) ✓
// Verify no repeats: f,i,n,d,k,e,y,h — all distinct ✓
const P5_BELT = ['d','v','d','f','i','n','d','k','e','y','h','e','r','e','i','n','s','t','r','i']

const P5: Puzzle = {
  id: 'P5',
  title: 'No Repeats',
  belt: P5_BELT,
  windowKind: 'variable',
  initialWindow: { left: 0, right: 0 },
  goal: {
    kind: 'longest_distinct',
    optimalLength: 8,
    optimalLeft: 3,
  },
  hud: {
    showSum: false,
    showLeft: true,
    showRight: true,
    showAdditions: false,
    showLength: true,
    showHashmap: true,
  },
  hints: [
    'Expand right as long as the new character is not already in the window.',
    'When you see a repeat, shrink from the left until the duplicate is removed.',
    'The longest window with no repeats has 8 characters, starting at index 3.',
  ],
  aha: 'A hashmap tracks what\'s in the window — now you can handle character constraints!',
}

export const PUZZLES: Puzzle[] = [P1, P2, P3, P4, P5]

export function computeWindowSum(belt: (number | string)[], left: number, right: number): number {
  let sum = 0
  for (let i = left; i <= right; i++) {
    const val = belt[i]
    if (typeof val === 'number') sum += val
  }
  return sum
}

export function computeWindowChars(belt: (number | string)[], left: number, right: number): Map<string, number> {
  const map = new Map<string, number>()
  for (let i = left; i <= right; i++) {
    const ch = String(belt[i])
    map.set(ch, (map.get(ch) || 0) + 1)
  }
  return map
}

export function hasRepeats(belt: (number | string)[], left: number, right: number): boolean {
  const chars = computeWindowChars(belt, left, right)
  for (const count of chars.values()) {
    if (count > 1) return false
  }
  return true
}
