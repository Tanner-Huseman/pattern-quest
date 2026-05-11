'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { TestResult } from '@/lib/store/index'

type Props = {
  visible: TestResult[]
  hidden: TestResult[]
  isRunning?: boolean
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return 'None'
  if (typeof v === 'boolean') return v ? 'True' : 'False'
  if (typeof v === 'string') return `"${v}"`
  if (Array.isArray(v)) return `[${v.map(formatValue).join(', ')}]`
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function TestRow({
  index,
  result,
  label,
  args,
}: {
  index: number
  result: TestResult
  label: string
  args?: unknown[]
}) {
  const { passed, expected, actual, error } = result

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-lg border p-3 font-code text-xs ${
        passed
          ? 'bg-lime/5 border-lime/30'
          : 'bg-magenta/5 border-magenta/30'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-ink/60 font-semibold">{label}</span>
        <span className={passed ? 'text-lime font-bold' : 'text-magenta font-bold'}>
          {passed ? '✓ pass' : '✗ fail'}
        </span>
      </div>
      {args && (
        <div className="text-ink/50 text-xs mb-1">
          Input: {args.map(formatValue).join(', ')}
        </div>
      )}
      {!passed && (
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div>
            <span className="text-ink/40">Expected:</span>{' '}
            <span className="text-lime">{formatValue(expected)}</span>
          </div>
          <div>
            <span className="text-ink/40">Got:</span>{' '}
            <span className="text-magenta">{formatValue(actual)}</span>
          </div>
        </div>
      )}
      {error && (
        <div className="mt-1 text-solar text-xs break-all">
          Error: {error.slice(0, 200)}
        </div>
      )}
    </motion.div>
  )
}

export default function Console({ visible, hidden, isRunning }: Props) {
  if (isRunning) {
    return (
      <div className="flex items-center gap-3 p-4 text-solar font-code text-sm">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
          className="w-4 h-4 border-2 border-solar border-t-transparent rounded-full"
        />
        Running tests...
      </div>
    )
  }

  if (visible.length === 0 && hidden.length === 0) {
    return (
      <div className="p-4 text-ink/30 font-code text-sm text-center">
        Run your code to see test results
      </div>
    )
  }

  const passedVisible = visible.filter(r => r.passed).length
  const passedHidden = hidden.filter(r => r.passed).length
  const totalPassed = passedVisible + passedHidden
  const total = visible.length + hidden.length
  const allPassed = totalPassed === total

  return (
    <div className="flex flex-col gap-2 p-3">
      {/* Summary */}
      <div className={`flex items-center justify-between p-2 rounded-lg font-code text-sm font-bold ${
        allPassed ? 'bg-lime/10 text-lime' : 'bg-magenta/10 text-magenta'
      }`}>
        <span>
          {allPassed ? '🎉 All tests passed!' : `${totalPassed}/${total} tests passed`}
        </span>
        <span className="text-xs opacity-70">
          {passedVisible}/{visible.length} visible · {passedHidden}/{hidden.length} hidden
        </span>
      </div>

      {/* Visible test results */}
      <AnimatePresence>
        {visible.map((r, i) => (
          <TestRow key={i} index={i} result={r} label={`Test ${i + 1}`} />
        ))}
      </AnimatePresence>

      {/* Hidden test results (show pass/fail only) */}
      {hidden.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {hidden.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: visible.length * 0.05 + i * 0.03 }}
              className={`rounded-lg border p-2 font-code text-xs flex items-center justify-between ${
                r.passed
                  ? 'bg-lime/5 border-lime/30'
                  : 'bg-magenta/5 border-magenta/30'
              }`}
            >
              <span className="text-ink/50">Hidden test {i + 1}</span>
              <span className={r.passed ? 'text-lime font-bold' : 'text-magenta font-bold'}>
                {r.passed ? '✓' : '✗'}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
