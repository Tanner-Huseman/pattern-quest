'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Conveyor from '@/components/conveyor/Conveyor'
import StateStrip from '@/components/hud/StateStrip'
import PuzzleControls from '@/components/hud/PuzzleControls'
import { usePuzzleStore } from '@/lib/store/index'
import { PUZZLES, computeWindowSum, computeWindowChars, hasRepeats } from '@/lib/puzzles/index'
import type { Puzzle } from '@/lib/puzzles/index'

function checkWin(puzzle: Puzzle, left: number, right: number, additions: number, slid: boolean): boolean {
  const { goal, belt } = puzzle
  switch (goal.kind) {
    case 'max_sum_fixed': {
      const sum = computeWindowSum(belt, left, right)
      return sum >= goal.optimalSum
    }
    case 'max_sum_under_budget': {
      const sum = computeWindowSum(belt, left, right)
      return sum >= goal.optimalSum && additions <= goal.budget
    }
    case 'max_sum_slide': {
      return slid && right >= belt.length - 1
    }
    case 'longest_sum_at_most': {
      const len = right - left + 1
      return len >= goal.optimalLength
    }
    case 'longest_distinct': {
      const len = right - left + 1
      const noRep = hasRepeats(belt, left, right)
      return noRep && len >= goal.optimalLength
    }
  }
}

function StampProgress({ count }: { count: number }) {
  return (
    <div className="flex gap-2 justify-center">
      {PUZZLES.map((p, i) => (
        <motion.div
          key={p.id}
          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 font-display font-bold text-sm ${
            i < count
              ? 'bg-lime/20 border-lime text-lime'
              : 'bg-mist border-ink/10 text-ink/20'
          }`}
          animate={i === count - 1 ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.5 }}
        >
          {i < count ? '✓' : i + 1}
        </motion.div>
      ))}
    </div>
  )
}

function GoalCard({ puzzle }: { puzzle: Puzzle }) {
  const { goal } = puzzle
  let desc = ''
  if (goal.kind === 'max_sum_fixed') desc = `Find the window of size ${goal.size} with the highest sum (target: ${goal.optimalSum}).`
  else if (goal.kind === 'max_sum_under_budget') desc = `Find the highest-sum window of size ${goal.size} in ≤ ${goal.budget} additions.`
  else if (goal.kind === 'max_sum_slide') desc = `Slide the window one step at a time across the whole belt using ≤ ${goal.budget} additions.`
  else if (goal.kind === 'longest_sum_at_most') desc = `Find the longest window with sum ≤ ${goal.cap} (target length: ${goal.optimalLength}).`
  else if (goal.kind === 'longest_distinct') desc = `Find the longest window with no repeating characters (target length: ${goal.optimalLength}).`

  return (
    <div className="bg-iris/5 border border-iris/20 rounded-xl p-4 text-sm font-body text-ink/80">
      <div className="font-semibold text-iris mb-1">Goal</div>
      <p>{desc}</p>
    </div>
  )
}

export default function ActOne() {
  const {
    currentPuzzleIndex,
    puzzleStates,
    setWindow,
    incrementAdditions,
    markSlid,
    completePuzzle,
    nextPuzzle,
  } = usePuzzleStore()

  const puzzle = PUZZLES[currentPuzzleIndex]
  const state = puzzleStates[currentPuzzleIndex]
  const { left, right, additions, solved, slid } = state

  const [winFlash, setWinFlash] = useState(false)
  const [showAha, setShowAha] = useState(false)

  const solvedCount = puzzleStates.filter(s => s.solved).length

  const handleWindowChange = useCallback((newLeft: number, newRight: number) => {
    const oldLeft = left
    const oldRight = right
    const size = puzzle.goal && 'size' in puzzle.goal ? puzzle.goal.size : undefined

    // Calculate additions cost
    let cost = 0
    if (puzzle.id === 'P2') {
      // Check if repositioning (jump) or sliding
      const isSlide =
        (newLeft === oldLeft + 1 && newRight === oldRight + 1) ||
        (newLeft === oldLeft - 1 && newRight === oldRight - 1)
      cost = isSlide ? 1 : 4
    } else if (puzzle.id === 'P3') {
      cost = 1
    }

    setWindow(currentPuzzleIndex, newLeft, newRight)
    if (cost > 0) incrementAdditions(currentPuzzleIndex, cost)
  }, [currentPuzzleIndex, left, right, puzzle, setWindow, incrementAdditions])

  const handleReposition = useCallback((newLeft: number) => {
    const size = 'size' in puzzle.goal ? puzzle.goal.size : 4
    setWindow(currentPuzzleIndex, newLeft, newLeft + size - 1)
    incrementAdditions(currentPuzzleIndex, 4)
  }, [currentPuzzleIndex, puzzle.goal, setWindow, incrementAdditions])

  const handleSlide = useCallback(() => {
    markSlid(currentPuzzleIndex)
  }, [currentPuzzleIndex, markSlid])

  // Check win condition
  useEffect(() => {
    if (solved) return
    const win = checkWin(puzzle, left, right, additions, slid)
    if (win) {
      completePuzzle(currentPuzzleIndex)
      setWinFlash(true)
      setShowAha(true)
      setTimeout(() => setWinFlash(false), 800)
    }
  }, [left, right, additions, slid, solved, puzzle, currentPuzzleIndex, completePuzzle])

  const handleNext = useCallback(() => {
    setShowAha(false)
    nextPuzzle()
  }, [nextPuzzle])

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-lg text-ink">
            {puzzle.id}: {puzzle.title}
          </h2>
          <p className="text-xs text-ink/40 font-code">Act 1 — Interactive Puzzles</p>
        </div>
        <StampProgress count={solvedCount} />
      </div>

      {/* Conveyor */}
      <div
        className={`rounded-2xl border-2 transition-all duration-300 overflow-x-auto ${
          winFlash ? 'border-lime bg-lime/5' : 'border-mist bg-white'
        }`}
      >
        <Conveyor
          belt={puzzle.belt}
          left={left}
          right={right}
          onWindowChange={handleWindowChange}
          draggable={puzzle.id === 'P1' || puzzle.id === 'P2'}
          windowKind={puzzle.windowKind}
          windowSize={'size' in puzzle.goal ? puzzle.goal.size : undefined}
        />
      </div>

      {/* State HUD */}
      <StateStrip
        belt={puzzle.belt}
        left={left}
        right={right}
        hud={puzzle.hud}
        additions={additions}
        budget={'budget' in puzzle.goal ? puzzle.goal.budget : undefined}
        cap={'cap' in puzzle.goal ? puzzle.goal.cap : undefined}
      />

      {/* Goal */}
      <GoalCard puzzle={puzzle} />

      {/* Controls */}
      <PuzzleControls
        puzzle={puzzle}
        left={left}
        right={right}
        onWindowChange={handleWindowChange}
        onSlide={handleSlide}
        onReposition={handleReposition}
        additions={additions}
        slid={slid}
      />

      {/* Win overlay */}
      <AnimatePresence>
        {showAha && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed inset-0 flex items-center justify-center z-50 bg-ink/60 backdrop-blur-sm"
            onClick={handleNext}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl border-4 border-lime"
              initial={{ rotate: -3 }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            >
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="font-display font-bold text-2xl text-lime mb-2">
                {puzzle.id === 'P5' ? 'All Puzzles Complete!' : 'Puzzle Solved!'}
              </h3>
              <div className="stamp-drop inline-block bg-lime/20 border-4 border-lime text-lime font-display font-bold text-xl rounded-2xl px-6 py-3 mb-4">
                ✓ Stamp {currentPuzzleIndex + 1}
              </div>
              <p className="text-sm text-ink/70 font-body mb-6 italic">
                &ldquo;{puzzle.aha}&rdquo;
              </p>
              <button
                className="btn-primary w-full"
                onClick={handleNext}
              >
                {currentPuzzleIndex < PUZZLES.length - 1
                  ? `Next: ${PUZZLES[currentPuzzleIndex + 1].title} →`
                  : 'Enter Act 2 →'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
