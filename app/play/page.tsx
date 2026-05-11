'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { usePuzzleStore } from '@/lib/store/index'
import { loadProgress, saveProgress } from '@/lib/storage'
import { PUZZLES } from '@/lib/puzzles/index'
import { PROBLEMS } from '@/lib/problems/index'

// Lazy-load act components to reduce initial bundle
import dynamic from 'next/dynamic'

const ActOne = dynamic(() => import('@/components/ActOne'), {
  loading: () => <LoadingAct label="Loading Act 1..." />,
  ssr: false,
})
const ActTwo = dynamic(() => import('@/components/ActTwo'), {
  loading: () => <LoadingAct label="Loading Act 2..." />,
  ssr: false,
})
const ActThree = dynamic(() => import('@/components/ActThree'), {
  loading: () => <LoadingAct label="Loading Act 3..." />,
  ssr: false,
})
const ActFour = dynamic(() => import('@/components/ActFour'), {
  loading: () => <LoadingAct label="Loading Act 4..." />,
  ssr: false,
})

function LoadingAct({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-iris font-code text-sm gap-2">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        className="w-5 h-5 border-2 border-iris border-t-transparent rounded-full"
      />
      {label}
    </div>
  )
}

function ActIndicator({ currentAct }: { currentAct: string }) {
  const acts = ['act1', 'act2', 'act3', 'act4']
  const labels = ['Puzzles', 'Reveal', 'Lab', 'Replay']
  const current = acts.indexOf(currentAct)

  return (
    <div className="flex items-center gap-1">
      {acts.map((a, i) => (
        <div key={a} className="flex items-center gap-1">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-code transition-all ${
              i === current
                ? 'bg-iris/15 text-iris font-bold'
                : i < current
                ? 'text-lime/60'
                : 'text-ink/20'
            }`}
          >
            {i < current ? '✓' : i + 1}
            <span className="hidden sm:inline">{labels[i]}</span>
          </div>
          {i < acts.length - 1 && (
            <div className={`w-4 h-px ${i < current ? 'bg-lime/40' : 'bg-ink/10'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

function PlayContent() {
  const searchParams = useSearchParams()
  const { currentAct, currentPuzzleIndex, puzzleStates, advanceAct } = usePuzzleStore()

  // Restore progress on mount
  useEffect(() => {
    const saved = loadProgress()
    if (saved) {
      // Restore act if valid
      if (['act1', 'act2', 'act3', 'act4'].includes(saved.currentAct)) {
        advanceAct(saved.currentAct as 'act1' | 'act2' | 'act3' | 'act4')
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Save progress on state change
  useEffect(() => {
    saveProgress({
      currentAct,
      currentPuzzleIndex,
      puzzlesSolved: puzzleStates.map(s => s.solved),
      currentProblemIndex: 0,
      problemsSolved: PROBLEMS.map(() => false),
    })
  }, [currentAct, currentPuzzleIndex, puzzleStates])

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      {currentAct !== 'act2' && currentAct !== 'act4' && (
        <header className="flex items-center justify-between px-4 py-3 border-b border-mist bg-white/80 backdrop-blur-sm flex-shrink-0">
          <a href="/" className="font-display font-bold text-iris text-sm hover:text-iris/80 transition-colors">
            ← Pattern Quest
          </a>
          <ActIndicator currentAct={currentAct} />
        </header>
      )}

      {/* Act content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentAct}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {currentAct === 'act1' && <ActOne />}
            {currentAct === 'act2' && <ActTwo />}
            {currentAct === 'act3' && <ActThree />}
            {currentAct === 'act4' && <ActFour />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default function PlayPage() {
  return (
    <Suspense fallback={<LoadingAct label="Loading..." />}>
      <PlayContent />
    </Suspense>
  )
}
