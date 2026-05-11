'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Conveyor from '@/components/conveyor/Conveyor'
import StateStrip from '@/components/hud/StateStrip'
import Console from '@/components/code/Console'
import HintPanel from '@/components/code/HintPanel'
import { useCodeStore, usePuzzleStore } from '@/lib/store/index'
import { PROBLEMS } from '@/lib/problems/index'
import { initPyodide, runTests, runForViz, isPyodideReady } from '@/lib/runtime/runner'
import type { VizEvent } from '@/lib/viz/events'

const Editor = dynamic(() => import('@/components/code/Editor'), { ssr: false })

type ConveyorState = {
  belt: (number | string)[]
  left: number
  right: number
  markedBoxes: { index: number; color: string }[]
  notes: Record<string, unknown>
}

function deriveConveyorState(events: VizEvent[], upToIndex: number): ConveyorState {
  let belt: (number | string)[] = []
  let left = 0
  let right = 0
  const markedBoxes: { index: number; color: string }[] = []
  const notes: Record<string, unknown> = {}

  for (let i = 0; i <= Math.min(upToIndex, events.length - 1); i++) {
    const e = events[i]
    if (e.kind === 'setup') belt = e.data
    else if (e.kind === 'window') { left = e.left; right = e.right }
    else if (e.kind === 'mark') markedBoxes.push({ index: e.index, color: e.color })
    else if (e.kind === 'note') notes[e.label] = e.value
  }

  return { belt, left, right, markedBoxes, notes }
}

function ProblemTab({
  problem,
  active,
  solved,
  onClick,
}: {
  problem: (typeof PROBLEMS)[0]
  active: boolean
  solved: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-code transition-all ${
        active
          ? 'bg-iris/15 text-iris border border-iris/30'
          : 'text-ink/50 hover:text-ink/80 hover:bg-mist'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          solved ? 'bg-lime' : active ? 'bg-iris' : 'bg-ink/20'
        }`}
      />
      LC {problem.leetcodeNum}
      <span className={`hidden sm:inline ${problem.difficulty === 'Easy' ? 'text-lime' : 'text-solar'}`}>
        {problem.difficulty}
      </span>
    </button>
  )
}

export default function ActThree() {
  const {
    currentProblemIndex,
    problemStates,
    vizEvents,
    isRunning,
    testResults,
    setCurrentProblem,
    setCode,
    useHint,
    setRunning,
    setResults,
  } = useCodeStore()

  const { advanceAct } = usePuzzleStore()

  const [pyStatus, setPyStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [pyError, setPyError] = useState<string>('')
  const [vizIndex, setVizIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<'editor' | 'hints' | 'console'>('editor')
  const vizIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const problem = PROBLEMS[currentProblemIndex]
  const state = problemStates[currentProblemIndex]

  // Init Pyodide
  useEffect(() => {
    if (isPyodideReady()) {
      setPyStatus('ready')
      return
    }
    setPyStatus('loading')
    initPyodide().then(res => {
      if (res.ok) {
        setPyStatus('ready')
      } else {
        setPyStatus('error')
        setPyError(res.error ?? 'Unknown error')
      }
    })
  }, [])

  // Animate viz events playback
  useEffect(() => {
    if (vizEvents.length === 0) return
    setVizIndex(0)
    if (vizIntervalRef.current) clearInterval(vizIntervalRef.current)
    vizIntervalRef.current = setInterval(() => {
      setVizIndex(prev => {
        if (prev >= vizEvents.length - 1) {
          if (vizIntervalRef.current) clearInterval(vizIntervalRef.current)
          return prev
        }
        return prev + 1
      })
    }, 120)
    return () => {
      if (vizIntervalRef.current) clearInterval(vizIntervalRef.current)
    }
  }, [vizEvents])

  const handleRun = useCallback(async () => {
    if (isRunning || pyStatus !== 'ready') return
    setRunning(true)
    setActiveTab('console')

    try {
      const code = state.code

      // Extract function name from signature
      const match = problem.signature.match(/def (\w+)/)
      const funcName = match ? match[1] : 'solve'

      const [visibleResults, hiddenResults] = await Promise.all([
        runTests(code, funcName, problem.visibleTests),
        runTests(code, funcName, problem.hiddenTests),
      ])

      // Also get viz events from first visible test
      const vizRes = await runForViz(code, funcName, problem.visibleTests[0].args)

      setResults(visibleResults, hiddenResults, vizRes.events)
    } catch (err) {
      console.error('Run error:', err)
    } finally {
      setRunning(false)
    }
  }, [isRunning, pyStatus, state.code, problem, setRunning, setResults])

  const conveyorState = deriveConveyorState(vizEvents, vizIndex)
  const allSolved = problemStates.every(s => s.solved)

  // Derive a pseudo-belt from notes if no setup event
  const displayBelt = conveyorState.belt.length > 0
    ? conveyorState.belt
    : problem.visibleTests[0].args.flat().filter((v): v is number | string =>
        typeof v === 'number' || typeof v === 'string'
      )

  return (
    <div className="flex flex-col h-full">
      {/* Problem tabs */}
      <div className="flex items-center gap-1 p-3 border-b border-mist overflow-x-auto flex-shrink-0">
        {PROBLEMS.map((p, i) => (
          <ProblemTab
            key={p.id}
            problem={p}
            active={i === currentProblemIndex}
            solved={problemStates[i].solved}
            onClick={() => setCurrentProblem(i)}
          />
        ))}
        {allSolved && (
          <button
            className="ml-auto btn-primary text-xs py-1.5 px-3"
            onClick={() => advanceAct('act4')}
          >
            Act 4: Replay →
          </button>
        )}
      </div>

      {/* Main content - split */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Left: Conveyor + problem description */}
        <div className="flex flex-col gap-3 p-4 lg:w-1/2 overflow-y-auto border-b lg:border-b-0 lg:border-r border-mist">
          {/* Pyodide status */}
          {pyStatus === 'loading' && (
            <div className="flex items-center gap-2 text-solar font-code text-xs bg-solar/5 border border-solar/20 rounded-lg p-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-3 h-3 border-2 border-solar border-t-transparent rounded-full"
              />
              Loading Python runtime (~3s)...
            </div>
          )}
          {pyStatus === 'error' && (
            <div className="text-magenta font-code text-xs bg-magenta/5 border border-magenta/20 rounded-lg p-2">
              ⚠ Pyodide load failed: {pyError.slice(0, 120)}
            </div>
          )}

          {/* Problem title & prompt */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-code text-ink/40">LC {problem.leetcodeNum}</span>
              <span className={`text-xs font-code font-bold ${
                problem.difficulty === 'Easy' ? 'text-lime' : 'text-solar'
              }`}>
                {problem.difficulty}
              </span>
              {state.solved && (
                <span className="badge-solved">Solved</span>
              )}
            </div>
            <h3 className="font-display font-bold text-base text-ink mb-2">{problem.title}</h3>
            <p className="text-sm font-body text-ink/70 leading-relaxed">{problem.prompt}</p>
          </div>

          {/* Conveyor visualization */}
          {displayBelt.length > 0 && (
            <div className="bg-ink rounded-xl overflow-hidden border border-ink/10">
              <div className="px-3 py-1.5 border-b border-white/5 flex items-center justify-between">
                <span className="text-xs font-code text-white/30 uppercase tracking-widest">
                  Live Visualization
                </span>
                <span className="text-xs font-code text-cyan/50">
                  Frame {vizIndex + 1}/{vizEvents.filter(e => e.kind === 'frame').length || 1}
                </span>
              </div>
              <div style={{ background: '#0F172A' }}>
                <Conveyor
                  belt={displayBelt}
                  left={conveyorState.left}
                  right={Math.min(conveyorState.right, displayBelt.length - 1)}
                  markedBoxes={conveyorState.markedBoxes}
                  compact={true}
                />
              </div>
              {/* Notes */}
              {Object.keys(conveyorState.notes).length > 0 && (
                <div className="px-3 py-2 border-t border-white/5 flex gap-3 flex-wrap">
                  {Object.entries(conveyorState.notes).map(([k, v]) => (
                    <div key={k} className="font-code text-xs">
                      <span className="text-white/30">{k}:</span>{' '}
                      <span className="text-cyan">
                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Editor + hints + console */}
        <div className="flex flex-col lg:w-1/2 overflow-hidden">
          {/* Tab bar */}
          <div className="flex gap-1 p-2 border-b border-mist flex-shrink-0">
            {(['editor', 'hints', 'console'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded text-xs font-code capitalize transition-colors ${
                  activeTab === tab
                    ? 'bg-iris/15 text-iris'
                    : 'text-ink/50 hover:text-ink/80'
                }`}
              >
                {tab}
                {tab === 'console' && testResults.visible.length > 0 && (
                  <span className={`ml-1 ${
                    testResults.visible.every(r => r.passed) && testResults.hidden.every(r => r.passed)
                      ? 'text-lime'
                      : 'text-magenta'
                  }`}>
                    •
                  </span>
                )}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <button
                className={`btn-run text-xs py-1.5 px-4 ${
                  pyStatus !== 'ready' || isRunning ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleRun}
                disabled={pyStatus !== 'ready' || isRunning}
              >
                {isRunning ? '▶ Running...' : '▶ Run'}
              </button>
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'editor' && (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-3 h-full"
                >
                  <div className="text-xs font-code text-ink/30 mb-2">{problem.signature}</div>
                  <Editor
                    value={state.code}
                    onChange={(val) => setCode(currentProblemIndex, val)}
                    height="340px"
                  />
                </motion.div>
              )}

              {activeTab === 'hints' && (
                <motion.div
                  key="hints"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4"
                >
                  <HintPanel
                    hints={problem.hints}
                    hintsUsed={state.hintsUsed}
                    onReveal={() => useHint(currentProblemIndex)}
                  />
                </motion.div>
              )}

              {activeTab === 'console' && (
                <motion.div
                  key="console"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Console
                    visible={testResults.visible}
                    hidden={testResults.hidden}
                    isRunning={isRunning}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
