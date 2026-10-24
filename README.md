# DevJSON Studio

A premium, privacy-first JSON toolkit for developers. Format, validate, and minify JSON with instant syntax highlighting — entirely in your browser. **No data ever leaves your machine.**

<p align="center">
  <a href="https://devjson-studio-eta.vercel.app/" rel="nofollow"><strong>Live Demo →</strong></a>
</p>

![Live demo](https://img.shields.io/badge/Live_Demo-devjson--studio--eta.vercel.app-8b5cf6)
![Tech stack](https://img.shields.io/badge/React-19-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6) ![Vite](https://img.shields.io/badge/Vite-8-646cff) ![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8) ![License](https://img.shields.io/badge/License-MIT-green)

## Overview

DevJSON Studio is a client-side JSON workbench built with React 19 and Vite 8. It turns raw JSON into a readable, valid, or minified form through a two-panel workspace with live validation, token-based syntax highlighting, and a persistent dark/light theme. Because all parsing runs locally with the native `JSON.parse`/`JSON.stringify` engine, it is completely private: no backend, no analytics, no network traffic — the app works fully offline.

## Screenshot

<!-- Add a real screenshot here, e.g. save it as docs/screenshot.png and uncomment:
![DevJSON Studio interface](docs/screenshot.png)
-->
_Placeholder: add a screenshot of the two-panel workspace (e.g. `docs/screenshot.png`) here._

## Features

- **Formatter** — pretty-prints JSON with consistent 2-space indentation
- **Validator** — live validation with descriptive error messages, including the offending line and column
- **Minifier** — strips insignificant whitespace while preserving string contents
- **Two-panel workspace** — raw input on the left, colorized output on the right; stacks on mobile, side-by-side on desktop
- **Syntax highlighting** — keys, strings, numbers, booleans, `null`, and punctuation are color-coded
- **Copy & download** — one-click copy (`Ctrl+Shift+C`) or export as `data.json`
- **Sample JSON** — loads a realistic example so every tool can be tried instantly
- **Dark / light mode** — persisted across sessions, with no flash on startup
- **Status bar** — live Valid / Invalid / Empty badge, error location, and character counts

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

## Tech stack

| Layer | Technology |
| --- | --- |
| UI library | [React 19](https://react.dev/) |
| Language | [TypeScript 6](https://www.typescriptlang.org/) |
| Build tool | [Vite 8](https://vite.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) (via `@tailwindcss/vite`) |
| Icons | [lucide-react](https://lucide.dev/) |
| Testing | [Vitest 5](https://vitest.dev/) + [Testing Library](https://testing-library.com/) (jsdom) |
| Linting | [oxlint](https://oxc.rs/) |

## Getting started

Prerequisites: **Node.js 22.12+ or 24+** (required by Vite 8 and Vitest 5; tested on v24).

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# run the full unit-test suite (27 tests)
npm run test

# typecheck, lint, and build for production
npm run typecheck
npm run lint
npm run build

# preview the production build
npm run preview
```

## Project structure

```
src/
├── App.tsx                    # layout, state, actions & keyboard shortcuts
├── components/
│   ├── Header.tsx             # brand + theme toggle
│   ├── Panels.tsx             # toolbar, error banner, status bar
│   ├── HighlightedJson.tsx    # token-based syntax highlighting renderer
│   └── workspaceMeta.ts       # shared constants (button defs, panel styles)
└── lib/
    ├── jsonTools.ts           # format / minify / validate / tokenizer
    ├── jsonTools.test.ts      # unit tests for all JSON operations
    ├── types.ts               # shared types & color maps
    └── App.test.tsx           # integration tests (rendering & interactions)
```

## Testing

The suite covers the JSON engine (validation, formatting, minification, tokenizer, error-position detection) and the UI (formatting flow, sample loading, error banner, clear, clipboard, theme toggle) — **27 tests**, passing.

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

## License

Released under the [MIT License](LICENSE) — Copyright (c) 2026 Nagwa Adel.
