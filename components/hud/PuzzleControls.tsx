'use client'

import { motion } from 'framer-motion'
import type { Puzzle } from '@/lib/puzzles/index'

type Props = {
  puzzle: Puzzle
  left: number
  right: number
  onWindowChange: (l: number, r: number) => void
  onSlide?: () => void
  onReposition?: (newLeft: number) => void
  additions: number
  slid: boolean
}

export default function PuzzleControls({
  puzzle,
  left,
  right,
  onWindowChange,
  onSlide,
  onReposition,
  additions,
  slid,
}: Props) {
  const { id, belt, goal } = puzzle

  if (id === 'P1') {
    return (
      <div className="text-center text-sm text-ink/50 font-body py-2">
        <span className="text-cyan font-semibold">Drag</span> the window left or right to find the maximum sum.
      </div>
    )
  }

  if (id === 'P2') {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink/60 font-body text-center">
          Click a starting position to <span className="text-solar font-semibold">reposition</span> the window (costs 4 additions).
          Or use arrow buttons to <span className="text-lime font-semibold">slide</span> one step (costs 1).
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          {/* Slide one step */}
          <button
            className="px-3 py-1.5 bg-lime/20 text-lime border border-lime/40 rounded-lg text-sm font-semibold hover:bg-lime/30 transition-colors"
            disabled={right >= belt.length - 1}
            onClick={() => {
              if ('size' in goal) {
                const size = goal.size
                const newLeft = Math.min(belt.length - size, left + 1)
                onWindowChange(newLeft, newLeft + size - 1)
              }
            }}
          >
            Slide → (+1)
          </button>
          <button
            className="px-3 py-1.5 bg-lime/20 text-lime border border-lime/40 rounded-lg text-sm font-semibold hover:bg-lime/30 transition-colors"
            disabled={left <= 0}
            onClick={() => {
              if ('size' in goal) {
                const size = goal.size
                const newLeft = Math.max(0, left - 1)
                onWindowChange(newLeft, newLeft + size - 1)
              }
            }}
          >
            ← Slide (-1)
          </button>
          {/* Jump buttons to a few positions */}
          <span className="text-ink/40 text-xs self-center">Jump (+4):</span>
          {[0, 10, 20, 30, 40, 46].map(pos => (
            <button
              key={pos}
              className="px-2 py-1 bg-solar/20 text-solar border border-solar/40 rounded text-xs font-semibold hover:bg-solar/30 transition-colors"
              onClick={() => {
                if ('size' in goal) {
                  const size = goal.size
                  const newLeft = Math.min(belt.length - size, pos)
                  if (onReposition) onReposition(newLeft)
                  else onWindowChange(newLeft, newLeft + size - 1)
                }
              }}
            >
              [{pos}]
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (id === 'P3') {
    const windowSize = 'size' in goal ? goal.size : 4
    const atEnd = right >= belt.length - 1

    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink/60 font-body text-center">
          Use the <span className="text-lime font-semibold">Slide →</span> button to advance the window one step.
          Each slide costs only <span className="text-lime font-bold">1 addition</span> (subtract left, add right).
        </p>
        <div className="flex gap-3 justify-center">
          <button
            className="px-4 py-2 bg-lime text-ink border-none rounded-lg font-semibold hover:bg-lime/90 transition-colors shadow-lime-glow disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={atEnd}
            onClick={() => {
              const newLeft = left + 1
              const newRight = Math.min(belt.length - 1, newLeft + windowSize - 1)
              onWindowChange(newLeft, newRight)
              if (onSlide) onSlide()
            }}
          >
            Slide → (+1)
          </button>
          {atEnd && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 text-lime font-bold text-sm"
            >
              ✓ Full scan complete!
            </motion.div>
          )}
        </div>
        <div className="text-center text-xs text-ink/40 font-code">
          Position {left}/{belt.length - windowSize} • Additions: {additions}
        </div>
      </div>
    )
  }

  // P4 and P5 — variable window
  if (id === 'P4' || id === 'P5') {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-ink/60 font-body text-center">
          {id === 'P4'
            ? 'Expand or shrink the window. Keep sum ≤ 15. Find the longest valid window.'
            : 'Expand right. When you see a repeat, shrink from the left.'}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <div className="flex items-center gap-1">
            <span className="text-lime text-xs font-code font-bold">L pointer:</span>
            <button
              className="px-2 py-1.5 bg-lime/20 text-lime border border-lime/40 rounded font-bold text-sm hover:bg-lime/30 transition-colors"
              onClick={() => onWindowChange(Math.max(0, left - 1), right)}
            >
              ◀
            </button>
            <button
              className="px-2 py-1.5 bg-lime/20 text-lime border border-lime/40 rounded font-bold text-sm hover:bg-lime/30 transition-colors"
              onClick={() => onWindowChange(Math.min(right, left + 1), right)}
            >
              ▶
            </button>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-magenta text-xs font-code font-bold">R pointer:</span>
            <button
              className="px-2 py-1.5 bg-magenta/20 text-magenta border border-magenta/40 rounded font-bold text-sm hover:bg-magenta/30 transition-colors"
              onClick={() => onWindowChange(left, Math.max(left, right - 1))}
            >
              ◀
            </button>
            <button
              className="px-2 py-1.5 bg-magenta/20 text-magenta border border-magenta/40 rounded font-bold text-sm hover:bg-magenta/30 transition-colors"
              onClick={() => onWindowChange(left, Math.min(belt.length - 1, right + 1))}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
