'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePuzzleStore } from '@/lib/store/index'

const SOLUTION_CODE = `def lengthOfLongestSubstring(s: str) -> int:
    seen = {}
    left = 0
    max_len = 0

    for right in range(len(s)):
        if s[right] in seen:
            left = max(left, seen[s[right]] + 1)
        seen[s[right]] = right
        max_len = max(max_len, right - left + 1)

    return max_len`

const PATTERN_CARD = {
  name: 'SLIDING WINDOW',
  what: 'A technique where you maintain a subarray (or substring) by moving two pointers — shrinking and expanding — instead of recalculating from scratch each time.',
  flavors: [
    {
      name: 'Fixed Window',
      desc: 'Window size stays constant. Slide one element at a time: O(n) instead of O(n·k).',
      color: 'cyan',
    },
    {
      name: 'Variable Window',
      desc: 'Window size adapts to a constraint. Expand right, shrink left until valid again.',
      color: 'magenta',
    },
  ],
  reachFor:
    'Contiguous subarrays/substrings problems. When brute force is O(n²) or O(n·k), sliding window often achieves O(n).',
  telltale: [
    '"longest substring…"',
    '"minimum window…"',
    '"maximum sum subarray of size k"',
    '"contains permutation"',
    '"at most k distinct"',
  ],
}

function TypewriterCode({ code, speed = 18 }: { code: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i >= code.length) {
        clearInterval(interval)
        setDone(true)
        return
      }
      setDisplayed(code.slice(0, i + 1))
      i++
    }, speed)
    return () => clearInterval(interval)
  }, [code, speed])

  return (
    <pre
      className="font-code text-sm leading-relaxed text-left overflow-auto"
      style={{ color: '#F8FAFC' }}
    >
      <code>
        {displayed.split('\n').map((line, li) => (
          <div key={li}>
            {line.split('').map((ch, ci) => {
              // Simple syntax coloring
              return ch
            })}
          </div>
        ))}
        {!done && <span className="cursor-blink" style={{ color: '#06B6D4' }}>|</span>}
      </code>
    </pre>
  )
}

function ReplayBelt({ belt, optimalLeft, optimalRight }: {
  belt: (number | string)[]
  optimalLeft: number
  optimalRight: number
}) {
  const [windowPos, setWindowPos] = useState(0)
  const posRef = useRef(0)

  useEffect(() => {
    const maxPos = optimalLeft
    const interval = setInterval(() => {
      if (posRef.current >= maxPos) {
        clearInterval(interval)
        return
      }
      posRef.current++
      setWindowPos(posRef.current)
    }, 400)
    return () => clearInterval(interval)
  }, [optimalLeft])

  const BOX_SIZE = 48
  const GAP = 4
  const STRIDE = BOX_SIZE + GAP

  return (
    <div className="overflow-x-auto">
      <div className="relative" style={{ width: belt.length * STRIDE, height: 64 }}>
        {/* Window frame */}
        <motion.div
          className="absolute top-0 rounded-lg border-2 border-cyan pointer-events-none"
          style={{
            height: BOX_SIZE,
            width: (optimalRight - optimalLeft) * STRIDE + BOX_SIZE + 8,
          }}
          animate={{ left: windowPos * STRIDE - 4 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div style={{ boxShadow: '0 0 12px #06B6D4' }} className="absolute inset-0 rounded-lg" />
        </motion.div>
        <div className="flex" style={{ gap: GAP }}>
          {belt.map((val, i) => {
            const inWindow = i >= windowPos && i <= windowPos + (optimalRight - optimalLeft)
            return (
              <div
                key={i}
                className="flex-shrink-0 flex items-center justify-center rounded-lg border-2 font-display font-bold text-sm"
                style={{
                  width: BOX_SIZE,
                  height: BOX_SIZE,
                  backgroundColor: inWindow ? 'rgba(6,182,212,0.15)' : 'rgba(238,242,255,0.1)',
                  borderColor: inWindow ? '#06B6D4' : 'rgba(109,40,217,0.3)',
                  color: '#F8FAFC',
                }}
              >
                {val}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function ActTwo() {
  const { advanceAct, p5Solution } = usePuzzleStore()
  const [phase, setPhase] = useState<'replay' | 'code' | 'card'>('replay')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('code'), 2500)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    if (phase !== 'code') return
    // Advance to card after code finishes typing (~2s for ~140 chars at 18ms each)
    const codeLen = SOLUTION_CODE.length
    const t = setTimeout(() => setPhase('card'), codeLen * 18 + 1000)
    return () => clearTimeout(t)
  }, [phase])

  const belt = p5Solution?.belt ?? ['d','v','d','f','i','n','d','k','e','y','h','e','r','e','i','n','s','t','r','i']
  const optLeft = p5Solution ? p5Solution.left : 3
  const optRight = p5Solution ? p5Solution.right : 10

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-cloud relative"
      style={{ background: '#0F172A' }}>

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #6D28D9, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl flex flex-col gap-8 relative z-10"
      >
        {/* Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-iris font-code text-xs tracking-widest mb-1 uppercase">
            Pattern Unlocked
          </p>
          <h2 className="font-display font-bold text-4xl text-gradient-iris">
            Sliding Window
          </h2>
        </motion.div>

        {/* Replay Belt */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-ink/60 rounded-2xl p-4 border border-iris/20"
        >
          <p className="text-xs text-ink/40 font-code mb-3 text-center uppercase tracking-widest">
            Your P5 solution replaying at 0.4x
          </p>
          <ReplayBelt belt={belt} optimalLeft={optLeft} optimalRight={optRight} />
        </motion.div>

        {/* Typewriter code */}
        <AnimatePresence>
          {(phase === 'code' || phase === 'card') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-ink rounded-2xl p-5 border border-cyan/20"
            >
              <p className="text-xs text-cyan font-code mb-3">
                # The pattern, revealed:
              </p>
              <TypewriterCode code={SOLUTION_CODE} speed={18} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pattern card */}
        <AnimatePresence>
          {phase === 'card' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-gradient-to-br from-iris/20 to-cyan/10 rounded-3xl p-6 border border-iris/40"
            >
              <div className="text-center mb-4">
                <span className="inline-block bg-lime/20 text-lime border border-lime/40 rounded-xl px-4 py-1 font-display font-bold text-lg tracking-widest">
                  PATTERN UNLOCKED — {PATTERN_CARD.name}
                </span>
              </div>

              <div className="grid gap-4">
                <div>
                  <h4 className="text-cyan font-code text-xs uppercase tracking-widest mb-1">What it is</h4>
                  <p className="text-cloud/80 font-body text-sm">{PATTERN_CARD.what}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {PATTERN_CARD.flavors.map(f => (
                    <div
                      key={f.name}
                      className="rounded-xl p-3 border"
                      style={{
                        borderColor: f.color === 'cyan' ? '#06B6D440' : '#EC489940',
                        background: f.color === 'cyan' ? 'rgba(6,182,212,0.05)' : 'rgba(236,72,153,0.05)',
                      }}
                    >
                      <h5 className="font-code font-bold text-xs mb-1"
                        style={{ color: f.color === 'cyan' ? '#06B6D4' : '#EC4899' }}>
                        {f.name}
                      </h5>
                      <p className="text-cloud/60 text-xs font-body">{f.desc}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 className="text-solar font-code text-xs uppercase tracking-widest mb-1">
                    Reach for it when…
                  </h4>
                  <p className="text-cloud/80 font-body text-sm">{PATTERN_CARD.reachFor}</p>
                </div>

                <div>
                  <h4 className="text-magenta font-code text-xs uppercase tracking-widest mb-1">
                    Telltale phrases
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {PATTERN_CARD.telltale.map(t => (
                      <span
                        key={t}
                        className="bg-magenta/10 text-magenta border border-magenta/20 rounded-lg px-2 py-1 font-code text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="btn-primary w-full mt-6"
                onClick={() => advanceAct('act3')}
              >
                Enter the Lab →
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
