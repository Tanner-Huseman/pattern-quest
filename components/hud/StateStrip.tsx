'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { computeWindowSum, computeWindowChars } from '@/lib/puzzles/index'
import type { HudConfig } from '@/lib/puzzles/index'

type Props = {
  belt: (number | string)[]
  left: number
  right: number
  hud: HudConfig
  additions?: number
  budget?: number
  cap?: number
}

export default function StateStrip({ belt, left, right, hud, additions, budget, cap }: Props) {
  const sum = hud.showSum ? computeWindowSum(belt, left, right) : 0
  const length = right - left + 1
  const chars = hud.showHashmap ? computeWindowChars(belt, left, right) : null

  const overBudget = budget !== undefined && additions !== undefined && additions > budget
  const overCap = cap !== undefined && sum > cap

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-ink/5 border border-ink/10 rounded-xl font-code text-sm flex-wrap">
      {hud.showLeft && (
        <Stat label="L" value={left} color="lime" />
      )}
      {hud.showRight && (
        <Stat label="R" value={right} color="magenta" />
      )}
      {hud.showSum && (
        <AnimatedStat
          label="Sum"
          value={sum}
          color={overCap ? 'solar' : 'cyan'}
          flash={!overCap}
        />
      )}
      {hud.showLength && (
        <Stat label="Len" value={length} color="iris" />
      )}
      {hud.showAdditions && additions !== undefined && (
        <Stat
          label="Adds"
          value={additions}
          color={overBudget ? 'magenta' : 'solar'}
          suffix={budget !== undefined ? `/${budget}` : ''}
        />
      )}
      {hud.showHashmap && chars && (
        <div className="flex items-center gap-1">
          <span className="text-ink/40">Map:</span>
          <span className="text-cyan">
            {'{'}
            {Array.from(chars.entries())
              .map(([k, v]) => `${k}:${v}`)
              .join(', ')}
            {'}'}
          </span>
        </div>
      )}
    </div>
  )
}

function Stat({
  label,
  value,
  color,
  suffix = '',
}: {
  label: string
  value: number | string
  color: string
  suffix?: string
}) {
  const colorClass = {
    lime: 'text-lime',
    magenta: 'text-magenta',
    cyan: 'text-cyan',
    iris: 'text-iris',
    solar: 'text-solar',
  }[color] ?? 'text-ink'

  return (
    <div className="flex items-center gap-1 tabular-nums">
      <span className="text-ink/40">{label}:</span>
      <span className={`font-bold ${colorClass}`}>
        {value}{suffix}
      </span>
    </div>
  )
}

function AnimatedStat({
  label,
  value,
  color,
  flash,
}: {
  label: string
  value: number
  color: string
  flash: boolean
}) {
  const colorClass = {
    lime: 'text-lime',
    cyan: 'text-cyan',
    solar: 'text-solar',
    magenta: 'text-magenta',
  }[color] ?? 'text-ink'

  return (
    <div className="flex items-center gap-1 tabular-nums">
      <span className="text-ink/40">{label}:</span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          className={`font-bold ${colorClass}`}
          initial={{ scale: 1.3, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 600, damping: 20 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
