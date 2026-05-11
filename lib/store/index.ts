import { create } from 'zustand'
import { PUZZLES } from '@/lib/puzzles/index'
import { PROBLEMS } from '@/lib/problems/index'
import type { VizEvent, Replay } from '@/lib/viz/events'

// ─── Puzzle Store ───────────────────────────────────────────────────────────

export type Act = 'act1' | 'act2' | 'act3' | 'act4'

export type PuzzleState = {
  left: number
  right: number
  attempts: number
  solved: boolean
  additions: number
  slid: boolean
}

export type PuzzleStore = {
  currentAct: Act
  currentPuzzleIndex: number
  puzzleStates: PuzzleState[]
  p5Solution: { left: number; right: number; belt: (number | string)[] } | null

  setWindow: (index: number, left: number, right: number) => void
  incrementAdditions: (index: number, amount: number) => void
  markSlid: (index: number) => void
  completePuzzle: (index: number) => void
  nextPuzzle: () => void
  advanceAct: (act: Act) => void
  resetPuzzle: (index: number) => void
}

const initialPuzzleState = (i: number): PuzzleState => ({
  left: PUZZLES[i].initialWindow.left,
  right: PUZZLES[i].initialWindow.right,
  attempts: 0,
  solved: false,
  additions: 0,
  slid: false,
})

export const usePuzzleStore = create<PuzzleStore>((set, get) => ({
  currentAct: 'act1',
  currentPuzzleIndex: 0,
  puzzleStates: PUZZLES.map((_, i) => initialPuzzleState(i)),
  p5Solution: null,

  setWindow: (index, left, right) =>
    set(state => {
      const states = [...state.puzzleStates]
      states[index] = { ...states[index], left, right }
      return { puzzleStates: states }
    }),

  incrementAdditions: (index, amount) =>
    set(state => {
      const states = [...state.puzzleStates]
      states[index] = {
        ...states[index],
        additions: states[index].additions + amount,
      }
      return { puzzleStates: states }
    }),

  markSlid: (index) =>
    set(state => {
      const states = [...state.puzzleStates]
      states[index] = { ...states[index], slid: true }
      return { puzzleStates: states }
    }),

  completePuzzle: (index) =>
    set(state => {
      const states = [...state.puzzleStates]
      const ps = PUZZLES[index]
      states[index] = { ...states[index], solved: true }

      // Save P5 solution for Act 2 replay
      let p5Solution = state.p5Solution
      if (ps.id === 'P5') {
        p5Solution = {
          left: states[index].left,
          right: states[index].right,
          belt: ps.belt,
        }
      }
      return { puzzleStates: states, p5Solution }
    }),

  nextPuzzle: () =>
    set(state => {
      const next = state.currentPuzzleIndex + 1
      if (next >= PUZZLES.length) {
        return { currentAct: 'act2' as Act }
      }
      return { currentPuzzleIndex: next }
    }),

  advanceAct: (act) => set({ currentAct: act }),

  resetPuzzle: (index) =>
    set(state => {
      const states = [...state.puzzleStates]
      states[index] = initialPuzzleState(index)
      return { puzzleStates: states }
    }),
}))

// ─── Code Store ─────────────────────────────────────────────────────────────

export type TestResult = {
  passed: boolean
  expected: unknown
  actual: unknown
  error?: string
  events: VizEvent[]
}

export type ProblemState = {
  code: string
  hintsUsed: number
  attempts: number
  solved: boolean
  lastEvents: VizEvent[]
}

export type CodeStore = {
  currentProblemIndex: number
  problemStates: ProblemState[]
  vizEvents: VizEvent[]
  isRunning: boolean
  testResults: { visible: TestResult[]; hidden: TestResult[] }

  setCurrentProblem: (index: number) => void
  setCode: (index: number, code: string) => void
  useHint: (index: number) => void
  setRunning: (running: boolean) => void
  setResults: (
    visible: TestResult[],
    hidden: TestResult[],
    events: VizEvent[]
  ) => void
  completeProblem: (index: number) => void
}

const initialProblemState = (i: number): ProblemState => ({
  code: PROBLEMS[i].starterCode,
  hintsUsed: 0,
  attempts: 0,
  solved: false,
  lastEvents: [],
})

export const useCodeStore = create<CodeStore>((set) => ({
  currentProblemIndex: 0,
  problemStates: PROBLEMS.map((_, i) => initialProblemState(i)),
  vizEvents: [],
  isRunning: false,
  testResults: { visible: [], hidden: [] },

  setCurrentProblem: (index) => set({ currentProblemIndex: index }),

  setCode: (index, code) =>
    set(state => {
      const states = [...state.problemStates]
      states[index] = { ...states[index], code }
      return { problemStates: states }
    }),

  useHint: (index) =>
    set(state => {
      const states = [...state.problemStates]
      const maxHints = PROBLEMS[index].hints.length
      states[index] = {
        ...states[index],
        hintsUsed: Math.min(states[index].hintsUsed + 1, maxHints),
      }
      return { problemStates: states }
    }),

  setRunning: (running) => set({ isRunning: running }),

  setResults: (visible, hidden, events) =>
    set(state => {
      const allPassed =
        visible.every(r => r.passed) && hidden.every(r => r.passed)
      const idx = state.currentProblemIndex
      const states = [...state.problemStates]
      states[idx] = {
        ...states[idx],
        attempts: states[idx].attempts + 1,
        solved: allPassed || states[idx].solved,
        lastEvents: events,
      }
      return {
        testResults: { visible, hidden },
        vizEvents: events,
        problemStates: states,
      }
    }),

  completeProblem: (index) =>
    set(state => {
      const states = [...state.problemStates]
      states[index] = { ...states[index], solved: true }
      return { problemStates: states }
    }),
}))

// ─── Replay Store ────────────────────────────────────────────────────────────

export type ReplayStore = {
  replays: Replay[]
  currentReplay: Replay | null
  isPlaying: boolean
  playheadIndex: number
  speed: number

  saveReplay: (replay: Replay) => void
  playReplay: (replay: Replay) => void
  stopReplay: () => void
  setPlayhead: (index: number) => void
  setSpeed: (speed: number) => void
  tickPlayhead: () => void
}

export const useReplayStore = create<ReplayStore>((set, get) => ({
  replays: [],
  currentReplay: null,
  isPlaying: false,
  playheadIndex: 0,
  speed: 1,

  saveReplay: (replay) =>
    set(state => ({ replays: [...state.replays, replay] })),

  playReplay: (replay) =>
    set({ currentReplay: replay, isPlaying: true, playheadIndex: 0 }),

  stopReplay: () => set({ isPlaying: false }),

  setPlayhead: (index) => set({ playheadIndex: index }),

  setSpeed: (speed) => set({ speed }),

  tickPlayhead: () => {
    const { currentReplay, playheadIndex } = get()
    if (!currentReplay) return
    const next = playheadIndex + 1
    if (next >= currentReplay.events.length) {
      set({ isPlaying: false, playheadIndex: currentReplay.events.length - 1 })
    } else {
      set({ playheadIndex: next })
    }
  },
}))
