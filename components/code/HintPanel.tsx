'use client'

import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  hints: string[]
  hintsUsed: number
  onReveal: () => void
}

export default function HintPanel({ hints, hintsUsed, onReveal }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-code text-ink/50">
          Hints ({hintsUsed}/{hints.length} used)
        </span>
        {hintsUsed < hints.length && (
          <button
            className="text-xs font-code text-solar border border-solar/30 px-2 py-1 rounded hover:bg-solar/10 transition-colors"
            onClick={onReveal}
          >
            Reveal hint →
          </button>
        )}
      </div>

      <AnimatePresence>
        {hints.slice(0, hintsUsed).map((hint, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="bg-solar/5 border border-solar/20 rounded-lg p-3 text-sm font-body text-ink/80"
          >
            <span className="text-solar font-bold mr-2">Hint {i + 1}:</span>
            {hint}
          </motion.div>
        ))}
      </AnimatePresence>

      {hintsUsed === 0 && (
        <p className="text-xs text-ink/30 font-code italic">
          Stuck? Reveal a hint to get unstuck.
        </p>
      )}
    </div>
  )
}
