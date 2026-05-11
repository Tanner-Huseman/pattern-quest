export type PaletteKey = 'iris' | 'cyan' | 'magenta' | 'lime' | 'solar' | 'ink' | 'cloud' | 'mist'

export type VizEvent =
  | { kind: 'setup'; data: (number | string)[] }
  | { kind: 'window'; left: number; right: number; t: number }
  | { kind: 'note'; label: string; value: string | number | object; t: number }
  | { kind: 'frame'; t: number }
  | { kind: 'mark'; index: number; color: PaletteKey; t: number }

export type Replay = {
  problemId: string
  startedAt: number
  finishedAt: number
  events: VizEvent[]
  code: string
}

export function encodeReplay(replay: Replay): string {
  return btoa(encodeURIComponent(JSON.stringify(replay)))
}

export function decodeReplay(encoded: string): Replay | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded))) as Replay
  } catch {
    return null
  }
}
