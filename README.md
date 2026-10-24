# DevJSON Studio

A premium, privacy-first JSON toolkit for developers. Format, validate, and minify JSON with instant syntax highlighting — entirely in your browser. **No data ever leaves your machine.**

![Tech stack](https://img.shields.io/badge/React-19-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6) ![Vite](https://img.shields.io/badge/Vite-8-646cff) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)

## Features

### Core tools
- **Formatter** — pretty-prints JSON with 2-space indentation
- **Validator** — live validation with descriptive error messages, including the offending **line & column**
- **Minifier** — strips all insignificant whitespace while preserving string contents

### Interface
- **Two-panel workspace** — raw input on the left, colorized output on the right (responsive: stacks on mobile, side-by-side on desktop)
- **Syntax highlighting** — keys, strings, numbers, booleans, `null`, and punctuation are color-coded
- **Copy** — one click (or `Ctrl+Shift+C`) to copy the transformed result
- **Download** — exports the output as `data.json`
- **Sample JSON** — loads a realistic example so you can try every tool instantly
- **Dark / Light mode** — persisted across sessions, with no flash on startup
- **Shared toolbar** — a single compact action bar above both panels keeps Format / Minify / Validate / Sample / Clear on the left and Copy / Download on the right, so it stays on one row at desktop widths
- **Status bar** — live Valid / Invalid / Empty badge, error location, and in/out character counts

### Keyboard shortcuts
| Shortcut | Action |
| --- | --- |
| `Ctrl+Shift+F` | Format |
| `Ctrl+Shift+M` | Minify |
| `Ctrl+Shift+V` | Validate |
| `Ctrl+Shift+J` | Load sample JSON |
| `Ctrl+Shift+X` | Clear both panels |
| `Ctrl+Shift+C` | Copy output |
| `Ctrl+Shift+S` | Download output |
| `Ctrl+Shift+L` | Toggle dark / light theme |

### Privacy
All parsing is performed locally with the native `JSON.parse`/`JSON.stringify` engine. There is no backend, no analytics, and no network traffic — the app works fully offline.

## Getting started

Prerequisites: **Node.js 22.12+ or 24+** (required by Vite 8 and Vitest 5; tested on v24).

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# run the full unit-test suite
npm run test

# typecheck + lint + production build
npm run typecheck
npm run lint
npm run build

# preview the production build
npm run preview
```

## Project structure

```
├── src/
│   ├── App.tsx                      # layout, state, actions & keyboard shortcuts
│   ├── components/
│   │   ├── Header.tsx               # brand + theme toggle
│   │   ├── Panels.tsx               # WorkspaceToolbar, error banner, StatusBar, EmptyOutput
│   │   ├── HighlightedJson.tsx      # token-based syntax highlighting renderer
│   │   └── workspaceMeta.ts         # shared constants (button defs, panel styles)
│   ├── lib/
│   │   ├── jsonTools.ts             # format / minify / validate / tokenizer
│   │   ├── jsonTools.test.ts        # unit tests for all JSON operations
│   │   ├── types.ts                 # shared types & color maps
│   │   └── App.test.tsx             # integration tests (rendering & interactions)
│   └── setupTests.ts                # testing-library + jest-dom wiring
├── vite.config.ts                   # Vite + React + Tailwind v4 + Vitest config
└── package.json
```

## Testing

The suite covers the JSON engine (validation, formatting, minification, tokenizer, error-position detection) and the UI (formatting flow, sample loading, error banner, clear, clipboard, theme toggle) — **27 tests**, all passing.

```bash
npm run test
```

## Error reporting details

`jsonTools.ts` extracts error locations in two steps:
1. Uses the engine-provided `position N` from `SyntaxError` messages when available.
2. When V8 omits it (e.g. *"Unexpected token ']' ... is not valid JSON"*), a prefix-scan fallback classifies truncation artifacts and pinpoints the first genuinely uncontinuable prefix (±1 character).

Presentation is handled by `formatJsonError`: any location info the engine embedded in the message tail (`… in JSON at position 10 (line 2 column 9)`, or legacy `(line X, column Y)` suffixes) is stripped so it is **never displayed twice**. The cleaned short message is rendered separately from an independent `Line X · Column Y` chip, which shows an `≈` marker when the position comes from the heuristic fallback and no location chip at all when even the approximation is unknown.

## Known limitations

- Error line/column detection is approximate (±1 character) when the engine does not report an exact position.
- Extremely large inputs (> ~20 KB for error location fallback) skip the prefix-scan for performance; the pointer then may default to the start of the document.
- Single indent size (2 spaces) is currently used by the Formatter.

## License

MIT
