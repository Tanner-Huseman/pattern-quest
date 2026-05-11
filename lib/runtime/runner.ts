'use client'

import type { VizEvent } from '@/lib/viz/events'

export type RunResult = {
  ok: boolean
  result?: unknown
  events: VizEvent[]
  output: string
  error?: string
}

export type TestRunResult = {
  passed: boolean
  expected: unknown
  actual: unknown
  error?: string
  events: VizEvent[]
}

let workerInstance: Worker | null = null
let comlinkWorker: any = null
let initPromise: Promise<void> | null = null
let pyodideReady = false

function getWorker() {
  if (typeof window === 'undefined') return null
  if (!workerInstance) {
    workerInstance = new Worker('/pyodide-worker.js')
  }
  return workerInstance
}

async function ensureComlink() {
  if (comlinkWorker) return comlinkWorker
  if (initPromise) {
    await initPromise
    return comlinkWorker
  }

  initPromise = (async () => {
    const { wrap } = await import('comlink')
    const w = getWorker()
    if (!w) throw new Error('Worker not available')
    comlinkWorker = wrap(w)
  })()

  await initPromise
  return comlinkWorker
}

export async function initPyodide(): Promise<{ ok: boolean; error?: string }> {
  try {
    const cw = await ensureComlink()
    const result = await cw.init()
    if (result.ok) pyodideReady = true
    return result
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

export function isPyodideReady(): boolean {
  return pyodideReady
}

export async function runTests(
  userCode: string,
  funcName: string,
  testCases: { args: unknown[]; expected: unknown }[]
): Promise<TestRunResult[]> {
  const cw = await ensureComlink()
  const results: TestRunResult[] = []

  for (const tc of testCases) {
    try {
      const argsJson = JSON.stringify(tc.args)
      const res = await cw.runSingle(userCode, funcName, argsJson)

      let actual = res.result
      // Normalize boolean comparison
      if (typeof tc.expected === 'boolean' && typeof actual === 'string') {
        if (actual === 'True') actual = true
        if (actual === 'False') actual = false
      }

      results.push({
        passed: deepEqual(actual, tc.expected),
        expected: tc.expected,
        actual,
        error: res.ok ? undefined : res.error,
        events: res.events || [],
      })
    } catch (err) {
      results.push({
        passed: false,
        expected: tc.expected,
        actual: null,
        error: String(err),
        events: [],
      })
    }
  }

  return results
}

export async function runForViz(
  userCode: string,
  funcName: string,
  args: unknown[]
): Promise<RunResult> {
  try {
    const cw = await ensureComlink()
    const argsJson = JSON.stringify(args)
    const res = await cw.runSingle(userCode, funcName, argsJson)
    return {
      ok: res.ok,
      result: res.result,
      events: res.events || [],
      output: res.output || '',
      error: res.error,
    }
  } catch (err) {
    return {
      ok: false,
      events: [],
      output: '',
      error: String(err),
    }
  }
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a === 'number' && typeof b === 'number') {
    return Math.abs(a - b) < 1e-5
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((v, i) => deepEqual(v, b[i]))
  }
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    const ka = Object.keys(a as Record<string, unknown>)
    const kb = Object.keys(b as Record<string, unknown>)
    if (ka.length !== kb.length) return false
    return ka.every(k =>
      deepEqual(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k]
      )
    )
  }
  return false
}
