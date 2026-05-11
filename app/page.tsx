'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

// Demo belt for the hero animation
const DEMO_BELT = [4, 2, 7, 1, 9, 3, 8, 5]
const DEMO_WINDOW_SIZE = 3

function DemoConveyor() {
  const [windowPos, setWindowPos] = useState(0)
  const [direction, setDirection] = useState(1)
  const posRef = useRef(0)
  const dirRef = useRef(1)

  useEffect(() => {
    const interval = setInterval(() => {
      const maxPos = DEMO_BELT.length - DEMO_WINDOW_SIZE
      let next = posRef.current + dirRef.current
      if (next > maxPos) { next = maxPos; dirRef.current = -1 }
      if (next < 0) { next = 0; dirRef.current = 1 }
      posRef.current = next
      setWindowPos(next)
      setDirection(dirRef.current)
    }, 800)
    return () => clearInterval(interval)
  }, [])

  const BOX_SIZE = 64
  const GAP = 6
  const STRIDE = BOX_SIZE + GAP
  const windowSum = DEMO_BELT.slice(windowPos, windowPos + DEMO_WINDOW_SIZE)
    .reduce((a, b) => a + b, 0)

  return (
    <div className="relative overflow-x-auto">
      <div className="relative" style={{ width: DEMO_BELT.length * STRIDE, height: 90 }}>
        {/* Window frame */}
        <motion.div
          className="absolute top-0 rounded-xl border-2 border-cyan"
          style={{
            height: BOX_SIZE,
            width: DEMO_WINDOW_SIZE * STRIDE - GAP + 8,
          }}
          animate={{ left: windowPos * STRIDE - 4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <div style={{ boxShadow: '0 0 16px #06B6D4, 0 0 32px rgba(6,182,212,0.3)' }}
            className="absolute inset-0 rounded-xl" />
          {/* Sum badge */}
          <motion.div
            key={windowSum}
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 bg-cyan text-ink font-display font-bold text-xs px-2 py-0.5 rounded-lg whitespace-nowrap"
          >
            Σ = {windowSum}
          </motion.div>
        </motion.div>

        {/* Left pointer */}
        <motion.div
          className="absolute"
          style={{ top: -20, width: BOX_SIZE }}
          animate={{ left: windowPos * STRIDE }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <div className="text-center text-lime font-bold text-xs">▼</div>
        </motion.div>

        {/* Right pointer */}
        <motion.div
          className="absolute"
          style={{ top: -20, width: BOX_SIZE }}
          animate={{ left: (windowPos + DEMO_WINDOW_SIZE - 1) * STRIDE }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        >
          <div className="text-center text-magenta font-bold text-xs">▼</div>
        </motion.div>

        {/* Boxes */}
        <div className="flex" style={{ gap: GAP }}>
          {DEMO_BELT.map((val, i) => {
            const inWindow = i >= windowPos && i < windowPos + DEMO_WINDOW_SIZE
            return (
              <motion.div
                key={i}
                className="flex-shrink-0 flex items-center justify-center rounded-xl border-2 font-display font-bold text-lg"
                style={{
                  width: BOX_SIZE,
                  height: BOX_SIZE,
                  backgroundColor: inWindow ? 'rgba(6,182,212,0.15)' : 'rgba(238,242,255,0.6)',
                  borderColor: inWindow ? '#06B6D4' : 'rgba(109,40,217,0.2)',
                  color: inWindow ? '#0F172A' : '#64748B',
                  transform: inWindow ? 'scale(1.04)' : 'scale(1)',
                  transition: 'all 0.3s',
                }}
              >
                {val}
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 gap-12">
        {/* Title section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            className="inline-block bg-iris/10 border border-iris/20 rounded-2xl px-4 py-1.5 mb-4"
          >
            <span className="font-code text-xs text-iris tracking-widest uppercase">
              Algorithm Training
            </span>
          </motion.div>

          <h1 className="font-display font-bold text-5xl sm:text-6xl text-ink mb-3">
            Pattern{' '}
            <span className="text-gradient-iris">Quest</span>
          </h1>

          <p className="font-display text-xl text-iris/80 mb-3">
            The Conveyor — A Sliding Window Trainer
          </p>

          <p className="font-body text-base text-ink/60 max-w-lg mx-auto">
            Master the sliding window pattern through 5 interactive puzzles, a cinematic reveal,
            and 4 real LeetCode problems — with live visualization of your Python code.
          </p>
        </motion.div>

        {/* Demo conveyor */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-xl bg-white rounded-3xl shadow-xl border-2 border-mist p-6"
        >
          <p className="font-code text-xs text-ink/30 uppercase tracking-widest text-center mb-6">
            Live Demo — Max Sum Window (size 3)
          </p>
          <DemoConveyor />
        </motion.div>

        {/* Journey steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl"
        >
          {[
            { act: 'Act 1', label: '5 Puzzles', icon: '🧩', color: 'iris' },
            { act: 'Act 2', label: 'Pattern Reveal', icon: '💡', color: 'cyan' },
            { act: 'Act 3', label: 'Code Lab', icon: '⚡', color: 'lime' },
            { act: 'Act 4', label: 'Replay', icon: '🎬', color: 'magenta' },
          ].map((step, i) => (
            <motion.div
              key={step.act}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="bg-white rounded-xl border border-mist p-3 text-center"
            >
              <div className="text-2xl mb-1">{step.icon}</div>
              <div className="font-code text-xs text-ink/40">{step.act}</div>
              <div className="font-display font-semibold text-sm text-ink">{step.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}
        >
          <motion.button
            className="btn-primary text-lg px-10 py-4 rounded-2xl"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/play')}
          >
            Start Training →
          </motion.button>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-ink/30 text-xs font-code border-t border-mist">
        Pattern Quest — Sliding Window Trainer
      </footer>
    </div>
  )
}
