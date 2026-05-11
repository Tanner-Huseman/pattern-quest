'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Conveyor from '@/components/conveyor/Conveyor'
import { useCodeStore, useReplayStore, usePuzzleStore } from '@/lib/store/index'
import { PROBLEMS } from '@/lib/problems/index'
import type { VizEvent } from '@/lib/viz/events'
import { encodeReplay } from '@/lib/viz/events'

function deriveConveyorFromEvents(events: VizEvent[], upToIndex: number) {
  let belt: (number | string)[] = []
  let left = 0
  let right = 0
  const markedBoxes: { index: number; color: string }[] = []

  for (let i = 0; i <= Math.min(upToIndex, events.length - 1); i++) {
    const e = events[i]
    if (e.kind === 'setup') belt = e.data
    else if (e.kind === 'window') { left = e.left; right = e.right }
    else if (e.kind === 'mark') markedBoxes.push({ index: e.index, color: e.color })
  }

  return { belt, left, right, markedBoxes }
}

export default function ActFour() {
  const { problemStates, vizEvents: storeEvents } = useCodeStore()
  const { advanceAct } = usePuzzleStore()
  const { saveReplay } = useReplayStore()

  const [handle, setHandle] = useState('')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [playIdx, setPlayIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Use LC567 (last problem) events, or fallback to any available
  const lc567State = problemStates[3]
  const events: VizEvent[] = lc567State.lastEvents.length > 0
    ? lc567State.lastEvents
    : storeEvents.length > 0
    ? storeEvents
    : []

  const totalFrames = events.length

  useEffect(() => {
    if (!isPlaying) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setPlayIdx(prev => {
        if (prev >= totalFrames - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, Math.round(120 / speed))
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, speed, totalFrames])

  const conveyorState = deriveConveyorFromEvents(events, playIdx)

  const displayBelt = conveyorState.belt.length > 0
    ? conveyorState.belt
    : PROBLEMS[3].visibleTests[0].args.filter(
        (v): v is string => typeof v === 'string'
      ).flatMap(s => s.split(''))

  const handleShare = useCallback(() => {
    const replay = {
      problemId: 'lc567',
      startedAt: Date.now() - 60000,
      finishedAt: Date.now(),
      events,
      code: lc567State.code,
    }
    saveReplay(replay)
    const encoded = encodeReplay(replay)
    const url = `${window.location.origin}/play?replay=${encoded}`
    setShareUrl(url)
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }, [events, lc567State.code, saveReplay])

  const handlePlayPause = () => {
    if (playIdx >= totalFrames - 1) {
      setPlayIdx(0)
    }
    setIsPlaying(p => !p)
  }

  const progress = totalFrames > 0 ? (playIdx / Math.max(totalFrames - 1, 1)) * 100 : 0

  const problem = PROBLEMS[3]
  const linesOfCode = lc567State.code.split('\n')
  const currentLineHint = Math.min(
    Math.floor((playIdx / Math.max(totalFrames - 1, 1)) * linesOfCode.length),
    linesOfCode.length - 1
  )

  return (
    <div className="flex flex-col min-h-screen p-6 gap-6"
      style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E1040 100%)' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-iris font-code text-xs tracking-widest uppercase mb-1">Act 4</p>
        <h2 className="font-display font-bold text-3xl text-cloud mb-1">Replay & Share</h2>
        <p className="text-cloud/40 text-sm font-body">Watch your solve. Share your pattern mastery.</p>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PROBLEMS.map((p, i) => (
          <div
            key={p.id}
            className={`rounded-xl p-3 border text-center ${
              problemStates[i].solved
                ? 'bg-lime/10 border-lime/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="font-display font-bold text-lg text-cloud">
              {problemStates[i].solved ? '✓' : '–'}
            </div>
            <div className="font-code text-xs text-cloud/40">LC {p.leetcodeNum}</div>
            {problemStates[i].solved && (
              <div className="text-lime text-xs font-code mt-1">
                {problemStates[i].attempts} attempt{problemStates[i].attempts !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Replay player */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-ink rounded-2xl border border-white/10 overflow-hidden"
      >
        <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
          <span className="font-code text-xs text-white/30 uppercase tracking-widest">
            LC {problem.leetcodeNum} — {problem.title}
          </span>
          {totalFrames === 0 && (
            <span className="text-xs font-code text-solar/60">
              Run LC 567 in Act 3 to see replay
            </span>
          )}
        </div>

        {/* Conveyor visualization */}
        <div style={{ background: '#0F172A' }}>
          {displayBelt.length > 0 ? (
            <Conveyor
              belt={displayBelt}
              left={conveyorState.left}
              right={Math.min(conveyorState.right, displayBelt.length - 1)}
              markedBoxes={conveyorState.markedBoxes}
              compact={false}
            />
          ) : (
            <div className="h-24 flex items-center justify-center text-white/20 font-code text-sm">
              No visualization data — run LC 567 first
            </div>
          )}
        </div>

        {/* Code scroll (synced line highlight) */}
        {lc567State.code && lc567State.code !== problem.starterCode && (
          <div className="border-t border-white/5 p-3 max-h-40 overflow-y-auto">
            {linesOfCode.map((line, i) => (
              <div
                key={i}
                className={`font-code text-xs leading-relaxed px-2 rounded transition-colors ${
                  i === currentLineHint
                    ? 'bg-cyan/15 text-cyan'
                    : 'text-white/30'
                }`}
              >
                {line || ' '}
              </div>
            ))}
          </div>
        )}

        {/* Playback controls */}
        <div className="px-4 py-3 border-t border-white/5">
          {/* Progress bar */}
          <div
            className="w-full h-1.5 bg-white/10 rounded-full mb-3 cursor-pointer"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const ratio = (e.clientX - rect.left) / rect.width
              setPlayIdx(Math.floor(ratio * totalFrames))
            }}
          >
            <motion.div
              className="h-full bg-cyan rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30"
              onClick={() => setPlayIdx(0)}
              disabled={totalFrames === 0}
            >
              ⏮
            </button>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center bg-iris hover:bg-iris/80 text-white transition-colors disabled:opacity-30"
              onClick={handlePlayPause}
              disabled={totalFrames === 0}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-30"
              onClick={() => { setPlayIdx(totalFrames - 1); setIsPlaying(false) }}
              disabled={totalFrames === 0}
            >
              ⏭
            </button>

            {/* Speed */}
            <div className="flex items-center gap-1 ml-2">
              {[1, 1.5, 2].map(s => (
                <button
                  key={s}
                  className={`text-xs font-code px-2 py-1 rounded transition-colors ${
                    speed === s
                      ? 'bg-iris/30 text-iris'
                      : 'text-white/30 hover:text-white/60'
                  }`}
                  onClick={() => setSpeed(s)}
                >
                  {s}x
                </button>
              ))}
            </div>

            <span className="ml-auto font-code text-xs text-white/30">
              {playIdx + 1}/{totalFrames || '–'}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Share section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-iris/10 border border-iris/20 rounded-2xl p-5"
      >
        <h3 className="font-display font-bold text-cloud mb-3">Share Your Solve</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="Your handle (optional)"
            value={handle}
            onChange={e => setHandle(e.target.value)}
            className="flex-1 bg-ink/60 border border-white/10 rounded-lg px-3 py-2 text-sm font-code text-cloud placeholder-white/20 focus:border-iris/50 outline-none"
          />
          <button
            className="btn-primary"
            onClick={handleShare}
          >
            {copied ? '✓ Copied!' : 'Share →'}
          </button>
        </div>

        {shareUrl && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-ink/40 rounded-lg p-2 font-code text-xs text-cyan/70 break-all"
          >
            {shareUrl.slice(0, 80)}...
          </motion.div>
        )}
      </motion.div>

      {/* Restart button */}
      <div className="flex justify-center gap-4">
        <button
          className="btn-secondary"
          onClick={() => advanceAct('act3')}
        >
          ← Back to Lab
        </button>
        <button
          className="btn-secondary"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/play'
            }
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
