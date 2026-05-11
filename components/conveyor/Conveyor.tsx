'use client'

import { useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type MarkedBox = {
  index: number
  color: string
}

export type ConveyorProps = {
  belt: (number | string)[]
  left: number
  right: number
  onWindowChange?: (l: number, r: number) => void
  draggable?: boolean
  windowKind?: 'fixed' | 'variable'
  windowSize?: number
  markedBoxes?: MarkedBox[]
  compact?: boolean
}

const PALETTE: Record<string, string> = {
  iris: '#6D28D9',
  cyan: '#06B6D4',
  magenta: '#EC4899',
  lime: '#84CC16',
  solar: '#F59E0B',
  ink: '#0F172A',
  cloud: '#F8FAFC',
  mist: '#EEF2FF',
}

function colorFor(key: string): string {
  return PALETTE[key] ?? key
}

export default function Conveyor({
  belt,
  left,
  right,
  onWindowChange,
  draggable = false,
  windowKind = 'fixed',
  windowSize,
  markedBoxes = [],
  compact = false,
}: ConveyorProps) {
  const BOX_SIZE = compact ? 48 : 64
  const GAP = compact ? 4 : 6
  const STRIDE = BOX_SIZE + GAP

  // Drag state
  const dragStartX = useRef<number>(0)
  const dragStartLeft = useRef<number>(0)
  const dragStartRight = useRef<number>(0)
  const isDragging = useRef<boolean>(false)
  const dragHandle = useRef<'left' | 'right' | 'window'>('window')

  const markedMap = new Map(markedBoxes.map(m => [m.index, m.color]))

  const windowLeft = Math.max(0, Math.min(left, belt.length - 1))
  const windowRight = Math.max(0, Math.min(right, belt.length - 1))

  const windowX = windowLeft * STRIDE
  const windowW = (windowRight - windowLeft) * STRIDE + BOX_SIZE

  // Mouse drag handlers for fixed window dragging
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, type: 'window' | 'left' | 'right') => {
      if (!draggable) return
      isDragging.current = true
      dragStartX.current = e.clientX
      dragStartLeft.current = left
      dragStartRight.current = right
      dragHandle.current = type
      e.preventDefault()
    },
    [draggable, left, right]
  )

  useEffect(() => {
    if (!draggable) return

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !onWindowChange) return
      const dx = e.clientX - dragStartX.current
      const deltaBoxes = Math.round(dx / STRIDE)

      if (dragHandle.current === 'window') {
        const size = dragStartRight.current - dragStartLeft.current
        const newLeft = Math.max(0, Math.min(belt.length - 1 - size, dragStartLeft.current + deltaBoxes))
        onWindowChange(newLeft, newLeft + size)
      } else if (dragHandle.current === 'left') {
        const newLeft = Math.max(0, Math.min(dragStartRight.current, dragStartLeft.current + deltaBoxes))
        onWindowChange(newLeft, dragStartRight.current)
      } else if (dragHandle.current === 'right') {
        const newRight = Math.max(dragStartLeft.current, Math.min(belt.length - 1, dragStartRight.current + deltaBoxes))
        onWindowChange(dragStartLeft.current, newRight)
      }
    }

    const onMouseUp = () => {
      isDragging.current = false
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [draggable, belt.length, onWindowChange, STRIDE])

  const totalWidth = belt.length * STRIDE - GAP

  return (
    <div className="relative overflow-x-auto py-10 px-4 select-none">
      {/* Belt track */}
      <div
        className="relative"
        style={{ width: totalWidth, minHeight: compact ? 80 : 100 }}
      >
        {/* Window frame */}
        <motion.div
          className="absolute top-0 rounded-xl border-2 border-cyan pointer-events-none"
          style={{
            left: windowX - 4,
            width: windowW + 8,
            height: BOX_SIZE,
            background: 'rgba(6,182,212,0.07)',
          }}
          animate={{ left: windowX - 4, width: windowW + 8 }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-xl" style={{
            boxShadow: '0 0 12px #06B6D4, 0 0 24px rgba(6,182,212,0.25)',
          }} />
        </motion.div>

        {/* Draggable window overlay */}
        {draggable && (
          <motion.div
            className="absolute top-0 rounded-xl cursor-grab active:cursor-grabbing z-10"
            style={{
              left: windowX - 4,
              width: windowW + 8,
              height: BOX_SIZE,
            }}
            animate={{ left: windowX - 4, width: windowW + 8 }}
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            onMouseDown={(e) => handleMouseDown(e, 'window')}
          />
        )}

        {/* Left pointer */}
        <motion.div
          className="absolute flex flex-col items-center pointer-events-none"
          style={{ top: -28, width: BOX_SIZE }}
          animate={{ left: windowLeft * STRIDE }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        >
          <span className="text-lime font-code text-xs font-bold">L</span>
          <span style={{ color: '#84CC16', fontSize: 16, lineHeight: 1 }}>▼</span>
        </motion.div>

        {/* Right pointer */}
        <motion.div
          className="absolute flex flex-col items-center pointer-events-none"
          style={{ top: -28, width: BOX_SIZE }}
          animate={{ left: windowRight * STRIDE }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        >
          <span className="text-magenta font-code text-xs font-bold">R</span>
          <span style={{ color: '#EC4899', fontSize: 16, lineHeight: 1 }}>▼</span>
        </motion.div>

        {/* Boxes */}
        <div className="flex" style={{ gap: GAP }}>
          {belt.map((val, i) => {
            const inWindow = i >= windowLeft && i <= windowRight
            const markColor = markedMap.get(i)

            return (
              <motion.div
                key={i}
                className="relative flex-shrink-0 flex flex-col items-center justify-center rounded-lg border-2 font-display font-bold"
                style={{
                  width: BOX_SIZE,
                  height: BOX_SIZE,
                  fontSize: compact ? 14 : 18,
                  backgroundColor: markColor
                    ? `${colorFor(markColor)}30`
                    : inWindow
                    ? 'rgba(6,182,212,0.12)'
                    : '#EEF2FF',
                  borderColor: markColor
                    ? colorFor(markColor)
                    : inWindow
                    ? '#06B6D4'
                    : 'rgba(109,40,217,0.15)',
                  color: inWindow ? '#0F172A' : '#475569',
                  zIndex: inWindow ? 2 : 1,
                }}
                animate={{
                  scale: markColor ? [1, 1.08, 1] : 1,
                }}
                transition={{ duration: 0.3 }}
                whileHover={draggable ? { scale: 1.05 } : {}}
              >
                <span>{val}</span>
                <span
                  className="absolute bottom-0.5 text-xs opacity-40 font-code"
                  style={{ fontSize: 9 }}
                >
                  {i}
                </span>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Variable window handle buttons */}
      {draggable && windowKind === 'variable' && onWindowChange && (
        <div className="mt-4 flex gap-4 justify-center">
          <div className="flex items-center gap-1">
            <span className="text-lime text-xs font-code">Left:</span>
            <button
              className="px-2 py-1 bg-lime/20 text-lime border border-lime/40 rounded font-bold text-sm hover:bg-lime/30 transition-colors"
              onClick={() => onWindowChange(Math.max(0, left - 1), right)}
            >
              ◀
            </button>
            <button
              className="px-2 py-1 bg-lime/20 text-lime border border-lime/40 rounded font-bold text-sm hover:bg-lime/30 transition-colors"
              onClick={() => onWindowChange(Math.min(right, left + 1), right)}
            >
              ▶
            </button>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-magenta text-xs font-code">Right:</span>
            <button
              className="px-2 py-1 bg-magenta/20 text-magenta border border-magenta/40 rounded font-bold text-sm hover:bg-magenta/30 transition-colors"
              onClick={() => onWindowChange(left, Math.max(left, right - 1))}
            >
              ◀
            </button>
            <button
              className="px-2 py-1 bg-magenta/20 text-magenta border border-magenta/40 rounded font-bold text-sm hover:bg-magenta/30 transition-colors"
              onClick={() => onWindowChange(left, Math.min(belt.length - 1, right + 1))}
            >
              ▶
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
