const STORAGE_KEY = 'pq_progress'
const SCHEMA_VERSION = 1

export type Progress = {
  schemaVersion: number
  currentAct: string
  currentPuzzleIndex: number
  puzzlesSolved: boolean[]
  currentProblemIndex: number
  problemsSolved: boolean[]
  savedAt: number
}

export function saveProgress(data: Omit<Progress, 'schemaVersion' | 'savedAt'>): void {
  if (typeof window === 'undefined') return
  try {
    const progress: Progress = {
      ...data,
      schemaVersion: SCHEMA_VERSION,
      savedAt: Date.now(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // ignore storage errors
  }
}

export function loadProgress(): Progress | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Progress
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function clearProgress(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}
