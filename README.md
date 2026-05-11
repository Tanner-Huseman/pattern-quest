# Pattern Quest — The Conveyor

> A puzzle game that teaches you to *feel* the sliding window pattern, then makes you code it for real LeetCode problems with a live visualizer running as your debugger.

## Prerequisites

- **Node.js** 18.17 or later
- **npm** 9 or later (comes with Node)

## Getting started

```bash
# 1. Clone the repo
git clone https://github.com/tanner-huseman/pattern-quest.git
cd pattern-quest

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Note:** Act 3 (Code Mode) loads the Python runtime (Pyodide) from a CDN on first use. This takes ~3–5 seconds on a 50 Mbps connection. Subsequent runs within the same session are instant.

## Other commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Production build (output to `.next/`) |
| `npm start` | Serve the production build locally |
| `npm run type-check` | Run TypeScript compiler without emitting |
| `npm run lint` | Run Next.js ESLint rules |

## Project structure

```
pattern-quest/
├── app/
│   ├── layout.tsx          # Root layout — fonts, theme
│   ├── page.tsx            # Landing page with demo conveyor
│   └── play/
│       └── page.tsx        # Main game (Act 1 → 4 state machine)
├── components/
│   ├── ActOne.tsx          # Discovery puzzles (P1–P5)
│   ├── ActTwo.tsx          # Reveal cinematic
│   ├── ActThree.tsx        # Code mode — Monaco + Pyodide + live viz
│   ├── ActFour.tsx         # Replay & share
│   ├── conveyor/
│   │   └── Conveyor.tsx    # Animated belt with window frame + pointers
│   ├── hud/
│   │   ├── StateStrip.tsx  # Live L/R/sum/length HUD
│   │   └── PuzzleControls.tsx
│   └── code/
│       ├── Editor.tsx      # Monaco editor (custom pq-dark theme)
│       ├── Console.tsx     # Test results
│       └── HintPanel.tsx   # Three-tier hint system
├── lib/
│   ├── puzzles/index.ts    # P1–P5 definitions + win-check helpers
│   ├── problems/index.ts   # LC 643, 3, 209, 567 — tests, hints, solutions
│   ├── viz/events.ts       # VizEvent + Replay types
│   ├── runtime/
│   │   ├── runner.ts       # Main-thread Comlink bridge to Pyodide worker
│   │   └── viz_shim.py.ts  # Python `viz` module injected into the worker
│   ├── store/index.ts      # Zustand stores (puzzle, code, replay)
│   └── storage.ts          # localStorage progress persistence
├── public/
│   └── pyodide-worker.js   # Self-contained Web Worker — loads Pyodide from CDN
└── styles/
    └── globals.css         # Tailwind + CSS custom properties for the palette
```

## How the viz API works (Act 3)

Your Python solution can call into the `viz` module to drive the conveyor animation in real time:

```python
def findMaxAverage(nums: list[int], k: int) -> float:
    viz.setup(nums)          # load the belt
    window_sum = sum(nums[:k])
    best = window_sum

    for right in range(k, len(nums)):
        window_sum += nums[right] - nums[right - k]
        best = max(best, window_sum)
        viz.window(right - k + 1, right)   # move the window frame
        viz.note("best_avg", round(best / k, 2))
        viz.frame()                         # commit this animation frame

    return best / k
```

| Method | Description |
|---|---|
| `viz.setup(data)` | Set the belt contents (list or str). Call once at the top. |
| `viz.window(left, right)` | Move the window frame. Both indices are inclusive. |
| `viz.note(label, value)` | Post an auxiliary value to the HUD. |
| `viz.frame()` | Commit the current state as one replay frame. |
| `viz.mark(index, color)` | Highlight a single box temporarily. |

## The four acts

| Act | Name | Time | What happens |
|---|---|---|---|
| 1 | Discovery | 10–15 min | Five wordless puzzles — you invent sliding window yourself |
| 2 | Reveal | 5 min | Your P5 solution replays while the canonical code types out in sync |
| 3 | Code Mode | 30–60 min | Write Python for LC 643 → LC 3 → LC 209 → LC 567 with the visualizer live |
| 4 | Replay | 2 min | Scrub through your boss-problem solve and share it |

Progress auto-saves to `localStorage` so you can quit and return at any point.

## Browser requirements

- Chrome 94+ / Edge 94+ / Firefox 79+ (requires `SharedArrayBuffer` — served with COOP/COEP headers in dev and on Vercel)
- Safari 15.2+ (limited SharedArrayBuffer support; Pyodide may fall back to synchronous mode)

## Deploying to Vercel

```bash
npm i -g vercel
vercel
```

No environment variables required — the app is fully static with no backend.
